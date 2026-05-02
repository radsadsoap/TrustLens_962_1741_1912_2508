import {
    X,
    PlayCircleIcon,
    WarningCircle,
    FilmStripIcon,
} from "@phosphor-icons/react";
import { useEffect, useRef, useState, useCallback } from "react";
import type { FrameAnalysis } from "../services/api";

interface FrameDetailModalProps {
    frames: FrameAnalysis[];
    videoUrl: string;
    onClose: () => void;
    initialFrameIndex?: number;
}

const regionColors: Record<
    string,
    { stroke: string; fill: string; label: string }
> = {
    face_blur: {
        stroke: "rgba(160, 80, 255, 0.95)",
        fill: "rgba(160, 80, 255, 0.15)",
        label: "Face",
    },
    blur_anomaly: {
        stroke: "rgba(255, 140, 0, 0.9)",
        fill: "rgba(255, 140, 0, 0.12)",
        label: "Blur",
    },
    lighting_inconsistency: {
        stroke: "rgba(255, 0, 200, 0.9)",
        fill: "rgba(255, 0, 200, 0.12)",
        label: "Lighting",
    },
    edge_inconsistency: {
        stroke: "rgba(255, 220, 0, 0.85)",
        fill: "rgba(255, 220, 0, 0.1)",
        label: "Edge",
    },
};

const defaultColor = {
    stroke: "rgba(255, 220, 0, 0.85)",
    fill: "rgba(255, 220, 0, 0.1)",
    label: "Anomaly",
};

export default function FrameDetailModal({
    frames,
    videoUrl,
    onClose,
    initialFrameIndex = 0,
}: FrameDetailModalProps) {
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [selectedIndex, setSelectedIndex] = useState(initialFrameIndex);

    const selectedFrame = frames[selectedIndex];

    const drawArtifacts = useCallback(() => {
        const video = videoRef.current;
        const canvas = canvasRef.current;
        if (!video || !canvas || !selectedFrame) return;

        const containerW = video.clientWidth;
        const containerH = video.clientHeight;
        canvas.width = containerW;
        canvas.height = containerH;

        const ctx = canvas.getContext("2d");
        if (!ctx) return;
        ctx.clearRect(0, 0, containerW, containerH);

        const videoW = video.videoWidth;
        const videoH = video.videoHeight;
        if (!videoW || !videoH) return;

        const videoAspect = videoW / videoH;
        const containerAspect = containerW / containerH;

        let renderedW: number,
            renderedH: number,
            offsetX: number,
            offsetY: number;
        if (videoAspect > containerAspect) {
            renderedW = containerW;
            renderedH = containerW / videoAspect;
        } else {
            renderedH = containerH;
            renderedW = containerH * videoAspect;
        }
        offsetX = (containerW - renderedW) / 2;
        offsetY = (containerH - renderedH) / 2;

        const regions = selectedFrame.artifact_regions ?? [];
        regions.forEach((region) => {
            const x = offsetX + region.x * renderedW;
            const y = offsetY + region.y * renderedH;
            const w = region.width * renderedW;
            const h = region.height * renderedH;
            const style = regionColors[region.type] ?? defaultColor;

            ctx.fillStyle = style.fill;
            ctx.fillRect(x, y, w, h);
            ctx.strokeStyle = style.stroke;
            ctx.lineWidth = 2;
            ctx.strokeRect(x, y, w, h);

            const label = `${style.label} ${Math.round(region.confidence * 100)}%`;
            ctx.font = "bold 11px sans-serif";
            const labelW = ctx.measureText(label).width + 8;
            const labelH = 18;
            ctx.fillStyle = style.stroke;
            ctx.fillRect(x, y - labelH, labelW, labelH);
            ctx.fillStyle = "white";
            ctx.fillText(label, x + 4, y - 5);
        });
    }, [selectedFrame]);

    useEffect(() => {
        if (selectedFrame && videoRef.current) {
            videoRef.current.currentTime = selectedFrame.timestamp;
        }
    }, [selectedFrame]);

    useEffect(() => {
        const video = videoRef.current;
        if (!video) return;
        const onLoaded = () => drawArtifacts();
        const onSeeked = () => drawArtifacts();
        video.addEventListener("loadeddata", onLoaded);
        video.addEventListener("seeked", onSeeked);
        drawArtifacts();
        return () => {
            video.removeEventListener("loadeddata", onLoaded);
            video.removeEventListener("seeked", onSeeked);
        };
    }, [drawArtifacts]);

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, "0")}`;
    };

    const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
        if (e.target === e.currentTarget) {
            onClose();
        }
    };

    if (!selectedFrame) return null;

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4"
            onClick={handleOverlayClick}
        >
            <div className="bg-gray-950 border border-gray-300 rounded-lg max-w-7xl w-full max-h-[90vh] overflow-hidden flex flex-col relative">
                {/* Content */}
                <div className="flex-1 overflow-hidden flex">
                    {/* Left: Video + Details */}
                    <div className="flex-1 p-4">
                        <div className="space-y-4 relative">
                            {/* Video */}
                            <div className="bg-black rounded-xl overflow-hidden border border-gray-800 relative">
                                <video
                                    ref={videoRef}
                                    src={videoUrl}
                                    className="w-full aspect-video object-contain"
                                />
                                <canvas
                                    ref={canvasRef}
                                    className="absolute top-0 left-0 w-full h-full pointer-events-none"
                                />
                            </div>

                            <div className="absolute top-2 left-2">
                                {/* Frame Info */}
                                <div className="bg-gray-900/80 border py-1 px-2 border-gray-800 rounded-lg">
                                    <p className="font-mono font-bold text-white">
                                        <span className="text-gray-400 font-normal">
                                            Time:
                                        </span>{" "}
                                        <span className="text-red-400">
                                            {formatTime(
                                                selectedFrame.timestamp,
                                            )}
                                        </span>{" "}
                                        <span className="text-gray-600 mx-2">
                                            |
                                        </span>{" "}
                                        <span className="text-gray-400 font-normal">
                                            Frame:
                                        </span>{" "}
                                        #{selectedFrame.frame_number}
                                    </p>
                                </div>
                            </div>
                            {selectedFrame.anomalies &&
                                selectedFrame.anomalies.length > 0 && (
                                    <div className="bg-gray-900/50 border border-gray-800 p-4 rounded-lg flex items-center justify-between">
                                        <h4 className="text-sm font-semibold text-white ">
                                            Detected Anomalies
                                        </h4>
                                        <div className="flex flex-wrap gap-2">
                                            {selectedFrame.anomalies.map(
                                                (anomaly, idx) => (
                                                    <span
                                                        key={idx}
                                                        className="bg-red-900/30 border border-red-500/30 text-red-300 px-3 py-1 rounded-full text-xs font-medium"
                                                    >
                                                        {anomaly}
                                                    </span>
                                                ),
                                            )}
                                        </div>
                                    </div>
                                )}
                        </div>
                    </div>

                    {/* Right: Frame List */}
                    <div className="w-80 border-l border-gray-300 bg-gray-950/50 overflow-y-auto custom-scrollbar">
                        <div className="p-4 border-b border-gray-300 sticky top-0 bg-gray-950/90 backdrop-blur-sm flex items-center justify-between">
                            <h3 className="font-semibold text-white flex items-center gap-2">
                                <FilmStripIcon size={25} />
                                All {frames.length} Suspicious Frames
                            </h3>
                            <button
                                onClick={onClose}
                                className="p-1 rounded-lg bg-gray-800 hover:bg-gray-700 border border-gray-700 flex items-center justify-center transition-colors"
                            >
                                <X size={20} className="text-gray-400" />
                            </button>
                        </div>
                        <div className="p-3 grid grid-cols-2 gap-4">
                            {frames
                                .sort((a, b) => a.timestamp - b.timestamp)
                                .map((frame, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => setSelectedIndex(idx)}
                                        className={`w-full text-left p-3 rounded-lg transition-all ${
                                            selectedIndex === idx
                                                ? "bg-red-500/20 border-2 border-red-500/50"
                                                : "bg-gray-900/50 border border-gray-800 hover:border-red-500/30"
                                        }`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <div
                                                className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${
                                                    selectedIndex === idx
                                                        ? "bg-red-500/20 border border-red-500/40"
                                                        : "bg-gray-800 border border-gray-700"
                                                }`}
                                            >
                                                <PlayCircleIcon
                                                    size={20}
                                                    className={
                                                        selectedIndex === idx
                                                            ? "text-red-400"
                                                            : "text-gray-500"
                                                    }
                                                    weight="fill"
                                                />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p
                                                    className={`font-mono text-sm font-bold mb-1 ${
                                                        selectedIndex === idx
                                                            ? "text-red-400"
                                                            : "text-gray-300"
                                                    }`}
                                                >
                                                    {formatTime(
                                                        frame.timestamp,
                                                    )}
                                                </p>
                                                <div className="flex items-center gap-2">
                                                    <span className="text-xs font-semibold text-red-400">
                                                        {Math.round(
                                                            frame.confidence *
                                                                100,
                                                        )}
                                                        %
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </button>
                                ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
