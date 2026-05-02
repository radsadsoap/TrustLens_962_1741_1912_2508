import {
    ShareNetworkIcon,
    CheckCircle,
    WarningCircle,
    Clock,
    SpinnerGap,
    PlayCircleIcon,
    EyeIcon,
    LightningIcon,
    MagnifyingGlassPlusIcon,
    CaretDoubleDown,
} from "@phosphor-icons/react";
import { useState, useRef, useEffect, useCallback } from "react";
import type { AnalysisResult } from "../services/api";
import FrameDetailModal from "./FrameDetailModal";

interface AnalysisProps {
    hasVideo: boolean;
    onRunAnalysis: () => void;
    analysisResult: AnalysisResult | null;
    onSeekToTimestamp?: (timestamp: number) => void;
    videoUrl?: string;
}

export default function Analysis({
    hasVideo,
    onRunAnalysis,
    analysisResult,
    onSeekToTimestamp,
    videoUrl,
}: AnalysisProps) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedFrameIndex, setSelectedFrameIndex] = useState(0);
    const [showScrollHint, setShowScrollHint] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);

    const checkScrollable = useCallback(() => {
        const el = scrollRef.current;
        if (!el) return;
        const isScrollable = el.scrollHeight > el.clientHeight;
        const isAtBottom =
            el.scrollHeight - el.scrollTop - el.clientHeight < 20;
        setShowScrollHint(isScrollable && !isAtBottom);
    }, []);

    useEffect(() => {
        checkScrollable();
        const el = scrollRef.current;
        if (!el) return;
        el.addEventListener("scroll", checkScrollable);
        const ro = new ResizeObserver(checkScrollable);
        ro.observe(el);
        return () => {
            el.removeEventListener("scroll", checkScrollable);
            ro.disconnect();
        };
    }, [analysisResult, checkScrollable]);

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, "0")}`;
    };

    const getResultColor = (result?: string) => {
        switch (result) {
            case "real":
                return "text-green-400";
            case "fake":
                return "text-red-400";
            case "uncertain":
                return "text-yellow-400";
            default:
                return "text-gray-400";
        }
    };

    const getResultBgColor = (result?: string) => {
        switch (result) {
            case "real":
                return "bg-green-500/10 border-green-500/30";
            case "fake":
                return "bg-red-500/10 border-red-500/30";
            case "uncertain":
                return "bg-yellow-500/10 border-yellow-500/30";
            default:
                return "bg-gray-500/10 border-gray-500/30";
        }
    };

    const getResultIcon = (result?: string) => {
        switch (result) {
            case "real":
                return (
                    <CheckCircle
                        size={32}
                        className="text-green-400"
                        weight="duotone"
                    />
                );
            case "fake":
                return (
                    <WarningCircle
                        size={32}
                        className="text-red-400"
                        weight="duotone"
                    />
                );
            case "uncertain":
                return (
                    <Clock
                        size={32}
                        className="text-yellow-400"
                        weight="duotone"
                    />
                );
            default:
                return null;
        }
    };

    const renderProgressBar = (
        label: string,
        value: number,
        isDanger: boolean = false,
    ) => {
        const percentage = Math.round(value * 100);
        const colorClass = isDanger
            ? percentage > 50
                ? "bg-red-500"
                : "bg-yellow-500"
            : percentage > 50
              ? "bg-green-500"
              : "bg-yellow-500";

        return (
            <div className="space-y-1.5">
                <div className="flex justify-between items-center text-xs">
                    <span className="text-gray-400">{label}</span>
                    <span className="font-semibold text-white">
                        {percentage}%
                    </span>
                </div>
                <div className="w-full bg-gray-800/50 rounded-full h-2 overflow-hidden">
                    <div
                        className={`h-full ${colorClass} transition-all duration-500`}
                        style={{ width: `${percentage}%` }}
                    />
                </div>
            </div>
        );
    };

    const renderStatus = () => {
        if (!analysisResult) return null;

        switch (analysisResult.status) {
            case "pending":
            case "processing": {
                const framesProcessed = analysisResult.frames_processed || 0;
                const totalFrames = analysisResult.total_frames || 0;
                const progressPct =
                    totalFrames > 0
                        ? Math.round((framesProcessed / totalFrames) * 100)
                        : 0;

                return (
                    <div className="flex flex-col items-center justify-center gap-3">
                        {/* Battery progress bar */}
                        <div className="w-full rounded-xl border border-blue-500/40 bg-gray-900/80 p-1 shadow-lg shadow-blue-500/10">
                            <div className="relative w-full h-10 rounded-lg overflow-hidden bg-gray-800/60">
                                <div
                                    className="absolute inset-y-0 left-0 rounded-lg transition-all duration-700 ease-out"
                                    style={{
                                        width: `${progressPct}%`,
                                        background:
                                            "linear-gradient(90deg, #2563eb, #3b82f6, #60a5fa)",
                                        boxShadow:
                                            "0 0 12px rgba(59,130,246,0.5)",
                                    }}
                                />
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <span className="text-sm font-bold text-white drop-shadow-md tracking-wide">
                                        {totalFrames > 0
                                            ? `Frame ${framesProcessed} / ${totalFrames}  —  ${progressPct}%`
                                            : "Extracting frames"}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                );
            }

            case "failed":
                return (
                    <div className="bg-red-500/10 border border-red-500/30 p-6 rounded-lg">
                        <div className="flex items-start gap-3">
                            <WarningCircle
                                size={24}
                                className="text-red-400 flex-shrink-0 mt-0.5"
                            />
                            <div>
                                <p className="text-red-400 font-semibold mb-1">
                                    Analysis Failed
                                </p>
                                <p className="text-sm text-gray-300">
                                    {analysisResult.explanation ||
                                        "An error occurred during analysis"}
                                </p>
                            </div>
                        </div>
                    </div>
                );

            case "completed":
                return (
                    <div className="space-y-4 overflow-y-auto flex-1">
                        {/* Verdict Card */}
                        <div
                            className="relative overflow-hidden rounded-lg border border-gray-700 h-32 transition-all duration-500"
                            style={{
                                background: `linear-gradient(to right, ${
                                    analysisResult.result === "fake"
                                        ? "#dc2626"
                                        : analysisResult.result === "real"
                                          ? "#16a34a"
                                          : "#eab308"
                                } ${(analysisResult.confidence || 0) * 100}%, rgba(0, 0, 0, 0.4) ${(analysisResult.confidence || 0) * 100}%)`,
                            }}
                        >
                            {/* Top Right - Confidence Label */}
                            <div className="absolute top-4 right-4">
                                <span className="text-xs font-medium text-white/80 uppercase tracking-wider">
                                    Confidence
                                </span>
                            </div>

                            {/* Center - Result */}

                            <h3 className="text-xl p-4 font-black text-white drop-shadow-2xl tracking-tight">
                                {analysisResult.result?.toUpperCase()}
                            </h3>

                            {/* Bottom Right - Percentage */}
                            <div className="absolute bottom-4 right-4">
                                <span className="text-3xl font-bold text-white drop-shadow-lg">
                                    {(
                                        (analysisResult.confidence || 0) * 100
                                    ).toFixed(1)}
                                    %
                                </span>
                            </div>
                        </div>

                        {/* Explanation */}
                        {analysisResult.explanation && (
                            <div className="bg-gray-900/50 border border-gray-700 p-5 rounded-lg">
                                <div className="flex items-center gap-2 mb-3">
                                    <LightningIcon
                                        size={18}
                                        className="text-red-400"
                                    />
                                    <h4 className="font-semibold text-white">
                                        Analysis Summary
                                    </h4>
                                </div>
                                <p className="text-sm text-gray-300 leading-relaxed">
                                    {analysisResult.explanation}
                                </p>
                            </div>
                        )}

                        {/* Detection Metrics */}
                        {(analysisResult.spatial_analysis ||
                            analysisResult.temporal_analysis) && (
                            <div className="bg-gray-900/50 border border-gray-700 p-5 rounded-lg">
                                <div className="flex items-center gap-2 mb-4">
                                    <EyeIcon
                                        size={18}
                                        className="text-red-400"
                                    />
                                    <h4 className="font-semibold text-white">
                                        Detection Metrics
                                    </h4>
                                </div>
                                <div className="grid grid-cols-2 gap-2.5">
                                    {analysisResult.spatial_analysis && (
                                        <>
                                            <div className="bg-gray-800/50 p-3 rounded-lg border border-gray-700/50">
                                                <div className="text-xs text-gray-400 mb-1">
                                                    Facial
                                                </div>
                                                <div
                                                    className={`text-lg font-bold ${
                                                        analysisResult
                                                            .spatial_analysis
                                                            .facial_inconsistencies >
                                                        0.5
                                                            ? "text-red-400"
                                                            : "text-yellow-400"
                                                    }`}
                                                >
                                                    {Math.round(
                                                        analysisResult
                                                            .spatial_analysis
                                                            .facial_inconsistencies *
                                                            100,
                                                    )}
                                                    %
                                                </div>
                                            </div>
                                            <div className="bg-gray-800/50 p-3 rounded-lg border border-gray-700/50">
                                                <div className="text-xs text-gray-400 mb-1">
                                                    Lighting
                                                </div>
                                                <div
                                                    className={`text-lg font-bold ${
                                                        analysisResult
                                                            .spatial_analysis
                                                            .lighting_anomalies >
                                                        0.5
                                                            ? "text-red-400"
                                                            : "text-yellow-400"
                                                    }`}
                                                >
                                                    {Math.round(
                                                        analysisResult
                                                            .spatial_analysis
                                                            .lighting_anomalies *
                                                            100,
                                                    )}
                                                    %
                                                </div>
                                            </div>
                                            <div className="bg-gray-800/50 p-3 rounded-lg border border-gray-700/50">
                                                <div className="text-xs text-gray-400 mb-1">
                                                    Artifacts
                                                </div>
                                                <div
                                                    className={`text-lg font-bold ${
                                                        analysisResult
                                                            .spatial_analysis
                                                            .artifact_detection >
                                                        0.5
                                                            ? "text-red-400"
                                                            : "text-yellow-400"
                                                    }`}
                                                >
                                                    {Math.round(
                                                        analysisResult
                                                            .spatial_analysis
                                                            .artifact_detection *
                                                            100,
                                                    )}
                                                    %
                                                </div>
                                            </div>
                                        </>
                                    )}
                                    {analysisResult.temporal_analysis && (
                                        <>
                                            <div className="bg-gray-800/50 p-3 rounded-lg border border-gray-700/50">
                                                <div className="text-xs text-gray-400 mb-1">
                                                    Continuity
                                                </div>
                                                <div
                                                    className={`text-lg font-bold ${
                                                        analysisResult
                                                            .temporal_analysis
                                                            .frame_continuity >
                                                        0.5
                                                            ? "text-green-400"
                                                            : "text-red-400"
                                                    }`}
                                                >
                                                    {Math.round(
                                                        analysisResult
                                                            .temporal_analysis
                                                            .frame_continuity *
                                                            100,
                                                    )}
                                                    %
                                                </div>
                                            </div>
                                            <div className="bg-gray-800/50 p-3 rounded-lg border border-gray-700/50">
                                                <div className="text-xs text-gray-400 mb-1">
                                                    Motion
                                                </div>
                                                <div
                                                    className={`text-lg font-bold ${
                                                        analysisResult
                                                            .temporal_analysis
                                                            .motion_consistency >
                                                        0.5
                                                            ? "text-green-400"
                                                            : "text-red-400"
                                                    }`}
                                                >
                                                    {Math.round(
                                                        analysisResult
                                                            .temporal_analysis
                                                            .motion_consistency *
                                                            100,
                                                    )}
                                                    %
                                                </div>
                                            </div>
                                            <div className="bg-gray-800/50 p-3 rounded-lg border border-gray-700/50">
                                                <div className="text-xs text-gray-400 mb-1">
                                                    Temporal
                                                </div>
                                                <div
                                                    className={`text-lg font-bold ${
                                                        analysisResult
                                                            .temporal_analysis
                                                            .temporal_artifacts >
                                                        0.5
                                                            ? "text-red-400"
                                                            : "text-yellow-400"
                                                    }`}
                                                >
                                                    {Math.round(
                                                        analysisResult
                                                            .temporal_analysis
                                                            .temporal_artifacts *
                                                            100,
                                                    )}
                                                    %
                                                </div>
                                            </div>
                                        </>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Suspicious Frames Summary */}
                        {analysisResult.suspicious_frames &&
                            analysisResult.suspicious_frames.filter(
                                (f) => f.is_fake,
                            ).length > 0 && (
                                <div className="bg-red-500/10 border border-red-500/30 p-5 rounded-lg">
                                    <div className="flex items-center gap-3 mb-3">
                                        <div className="w-10 h-10 rounded-lg bg-red-500/20 border border-red-500/40 flex items-center justify-center flex-shrink-0">
                                            <WarningCircle
                                                size={24}
                                                className="text-red-400"
                                                weight="duotone"
                                            />
                                        </div>
                                        <div className="flex-1">
                                            <h4 className="font-semibold text-white">
                                                Suspicious Frames Detected
                                            </h4>
                                            <p className="text-sm text-gray-400">
                                                Found{" "}
                                                <span className="text-red-400 font-bold">
                                                    {
                                                        analysisResult.suspicious_frames.filter(
                                                            (f) => f.is_fake,
                                                        ).length
                                                    }
                                                </span>{" "}
                                                suspicious frame
                                                {analysisResult.suspicious_frames.filter(
                                                    (f) => f.is_fake,
                                                ).length > 1
                                                    ? "s"
                                                    : ""}{" "}
                                                with potential deepfake
                                                indicators
                                            </p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => {
                                            setSelectedFrameIndex(0);
                                            setIsModalOpen(true);
                                        }}
                                        className="w-full bg-red-600/80 hover:bg-red-600 border border-red-500/50 hover:border-red-500 text-white text-sm font-semibold py-3 rounded-lg transition-all flex items-center justify-center gap-2"
                                    >
                                        <MagnifyingGlassPlusIcon
                                            size={16}
                                            weight="bold"
                                        />
                                        View All Frames
                                    </button>
                                </div>
                            )}

                        {/* Recommendations */}
                        {analysisResult.recommendations &&
                            analysisResult.recommendations.length > 0 && (
                                <div className="bg-yellow-500/5 border border-yellow-500/20 p-5 rounded-lg">
                                    <h4 className="font-semibold mb-3 text-yellow-400">
                                        Recommendations
                                    </h4>
                                    <ul className="space-y-2 text-sm text-gray-300">
                                        {analysisResult.recommendations.map(
                                            (rec, idx) => (
                                                <li
                                                    key={idx}
                                                    className="flex gap-2 items-start"
                                                >
                                                    <span className="text-yellow-500 mt-1">
                                                        •
                                                    </span>
                                                    <span className="leading-relaxed">
                                                        {rec}
                                                    </span>
                                                </li>
                                            ),
                                        )}
                                    </ul>
                                </div>
                            )}

                        {/* Metrics Footer */}
                        {analysisResult.total_frames_analyzed && (
                            <div className="flex items-center justify-between text-xs text-gray-500 pt-2 border-t border-gray-800">
                                <span>
                                    {analysisResult.total_frames_analyzed}{" "}
                                    frames analyzed
                                </span>
                                {analysisResult.processing_time_seconds && (
                                    <span>
                                        {analysisResult.processing_time_seconds}
                                        s processing
                                    </span>
                                )}
                            </div>
                        )}
                    </div>
                );
        }
    };

    const scrollToBottom = () => {
        scrollRef.current?.scrollBy({ top: 150, behavior: "smooth" });
    };

    return (
        <div className="w-1/4 border-l border-gray-50 p-4 flex flex-col gap-4 overflow-hidden relative">
            <h2 className="text-2xl font-semibold flex items-center gap-2 tracking-wide">
                <ShareNetworkIcon weight="duotone" /> Analysis
            </h2>

            {!hasVideo ? (
                <div className="flex-1 flex items-center justify-center">
                    <div className="text-center space-y-2">
                        <ShareNetworkIcon
                            size={48}
                            className="text-gray-50 mx-auto mb-3"
                            weight="duotone"
                        />
                        <p className="text-gray-400 text-sm">
                            Upload a video to begin analysis
                        </p>
                    </div>
                </div>
            ) : !analysisResult ? (
                <div className="flex flex-col gap-4">
                    <div className="bg-gray-900/50 border border-gray-700 p-5 rounded-lg">
                        <p className="text-gray-300 text-sm leading-relaxed mb-4">
                            Video ready. Click below to analyze for deepfake
                            detection.
                        </p>
                        <button
                            onClick={onRunAnalysis}
                            className="w-full bg-gradient-to-r from-red-600 to-red-500 hover:from-red-700 hover:to-red-600 px-6 py-3 cursor-pointer transition duration-200 flex items-center gap-2 justify-center font-semibold rounded-lg shadow-lg shadow-red-500/20"
                        >
                            <PlayCircleIcon size={20} weight="fill" />
                            Run Analysis
                        </button>
                    </div>
                </div>
            ) : (
                <div ref={scrollRef} className="flex-1 overflow-y-auto">
                    {renderStatus()}
                </div>
            )}

            {/* Scroll hint */}
            {showScrollHint && (
                <button
                    onClick={scrollToBottom}
                    className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-gray-800/90 border border-gray-600/50 text-gray-400 hover:text-white rounded-full p-1.5 shadow-lg backdrop-blur-sm transition-all cursor-pointer"
                    aria-label="Scroll down for more"
                >
                    <CaretDoubleDown size={16} weight="bold" />
                </button>
            )}

            {/* Frame Detail Modal */}
            {videoUrl && isModalOpen && analysisResult?.suspicious_frames && (
                <FrameDetailModal
                    frames={analysisResult.suspicious_frames.filter(
                        (f) => f.is_fake,
                    )}
                    videoUrl={videoUrl}
                    onClose={() => setIsModalOpen(false)}
                    initialFrameIndex={selectedFrameIndex}
                />
            )}
        </div>
    );
}
