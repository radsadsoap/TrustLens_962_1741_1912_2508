from pydantic import BaseModel, Field
from typing import Optional, List, Dict
from datetime import datetime
from enum import Enum


class AnalysisStatus(str, Enum):
    PENDING = "pending"
    PROCESSING = "processing"
    COMPLETED = "completed"
    FAILED = "failed"


class DeepfakeResult(str, Enum):
    REAL = "real"
    FAKE = "fake"
    UNCERTAIN = "uncertain"


class VideoUploadResponse(BaseModel):
    message: str
    video_id: str
    filename: str
    size_mb: float


class ArtifactRegion(BaseModel):
    """Represents a region in the frame where an artifact was detected"""
    x: float  # X coordinate (0-1 normalized)
    y: float  # Y coordinate (0-1 normalized)
    width: float  # Width (0-1 normalized)
    height: float  # Height (0-1 normalized)
    type: str  # Type of artifact (e.g., "blur", "lighting", "edge_inconsistency")
    confidence: float  # Confidence in this specific artifact


class FrameAnalysis(BaseModel):
    frame_number: int
    timestamp: float
    confidence: float
    is_fake: bool
    anomalies: List[str] = []
    artifact_regions: List[ArtifactRegion] = []  # Spatial locations of artifacts


class SpatialAnalysis(BaseModel):
    facial_inconsistencies: float = Field(..., ge=0.0, le=1.0)
    lighting_anomalies: float = Field(..., ge=0.0, le=1.0)
    artifact_detection: float = Field(..., ge=0.0, le=1.0)
    overall_score: float = Field(..., ge=0.0, le=1.0)


class TemporalAnalysis(BaseModel):
    frame_continuity: float = Field(..., ge=0.0, le=1.0)
    motion_consistency: float = Field(..., ge=0.0, le=1.0)
    temporal_artifacts: float = Field(..., ge=0.0, le=1.0)
    overall_score: float = Field(..., ge=0.0, le=1.0)


class AnalysisResult(BaseModel):
    video_id: str
    status: AnalysisStatus
    result: Optional[DeepfakeResult] = None
    confidence: Optional[float] = Field(None, ge=0.0, le=1.0)
    overall_score: Optional[float] = Field(None, ge=0.0, le=1.0)
    
    # Progress tracking (populated during processing)
    frames_processed: Optional[int] = None
    total_frames: Optional[int] = None
    
    # Detailed analysis
    spatial_analysis: Optional[SpatialAnalysis] = None
    temporal_analysis: Optional[TemporalAnalysis] = None
    
    # Frame-level analysis
    suspicious_frames: Optional[List[FrameAnalysis]] = None
    total_frames_analyzed: Optional[int] = None
    
    # Metadata
    processing_time_seconds: Optional[float] = None
    analyzed_at: Optional[datetime] = None
    
    # Recommendations
    explanation: Optional[str] = None
    recommendations: Optional[List[str]] = None


class ErrorResponse(BaseModel):
    error: str
    detail: Optional[str] = None
    timestamp: datetime = Field(default_factory=datetime.now)
