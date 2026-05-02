import {
    BookOpenIcon,
    ShieldCheckIcon,
    PlayIcon,
    WarningCircleIcon,
    RocketLaunchIcon,
    LightbulbIcon,
    InfoIcon,
    UsersThreeIcon,
    MaskHappyIcon,
    MicrophoneIcon,
    RobotIcon,
    FilmSlateIcon,
    CheckCircleIcon,
    TrendUpIcon,
    EyeIcon,
} from "@phosphor-icons/react";
import DocsNav from "../components/DocsNav";

export default function Docs() {
    return (
        <main className="flex w-full flex-1 overflow-hidden bg-black text-gray-200 font-sans selection:bg-red-500/30">
            <div
                id="docs-content"
                className="w-3/4 overflow-y-auto py-12 scroll-smooth"
            >
                <div className="px-8 space-y-24">
                    {/* Header Section */}
                    <header className="space-y-6">
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 text-sm font-semibold tracking-wide uppercase">
                            <BookOpenIcon size={16} weight="bold" />
                            Project Documentation
                        </div>
                        <h1 className="text-5xl lg:text-6xl font-bold tracking-tight text-white mb-6">
                            TrustLens{" "}
                            <span className="text-transparent bg-clip-text bg-linear-to-r from-red-600 to-red-400">
                                Documentation
                            </span>
                        </h1>
                        <p className="text-xl text-gray-400 leading-relaxed">
                            Everything you need to know about using TrustLens to
                            detect deepfake videos.
                        </p>
                    </header>

                    {/* What is TrustLens */}
                    <section id="what-is-trustlens" className="space-y-6">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center">
                                <InfoIcon size={20} className="text-red-400" />
                            </div>
                            <h2 className="text-3xl font-bold text-white">
                                What is TrustLens?
                            </h2>
                        </div>
                        <div className="space-y-4 text-gray-300 leading-relaxed">
                            <p>
                                <span className="font-semibold text-white">
                                    TrustLens
                                </span>{" "}
                                is an AI-powered deepfake detection platform
                                that helps you verify the authenticity of video
                                content. As manipulated media becomes
                                increasingly sophisticated and accessible,
                                TrustLens provides a critical tool for
                                identifying artificially generated or altered
                                videos.
                            </p>
                            <p>
                                Built as an academic research project, TrustLens
                                combines advanced computer vision techniques
                                with deep learning models to analyze videos
                                frame-by-frame, detecting subtle inconsistencies
                                that indicate digital manipulation.
                            </p>
                        </div>
                    </section>

                    {/* Why It Matters */}
                    <section id="why-it-matters" className="space-y-6">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center">
                                <ShieldCheckIcon
                                    size={20}
                                    className="text-red-400"
                                />
                            </div>
                            <h2 className="text-3xl font-bold text-white">
                                Why Deepfake Detection Matters
                            </h2>
                        </div>
                        <div className="space-y-4 text-gray-300 leading-relaxed">
                            <p>
                                Deepfake technology has democratized video
                                manipulation, making it easier than ever to
                                create convincing fake videos of real people.
                                This poses serious risks:
                            </p>
                            <div className="grid gap-4 mt-6">
                                <div className="p-5 rounded-lg bg-gray-900/50 border border-gray-800">
                                    <h4 className="font-semibold text-white mb-2">
                                        Misinformation & Fake News
                                    </h4>
                                    <p className="text-sm text-gray-400">
                                        Fabricated videos of public figures can
                                        spread false information, manipulate
                                        public opinion, and undermine trust in
                                        authentic media.
                                    </p>
                                </div>
                                <div className="p-5 rounded-lg bg-gray-900/50 border border-gray-800">
                                    <h4 className="font-semibold text-white mb-2">
                                        Identity Theft & Fraud
                                    </h4>
                                    <p className="text-sm text-gray-400">
                                        Deepfakes can be used to impersonate
                                        individuals for financial scams,
                                        blackmail, or unauthorized access to
                                        secure systems.
                                    </p>
                                </div>
                                <div className="p-5 rounded-lg bg-gray-900/50 border border-gray-800">
                                    <h4 className="font-semibold text-white mb-2">
                                        Erosion of Trust
                                    </h4>
                                    <p className="text-sm text-gray-400">
                                        As deepfakes become more prevalent,
                                        people may begin to doubt all video
                                        evidence, making it harder to establish
                                        truth.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* How to Use */}
                    <section id="how-to-use" className="space-y-6">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center">
                                <PlayIcon size={20} className="text-red-400" />
                            </div>
                            <h2 className="text-3xl font-bold text-white">
                                How to Use TrustLens
                            </h2>
                        </div>
                        <div className="space-y-6">
                            <p className="text-gray-300 leading-relaxed">
                                Using TrustLens is straightforward. Follow these
                                steps to analyze a video:
                            </p>

                            <div className="space-y-4">
                                <div className="flex gap-4">
                                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-red-500/20 border border-red-500/30 flex items-center justify-center text-red-400 font-bold">
                                        1
                                    </div>
                                    <div className="flex-1">
                                        <h4 className="font-semibold text-white mb-2">
                                            Upload Your Video
                                        </h4>
                                        <p className="text-sm text-gray-400 leading-relaxed">
                                            Navigate to the Upload page and
                                            either click "Upload Video" or drag
                                            and drop your video file. Supported
                                            formats include MP4, AVI, MOV, MKV,
                                            and WebM (up to 100 MB).
                                        </p>
                                    </div>
                                </div>

                                <div className="flex gap-4">
                                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-red-500/20 border border-red-500/30 flex items-center justify-center text-red-400 font-bold">
                                        2
                                    </div>
                                    <div className="flex-1">
                                        <h4 className="font-semibold text-white mb-2">
                                            Run the Analysis
                                        </h4>
                                        <p className="text-sm text-gray-400 leading-relaxed">
                                            Once your video is uploaded, click
                                            the "Run Analysis" button. TrustLens
                                            will extract frames from your video
                                            and analyze each frame for signs of
                                            manipulation. This process typically
                                            takes 20-60 seconds depending on
                                            video length.
                                        </p>
                                    </div>
                                </div>

                                <div className="flex gap-4">
                                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-red-500/20 border border-red-500/30 flex items-center justify-center text-red-400 font-bold">
                                        3
                                    </div>
                                    <div className="flex-1">
                                        <h4 className="font-semibold text-white mb-2">
                                            Review the Results
                                        </h4>
                                        <p className="text-sm text-gray-400 leading-relaxed">
                                            The analysis panel will display a
                                            verdict (REAL, FAKE, or UNCERTAIN)
                                            along with a confidence score.
                                            You'll also see detailed metrics
                                            including spatial and temporal
                                            analysis, suspicious frame
                                            timestamps, and recommendations.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-8 p-5 rounded-lg bg-red-900/10 border border-red-500/20">
                                <div className="flex items-start gap-3">
                                    <LightbulbIcon
                                        size={20}
                                        className="text-red-400 mt-1 flex-shrink-0"
                                    />
                                    <div>
                                        <h4 className="font-semibold text-red-400 mb-2">
                                            Pro Tip
                                        </h4>
                                        <p className="text-sm text-gray-300 leading-relaxed">
                                            Click on any timestamp in the
                                            "Detected Anomalies Timeline" to
                                            jump directly to that moment in the
                                            video and see the suspicious frame
                                            for yourself.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Understanding Results */}
                    <section id="understanding-results" className="space-y-6">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center">
                                <BookOpenIcon
                                    size={20}
                                    className="text-red-400"
                                />
                            </div>
                            <h2 className="text-3xl font-bold text-white">
                                Understanding the Results
                            </h2>
                        </div>
                        <div className="space-y-6">
                            <p className="text-gray-300 leading-relaxed text-lg">
                                TrustLens provides comprehensive analysis
                                results to help you understand whether a video
                                has been manipulated:
                            </p>

                            {/* Verdict Section */}
                            <div className="p-6 rounded-xl bg-gradient-to-br from-gray-900/80 to-gray-800/50 border border-gray-700 shadow-xl">
                                <div className="flex items-center gap-3 mb-4">
                                    <CheckCircleIcon
                                        size={24}
                                        className="text-red-400"
                                    />
                                    <h4 className="font-bold text-white text-lg">
                                        Verdict
                                    </h4>
                                </div>
                                <div className="space-y-3">
                                    <div className="flex items-start gap-4 p-4 rounded-lg bg-green-500/5 border border-green-500/20">
                                        <div className="w-16 h-16 rounded-lg bg-green-500/10 border border-green-500/30 flex items-center justify-center flex-shrink-0">
                                            <CheckCircleIcon
                                                size={28}
                                                className="text-green-400"
                                                weight="duotone"
                                            />
                                        </div>
                                        <div>
                                            <span className="text-green-400 font-bold text-base font-mono">
                                                REAL
                                            </span>
                                            <p className="text-gray-300 text-sm mt-1">
                                                The video appears authentic with
                                                minimal signs of manipulation
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-4 p-4 rounded-lg bg-red-500/5 border border-red-500/20">
                                        <div className="w-16 h-16 rounded-lg bg-red-500/10 border border-red-500/30 flex items-center justify-center flex-shrink-0">
                                            <WarningCircleIcon
                                                size={28}
                                                className="text-red-400"
                                                weight="duotone"
                                            />
                                        </div>
                                        <div>
                                            <span className="text-red-400 font-bold text-base font-mono">
                                                FAKE
                                            </span>
                                            <p className="text-gray-300 text-sm mt-1">
                                                Strong indicators of deepfake or
                                                digital manipulation detected
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-4 p-4 rounded-lg bg-yellow-500/5 border border-yellow-500/20">
                                        <div className="w-16 h-16 rounded-lg bg-yellow-500/10 border border-yellow-500/30 flex items-center justify-center flex-shrink-0">
                                            <InfoIcon
                                                size={28}
                                                className="text-yellow-400"
                                                weight="duotone"
                                            />
                                        </div>
                                        <div>
                                            <span className="text-yellow-400 font-bold text-base font-mono">
                                                UNCERTAIN
                                            </span>
                                            <p className="text-gray-300 text-sm mt-1">
                                                Mixed signals; further
                                                verification recommended
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Confidence Score */}
                            <div className="p-6 rounded-xl bg-gradient-to-br from-gray-900/80 to-gray-800/50 border border-gray-700 shadow-xl">
                                <div className="flex items-center gap-3 mb-3">
                                    <TrendUpIcon
                                        size={24}
                                        className="text-red-400"
                                    />
                                    <h4 className="font-bold text-white text-lg">
                                        Confidence Score
                                    </h4>
                                </div>
                                <p className="text-gray-300 leading-relaxed">
                                    A percentage (0-100%) indicating how certain
                                    the AI is about its verdict. Higher
                                    confidence means stronger evidence
                                    supporting the classification.
                                </p>
                                <div className="mt-4 p-4 bg-black/40 rounded-lg border border-gray-800">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-sm text-gray-400">
                                            Example:
                                        </span>
                                        <span className="text-red-400 font-bold">
                                            87.3%
                                        </span>
                                    </div>
                                    <div className="w-full bg-gray-800 rounded-full h-3">
                                        <div
                                            className="bg-gradient-to-r from-red-600 to-red-400 h-3 rounded-full"
                                            style={{ width: "87.3%" }}
                                        ></div>
                                    </div>
                                </div>
                            </div>

                            {/* Analysis Metrics */}
                            <div className="grid md:grid-cols-2 gap-4">
                                {/* Spatial Analysis */}
                                <div className="p-6 rounded-xl bg-gradient-to-br from-gray-900/80 to-gray-800/50 border border-gray-700 shadow-xl">
                                    <div className="flex items-center gap-3 mb-3">
                                        <EyeIcon
                                            size={24}
                                            className="text-red-400"
                                        />
                                        <h4 className="font-bold text-white">
                                            Spatial Analysis
                                        </h4>
                                    </div>
                                    <p className="text-sm text-gray-400 mb-4">
                                        Frame-level artifact detection:
                                    </p>
                                    <div className="space-y-3">
                                        <div className="flex items-start gap-2">
                                            <div className="w-2 h-2 rounded-full bg-red-400 mt-1.5 flex-shrink-0"></div>
                                            <div>
                                                <p className="text-sm font-semibold text-white">
                                                    Facial Inconsistencies
                                                </p>
                                                <p className="text-xs text-gray-500">
                                                    Unnatural facial feature
                                                    variations
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-start gap-2">
                                            <div className="w-2 h-2 rounded-full bg-red-400 mt-1.5 flex-shrink-0"></div>
                                            <div>
                                                <p className="text-sm font-semibold text-white">
                                                    Lighting Anomalies
                                                </p>
                                                <p className="text-xs text-gray-500">
                                                    Inconsistent lighting or
                                                    shadows
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-start gap-2">
                                            <div className="w-2 h-2 rounded-full bg-red-400 mt-1.5 flex-shrink-0"></div>
                                            <div>
                                                <p className="text-sm font-semibold text-white">
                                                    Artifact Detection
                                                </p>
                                                <p className="text-xs text-gray-500">
                                                    Visual artifacts from AI
                                                    generation
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Temporal Analysis */}
                                <div className="p-6 rounded-xl bg-gradient-to-br from-gray-900/80 to-gray-800/50 border border-gray-700 shadow-xl">
                                    <div className="flex items-center gap-3 mb-3">
                                        <FilmSlateIcon
                                            size={24}
                                            className="text-red-400"
                                        />
                                        <h4 className="font-bold text-white">
                                            Temporal Analysis
                                        </h4>
                                    </div>
                                    <p className="text-sm text-gray-400 mb-4">
                                        Frame-to-frame consistency:
                                    </p>
                                    <div className="space-y-3">
                                        <div className="flex items-start gap-2">
                                            <div className="w-2 h-2 rounded-full bg-red-400 mt-1.5 flex-shrink-0"></div>
                                            <div>
                                                <p className="text-sm font-semibold text-white">
                                                    Frame Continuity
                                                </p>
                                                <p className="text-xs text-gray-500">
                                                    Smoothness of frame
                                                    transitions
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-start gap-2">
                                            <div className="w-2 h-2 rounded-full bg-red-400 mt-1.5 flex-shrink-0"></div>
                                            <div>
                                                <p className="text-sm font-semibold text-white">
                                                    Motion Consistency
                                                </p>
                                                <p className="text-xs text-gray-500">
                                                    Natural movement patterns
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-start gap-2">
                                            <div className="w-2 h-2 rounded-full bg-red-400 mt-1.5 flex-shrink-0"></div>
                                            <div>
                                                <p className="text-sm font-semibold text-white">
                                                    Temporal Artifacts
                                                </p>
                                                <p className="text-xs text-gray-500">
                                                    Irregular changes over time
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Anomalies Timeline */}
                            <div className="p-6 rounded-xl bg-gradient-to-br from-gray-900/80 to-gray-800/50 border border-gray-700 shadow-xl">
                                <div className="flex items-center gap-3 mb-3">
                                    <PlayIcon
                                        size={24}
                                        className="text-red-400"
                                    />
                                    <h4 className="font-bold text-white text-lg">
                                        Anomalies Timeline
                                    </h4>
                                </div>
                                <p className="text-gray-300">
                                    Shows specific timestamps where suspicious
                                    frames were detected, complete with
                                    per-frame confidence scores. Click any
                                    timestamp to jump to that moment in the
                                    video.
                                </p>
                            </div>
                        </div>
                    </section>

                    {/* What Can It Detect */}
                    <section id="what-can-detect" className="space-y-6">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center">
                                <ShieldCheckIcon
                                    size={20}
                                    className="text-red-400"
                                />
                            </div>
                            <h2 className="text-3xl font-bold text-white">
                                What TrustLens Can Detect
                            </h2>
                        </div>
                        <div className="space-y-4 text-gray-300 leading-relaxed">
                            <p className="text-lg">
                                TrustLens is designed to identify various types
                                of video manipulation:
                            </p>

                            <div className="grid grid-cols-3 gap-4">
                                <div className="flex items-start gap-4 p-5 rounded-xl bg-gradient-to-r from-gray-900/80 to-gray-800/50 border border-gray-700 hover:border-red-500/30 transition-all hover:shadow-lg hover:shadow-red-500/10">
                                    <div className="w-12 h-12 rounded-lg bg-red-500/10 border border-red-500/20 flex items-center justify-center flex-shrink-0">
                                        <UsersThreeIcon
                                            size={24}
                                            className="text-red-400"
                                            weight="duotone"
                                        />
                                    </div>
                                    <div>
                                        <h5 className="font-bold text-white text-base mb-1">
                                            Face Swapping
                                        </h5>
                                        <p className="text-sm text-gray-400 leading-relaxed">
                                            Replacing one person's face with
                                            another's in a video
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-4 p-5 rounded-xl bg-gradient-to-r from-gray-900/80 to-gray-800/50 border border-gray-700 hover:border-red-500/30 transition-all hover:shadow-lg hover:shadow-red-500/10">
                                    <div className="w-12 h-12 rounded-lg bg-red-500/10 border border-red-500/20 flex items-center justify-center flex-shrink-0">
                                        <MaskHappyIcon
                                            size={24}
                                            className="text-red-400"
                                            weight="duotone"
                                        />
                                    </div>
                                    <div>
                                        <h5 className="font-bold text-white text-base mb-1">
                                            Facial Reenactment
                                        </h5>
                                        <p className="text-sm text-gray-400 leading-relaxed">
                                            Manipulating facial expressions or
                                            movements to create fake reactions
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-4 p-5 rounded-xl bg-gradient-to-r from-gray-900/80 to-gray-800/50 border border-gray-700 hover:border-red-500/30 transition-all hover:shadow-lg hover:shadow-red-500/10">
                                    <div className="w-12 h-12 rounded-lg bg-red-500/10 border border-red-500/20 flex items-center justify-center flex-shrink-0">
                                        <MicrophoneIcon
                                            size={24}
                                            className="text-red-400"
                                            weight="duotone"
                                        />
                                    </div>
                                    <div>
                                        <h5 className="font-bold text-white text-base mb-1">
                                            Lip-Sync Manipulation
                                        </h5>
                                        <p className="text-sm text-gray-400 leading-relaxed">
                                            Altering mouth movements to match
                                            different audio or fake speech
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-4 p-5 rounded-xl bg-gradient-to-r from-gray-900/80 to-gray-800/50 border border-gray-700 hover:border-red-500/30 transition-all hover:shadow-lg hover:shadow-red-500/10">
                                    <div className="w-12 h-12 rounded-lg bg-red-500/10 border border-red-500/20 flex items-center justify-center flex-shrink-0">
                                        <RobotIcon
                                            size={24}
                                            className="text-red-400"
                                            weight="duotone"
                                        />
                                    </div>
                                    <div>
                                        <h5 className="font-bold text-white text-base mb-1">
                                            AI-Generated Synthetic Videos
                                        </h5>
                                        <p className="text-sm text-gray-400 leading-relaxed">
                                            Entirely fabricated videos created
                                            using AI models like GANs or
                                            diffusion models
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-4 p-5 rounded-xl bg-gradient-to-r from-gray-900/80 to-gray-800/50 border border-gray-700 hover:border-red-500/30 transition-all hover:shadow-lg hover:shadow-red-500/10">
                                    <div className="w-12 h-12 rounded-lg bg-red-500/10 border border-red-500/20 flex items-center justify-center flex-shrink-0">
                                        <FilmSlateIcon
                                            size={24}
                                            className="text-red-400"
                                            weight="duotone"
                                        />
                                    </div>
                                    <div>
                                        <h5 className="font-bold text-white text-base mb-1">
                                            Compression & Re-Encoding Artifacts
                                        </h5>
                                        <p className="text-sm text-gray-400 leading-relaxed">
                                            Identifying traces of video editing,
                                            re-saving, and quality degradation
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Limitations */}
                    <section id="limitations" className="space-y-6">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center">
                                <WarningCircleIcon
                                    size={20}
                                    className="text-red-400"
                                />
                            </div>
                            <h2 className="text-3xl font-bold text-white">
                                Important Limitations
                            </h2>
                        </div>
                        <div className="space-y-4 text-gray-300 leading-relaxed">
                            <p>
                                While TrustLens is a powerful tool, it's
                                important to understand its limitations:
                            </p>

                            <div className="space-y-3 grid grid-cols-2 gap-4">
                                <div className="p-5 rounded-lg bg-red-900/10 border border-red-500/20">
                                    <h4 className="font-semibold text-red-400 mb-2 text-sm">
                                        Not 100% Accurate
                                    </h4>
                                    <p className="text-sm text-gray-400">
                                        No deepfake detector is perfect.
                                        TrustLens may produce false positives
                                        (flagging real videos as fake) or false
                                        negatives (missing actual deepfakes).
                                        Always use results as supplementary
                                        evidence, not definitive proof.
                                    </p>
                                </div>

                                <div className="p-5 rounded-lg bg-red-900/10 border border-red-500/20">
                                    <h4 className="font-semibold text-red-400 mb-2 text-sm">
                                        Video Quality Matters
                                    </h4>
                                    <p className="text-sm text-gray-400">
                                        Low-resolution, heavily compressed, or
                                        blurry videos may produce inaccurate
                                        results. Higher quality videos yield
                                        more reliable analysis.
                                    </p>
                                </div>

                                <div className="p-5 rounded-lg bg-red-900/10 border border-red-500/20">
                                    <h4 className="font-semibold text-red-400 mb-2 text-sm">
                                        No Audio Analysis
                                    </h4>
                                    <p className="text-sm text-gray-400">
                                        TrustLens only analyzes visual content.
                                        It cannot detect voice cloning or audio
                                        manipulation.
                                    </p>
                                </div>

                                <div className="p-5 rounded-lg bg-red-900/10 border border-red-500/20">
                                    <h4 className="font-semibold text-red-400 mb-2 text-sm">
                                        Academic Research Project
                                    </h4>
                                    <p className="text-sm text-gray-400">
                                        TrustLens is a demonstration platform
                                        for academic purposes and is not
                                        intended for production use or as the
                                        sole basis for critical decisions.
                                    </p>
                                </div>

                                <div className="p-5 rounded-lg bg-red-900/10 border border-red-500/20">
                                    <h4 className="font-semibold text-red-400 mb-2 text-sm">
                                        Evolving Technology
                                    </h4>
                                    <p className="text-sm text-gray-400">
                                        Deepfake technology constantly evolves.
                                        Newer, more sophisticated techniques may
                                        evade detection until models are
                                        retrained.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Running Locally */}
                    <section id="running-locally" className="space-y-6">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center">
                                <RocketLaunchIcon
                                    size={20}
                                    className="text-red-400"
                                />
                            </div>
                            <h2 className="text-3xl font-bold text-white">
                                Running Locally
                            </h2>
                        </div>
                        <div className="space-y-4 text-gray-300 leading-relaxed">
                            <p>
                                If you'd like to run TrustLens on your own
                                machine:
                            </p>

                            <div className="space-y-6">
                                <div>
                                    <h4 className="font-semibold text-white mb-3">
                                        Prerequisites
                                    </h4>
                                    <ul className="space-y-2 text-sm text-gray-400 ml-4">
                                        <li>• Node.js 18+ and npm</li>
                                        <li>• Docker and Docker Compose</li>
                                        <li>• Git</li>
                                    </ul>
                                </div>

                                <div>
                                    <h4 className="font-semibold text-white mb-3">
                                        Setup Instructions
                                    </h4>
                                    <div className="space-y-4">
                                        <div className="p-4 rounded-lg bg-gray-900/50 border border-gray-800">
                                            <p className="text-sm text-gray-400 mb-2">
                                                1. Clone the repository:
                                            </p>
                                            <div className="bg-black p-3 rounded font-mono text-xs text-gray-300 overflow-x-auto">
                                                git clone
                                                https://github.com/radsadsoap/TrustLens.git
                                                <br />
                                                cd TrustLens
                                            </div>
                                        </div>

                                        <div className="p-4 rounded-lg bg-gray-900/50 border border-gray-800">
                                            <p className="text-sm text-gray-400 mb-2">
                                                2. Start the backend server:
                                            </p>
                                            <div className="bg-black p-3 rounded font-mono text-xs text-gray-300 overflow-x-auto">
                                                cd server
                                                <br />
                                                docker compose up --build
                                            </div>
                                            <p className="text-xs text-gray-500 mt-2">
                                                The backend will be available at
                                                http://localhost:8000
                                            </p>
                                        </div>

                                        <div className="p-4 rounded-lg bg-gray-900/50 border border-gray-800">
                                            <p className="text-sm text-gray-400 mb-2">
                                                3. Start the frontend (in a new
                                                terminal):
                                            </p>
                                            <div className="bg-black p-3 rounded font-mono text-xs text-gray-300 overflow-x-auto">
                                                cd client
                                                <br />
                                                npm install
                                                <br />
                                                npm run dev
                                            </div>
                                            <p className="text-xs text-gray-500 mt-2">
                                                The frontend will be available
                                                at http://localhost:5173
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div className="p-5 rounded-lg bg-red-900/10 border border-red-500/20">
                                    <div className="flex items-start gap-3">
                                        <WarningCircleIcon
                                            size={20}
                                            className="text-red-400 mt-1 flex-shrink-0"
                                        />
                                        <div>
                                            <h4 className="font-semibold text-red-400 mb-2">
                                                Note
                                            </h4>
                                            <p className="text-sm text-gray-300 leading-relaxed">
                                                First-time setup will download
                                                ~2GB of AI models. The process
                                                may take several minutes
                                                depending on your internet
                                                connection.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Support & Contributing */}
                    <section id="support" className="space-y-6 pb-36">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center">
                                <LightbulbIcon
                                    size={20}
                                    className="text-red-400"
                                />
                            </div>
                            <h2 className="text-3xl font-bold text-white">
                                Support & Contributing
                            </h2>
                        </div>
                        <div className="space-y-4 text-gray-300 leading-relaxed">
                            <p>
                                TrustLens is an open-source project. If you
                                encounter issues or have suggestions for
                                improvement:
                            </p>

                            <div className="space-y-3">
                                <div className="p-4 rounded-lg bg-gray-900/50 border border-gray-800">
                                    <h4 className="font-semibold text-white mb-2 text-sm">
                                        Report Issues
                                    </h4>
                                    <p className="text-sm text-gray-400">
                                        Found a bug or have a feature request?
                                        Open an issue on{" "}
                                        <a
                                            href="https://github.com/radsadsoap/TrustLens/issues"
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-red-400 hover:text-red-300 underline"
                                        >
                                            GitHub
                                        </a>
                                        .
                                    </p>
                                </div>

                                <div className="p-4 rounded-lg bg-gray-900/50 border border-gray-800">
                                    <h4 className="font-semibold text-white mb-2 text-sm">
                                        Contribute Code
                                    </h4>
                                    <p className="text-sm text-gray-400">
                                        Contributions are welcome! Fork the
                                        repository, make your changes, and
                                        submit a pull request.
                                    </p>
                                </div>

                                <div className="p-4 rounded-lg bg-gray-900/50 border border-gray-800">
                                    <h4 className="font-semibold text-white mb-2 text-sm">
                                        Source Code
                                    </h4>
                                    <p className="text-sm text-gray-400">
                                        View the full source code on{" "}
                                        <a
                                            href="https://github.com/radsadsoap/TrustLens"
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-red-400 hover:text-red-300 underline"
                                        >
                                            GitHub
                                        </a>
                                        .
                                    </p>
                                </div>
                            </div>
                        </div>
                    </section>
                </div>
            </div>

            <DocsNav />
        </main>
    );
}
