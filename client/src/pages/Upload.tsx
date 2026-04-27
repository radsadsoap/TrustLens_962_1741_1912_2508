import { useState, useRef } from "react";
import Player from "../components/Player";
import Analysis from "../components/Analysis";
import CustomVideoPlayer, {
    type VideoPlayerHandle,
} from "../components/CustomVideoPlayer";
import { apiService, type AnalysisResult } from "../services/api";

export default function Upload() {
    const videoPlayerRef = useRef<VideoPlayerHandle>(null);
    const [videoFile, setVideoFile] = useState<File | null>(null);
    const [videoUrl, setVideoUrl] = useState<string | null>(null);
    const [videoId, setVideoId] = useState<string | null>(null);
    const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(
        null,
    );

    const handleVideoUpload = (file: File) => {
        setVideoFile(file);
        setVideoUrl(URL.createObjectURL(file));
        setVideoId(null);
        setAnalysisResult(null);
    };

    const pollAnalysisResult = async (id: string) => {
        try {
            const result = await apiService.getAnalysisResult(id);
            setAnalysisResult(result);
            if (result.status === "pending" || result.status === "processing") {
                setTimeout(() => pollAnalysisResult(id), 2000);
            }
        } catch (error) {
            console.error("Error fetching analysis:", error);
        }
    };

    const handleRunAnalysis = async () => {
        if (!videoFile) return;
        setAnalysisResult({ video_id: "", status: "processing" });
        try {
            await apiService.checkHealth();
        } catch {
            setAnalysisResult({
                video_id: "",
                status: "failed",
                explanation:
                    "Cannot reach backend. Start the server with: cd server && docker compose up --build",
            });
            return;
        }
        try {
            const response = await apiService.uploadVideo(videoFile);
            setVideoId(response.video_id);
            await apiService.triggerAnalysis(response.video_id);
            pollAnalysisResult(response.video_id);
        } catch (error) {
            setAnalysisResult({
                video_id: "",
                status: "failed",
                explanation:
                    error instanceof Error
                        ? error.message
                        : "Analysis failed. Make sure the backend is running on port 8000.",
            });
        }
    };

    const handleChangeVideo = () => {
        setVideoFile(null);
        setVideoUrl(null);
        setVideoId(null);
        setAnalysisResult(null);
    };

    const handleSeekToTimestamp = (timestamp: number) => {
        if (videoPlayerRef.current) {
            videoPlayerRef.current.seekTo(timestamp);
        }
    };

    return (
        <main className="flex w-full flex-1 gap-6 overflow-hidden bg-black font-mono px-4">
            <div className="flex-1 flex min-w-0">
                {!videoUrl ? (
                    <Player
                        videoUrl={videoUrl}
                        onVideoUpload={handleVideoUpload}
                    />
                ) : (
                    <div className="w-3/4 p-4 flex flex-col gap-4">
                        <h2 className="text-2xl font-semibold tracking-wide">
                            Uploaded Video
                        </h2>
                        <CustomVideoPlayer
                            ref={videoPlayerRef}
                            videoUrl={videoUrl}
                            suspiciousFrames={
                                analysisResult?.suspicious_frames ?? undefined
                            }
                            onChangeVideo={handleChangeVideo}
                        />
                    </div>
                )}
                <Analysis
                    hasVideo={!!videoUrl}
                    onRunAnalysis={handleRunAnalysis}
                    analysisResult={analysisResult}
                    onSeekToTimestamp={handleSeekToTimestamp}
                    videoUrl={videoUrl || undefined}
                />
            </div>
        </main>
    );
}
