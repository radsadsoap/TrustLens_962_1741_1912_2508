from fastapi import APIRouter, UploadFile, File, HTTPException, BackgroundTasks
from app.models import VideoUploadResponse, AnalysisResult, ErrorResponse
from app.services.video_service import VideoService
from app.services.hybrid_detector import HybridSpatialTemporalDetector
import uuid
import os
import asyncio
import logging
from concurrent.futures import ThreadPoolExecutor

logger = logging.getLogger(__name__)
router = APIRouter()
video_service = VideoService()
_executor = ThreadPoolExecutor(max_workers=1)

# Detector is initialised lazily inside the executor thread on first analysis,
# so the server starts and can serve /health immediately without waiting for
# large model weights to load into memory.
_detector: HybridSpatialTemporalDetector | None = None


def _ensure_detector_and_analyze(file_path: str, video_id: str, progress_callback=None) -> AnalysisResult:
    """
    Runs in the executor thread (never on the event loop).
    Initialises the detector on first call, then runs inference.
    """
    global _detector
    if _detector is None:
        logger.info("Initialising Hybrid Spatial-Temporal Detector...")
        _detector = HybridSpatialTemporalDetector()
        logger.info("Detector ready.")
    return _detector.analyze_video(file_path, video_id, progress_callback=progress_callback)

# In-memory storage for analysis results (in production, use a database)
analysis_cache: dict[str, AnalysisResult] = {}
# Separate progress tracker (plain dict, reliable cross-thread mutation)
progress_cache: dict[str, dict] = {}


@router.post("/upload", response_model=VideoUploadResponse)
async def upload_video(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...)
):
    """
    Upload a video file for deepfake analysis.
    """
    try:
        # Validate file
        video_service.validate_video(file)
        
        # Generate unique ID
        video_id = str(uuid.uuid4())
        
        # Save video
        file_path = await video_service.save_video(file, video_id)
        
        # Get file size
        file_size_mb = os.path.getsize(file_path) / (1024 * 1024)
        
        # Initialize analysis status
        analysis_cache[video_id] = AnalysisResult(
            video_id=video_id,
            status="pending"
        )
        
        # Don't auto-start analysis - wait for manual trigger
        
        return VideoUploadResponse(
            message="Video uploaded successfully. Ready for analysis.",
            video_id=video_id,
            filename=file.filename,
            size_mb=round(file_size_mb, 2)
        )
    
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Upload failed: {str(e)}")


@router.get("/analysis/{video_id}", response_model=AnalysisResult)
async def get_analysis_result(video_id: str):
    """
    Get the analysis result for a specific video.
    """
    if video_id not in analysis_cache:
        raise HTTPException(status_code=404, detail="Video analysis not found")
    
    result = analysis_cache[video_id]
    # Merge live progress into the response
    if video_id in progress_cache:
        prog = progress_cache[video_id]
        result = result.model_copy(update=prog)
    return result


@router.post("/analyze/{video_id}")
async def trigger_analysis(video_id: str, background_tasks: BackgroundTasks):
    """
    Manually trigger analysis for an uploaded video.
    """
    if video_id not in analysis_cache:
        raise HTTPException(status_code=404, detail="Video not found")
    
    result = analysis_cache[video_id]
    if result.status == "processing":
        raise HTTPException(status_code=409, detail="Analysis already in progress")
    
    # Find the uploaded file — it may have any allowed extension
    from app.config import settings
    file_path = next(
        (
            f"uploads/{video_id}{ext}"
            for ext in settings.allowed_extensions_list
            if os.path.exists(f"uploads/{video_id}{ext}")
        ),
        None,
    )
    if not file_path:
        raise HTTPException(status_code=404, detail="Video file not found")
    
    # Reset and schedule analysis
    analysis_cache[video_id].status = "pending"
    background_tasks.add_task(analyze_video_task, video_id, file_path)
    
    return {"message": "Analysis triggered", "video_id": video_id}


async def analyze_video_task(video_id: str, file_path: str):
    """
    Background task — runs the Hybrid Spatial-Temporal detector on a video.
    The detector is CPU-bound and synchronous; run_in_executor keeps the
    event loop free so polling and other requests are still served.
    """
    try:
        analysis_cache[video_id].status = "processing"
        logger.info(f"Starting analysis for video {video_id}")

        def progress_callback(frames_done: int, total_frames: int):
            progress_cache[video_id] = {
                "frames_processed": frames_done,
                "total_frames": total_frames,
            }

        loop = asyncio.get_event_loop()
        result = await loop.run_in_executor(
            _executor, _ensure_detector_and_analyze, file_path, video_id, progress_callback
        )

        analysis_cache[video_id] = result
        progress_cache.pop(video_id, None)
        logger.info(f"Analysis completed for video {video_id}: {result.result}")

    except Exception as e:
        logger.error(f"Analysis failed for video {video_id}: {e}")
        analysis_cache[video_id].status = "failed"
        analysis_cache[video_id].explanation = f"Analysis failed: {str(e)}"
