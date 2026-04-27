# TrustLens — Deepfake Video Detector

**AI-Based Deepfake Detection Using Hybrid Spatial-Temporal Deep Learning Framework**

A full-stack web application for detecting deepfake videos using a three-branch hybrid deep learning pipeline: ResNeXt-50 spatial feature extraction, bidirectional LSTM temporal modeling, and SigLIP per-frame classification — fused through a weighted decision layer.

![alt text](./client/public/image.png)

## 🎯 Project Overview

TrustLens addresses the challenge of detecting AI-generated deepfake videos through a multi-modal analysis system that jointly examines spatial inconsistencies within frames, temporal irregularities across video sequences, and per-frame semantic authenticity signals.

### Problem Statement

The rapid advancement of deep learning technologies has enabled the creation of highly realistic deepfake videos. These manipulated videos pose serious threats to:

- Digital security and personal privacy
- Public trust and media authenticity
- Political systems and democratic processes
- Cybersecurity infrastructure

### Solution

A hybrid spatial-temporal detection framework with three complementary branches:

- **Spatial Branch (ResNeXt-50)**: Extracts 2048-dim deep features per frame to detect facial inconsistencies, lighting anomalies, and blending artifacts
- **Temporal Branch (Bidirectional LSTM)**: Models the temporal evolution of spatial features to detect flickering, motion discontinuities, and temporal jitter
- **Classification Branch (SigLIP)**: Per-frame binary deepfake classifier (94.44% accuracy) providing calibrated fake probabilities
- **Fusion Layer**: Weighted combination of all three signals with asymmetric threshold decision logic
- **CV Fallback**: Graceful degradation to classical computer vision heuristics when deep models cannot load

## 🏗️ Architecture

```
TrustLens/
├── client/                    # React 19 + TypeScript frontend
│   └── src/
│       ├── components/
│       │   ├── Header.tsx              # Navigation header
│       │   ├── Player.tsx              # Video upload interface (drag & drop)
│       │   ├── CustomVideoPlayer.tsx   # Canvas overlay + timeline markers
│       │   ├── Analysis.tsx            # Results display + metrics
│       │   ├── FrameDetailModal.tsx    # Full-screen frame inspection modal
│       │   └── DocsNav.tsx             # Documentation sidebar nav
│       ├── pages/
│       │   ├── Upload.tsx              # Main feature page
│       │   └── Docs.tsx                # Documentation page
│       ├── services/
│       │   └── api.ts                  # API client with timeout handling
│       └── App.tsx                     # Router (/ and /docs)
│
├── server/                    # FastAPI Python backend
│   ├── app/
│   │   ├── services/
│   │   │   ├── hybrid_detector.py     # CORE: 3-branch hybrid AI detection
│   │   │   └── video_service.py       # File save/validate helpers
│   │   ├── api.py                     # API routes + lazy detector init
│   │   ├── models.py                  # Pydantic data models
│   │   ├── config.py                  # Env-based configuration
│   │   └── main.py                    # FastAPI app entry point
│   ├── Dockerfile                     # Multi-stage build with baked model weights
│   ├── docker-compose.yml
│   └── requirements.txt
│
└── CLAUDE Instructions/       # Project documentation & research papers
```

## 🚀 Tech Stack

### Frontend

| Tech           | Version | Role                    |
| -------------- | ------- | ----------------------- |
| React          | 19.2    | UI framework            |
| TypeScript     | latest  | Type safety             |
| Vite           | 7.3     | Build tool / dev server |
| TailwindCSS    | 4.1     | Utility-first CSS       |
| React Router   | 7.13    | Client-side routing     |
| Phosphor Icons | 2.1     | Icon library            |

### Backend

| Tech              | Version  | Role                              |
| ----------------- | -------- | --------------------------------- |
| Python            | 3.11     | Runtime                           |
| FastAPI           | 0.109    | Web framework                     |
| Uvicorn           | 0.27     | ASGI server                       |
| PyTorch (CPU)     | ≥2.0     | Model runtime                     |
| TorchVision       | ≥0.15    | ResNeXt-50 backbone               |
| Transformers      | ≥4.35    | SigLIP pipeline (local inference) |
| OpenCV (headless) | 4.9.0.80 | Frame extraction & CV analysis    |
| NumPy             | 1.26.3   | Numerical operations              |
| Pydantic          | 2.5.3    | Data models & env config          |
| Docker            | latest   | Containerized deployment          |

### AI Models

| Model      | Architecture                       | Role                          | Performance      |
| ---------- | ---------------------------------- | ----------------------------- | ---------------- |
| ResNeXt-50 | CNN (ImageNet pretrained)          | Spatial feature extraction    | 2048-dim vectors |
| BiLSTM     | 2-layer, hidden=512, bidirectional | Temporal consistency analysis | 1024-dim states  |
| SigLIP     | Vision-language classifier         | Per-frame real/fake detection | 94.44% accuracy  |

## 📋 Prerequisites

- **Docker & Docker Compose** (Recommended)
- OR **Node.js 18+** and **Python 3.11+** for local development

## 🎬 Quick Start

### Option 1: Docker (Recommended)

1. **Start Backend** (first run downloads & bakes model weights into image)

```bash
cd server
docker compose up --build
```

The backend API will be available at `http://localhost:8000`

2. **Start Frontend** (in a new terminal)

```bash
cd client
npm install
npm run dev
```

The frontend will be available at `http://localhost:5173`

3. **Stop Services**

```bash
# In server directory
docker compose down
```

> **Note (Windows)**: Use `http://127.0.0.1:8000` instead of `localhost` in the frontend `.env` — Windows resolves `localhost` to IPv6 which doesn't route correctly to Docker.

### Option 2: Local Development

#### Backend Setup

```bash
cd server

# Create virtual environment
python -m venv venv

# Activate virtual environment
# Windows:
venv\Scripts\activate
# Linux/Mac:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Create .env file
cp .env.example .env

# Run server
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

#### Frontend Setup

```bash
cd client

# Install dependencies
npm install

# Create .env file (set VITE_API_URL=http://127.0.0.1:8000/api)
cp .env.example .env

# Run development server
npm run dev
```

## 📖 Usage

1. **Navigate to** `http://localhost:5173`

2. **Upload a video**:
    - Click the upload area or drag and drop a video file
    - Supported formats: MP4, AVI, MOV, MKV, WebM (max 100 MB)
    - Video preview appears immediately

3. **Run analysis**:
    - Click the **"Run Analysis"** button
    - Health check verifies backend is reachable
    - Video uploads, then analysis triggers automatically
    - Poll for results every 2 seconds until complete
    - First analysis takes longer (~2-5 min cold start for model loading)

4. **Review results**:
    - View overall verdict: **Real** / **Fake** / **Uncertain**
    - Check confidence percentage
    - Explore detection metrics: Facial, Lighting, Artifacts, Continuity, Motion, Temporal
    - Read the natural language explanation and recommendations

5. **Examine artifacts**:
    - View color-coded artifact overlays on the video player:
        - 🟠 Orange: Blur artifacts
        - 🟡 Yellow: Edge inconsistencies
        - 🟣 Purple: Face regions
        - 🔴 Magenta: Lighting anomalies
    - Toggle overlays on/off with the button below the video
    - Click timeline markers to jump to suspicious frames
    - Open the **Frame Detail Modal** to inspect all 30 analyzed frames

## 🔬 Detection Pipeline

### Hybrid Deep Learning Pipeline (Primary)

```
Input Video
    │
    ▼
Frame Extraction (OpenCV, ~30 frames uniformly sampled)
    │
    ├──────────────────┬──────────────────┬──────────────────┐
    │                  │                  │                  │
    ▼                  ▼                  ▼                  ▼
Spatial Branch    Classification     Temporal Branch    CV Artifacts
(ResNeXt-50)      (SigLIP)          (BiLSTM)          (OpenCV)
2048-dim features  fake_prob/frame    LSTM hidden       blur, edges,
per frame          is_fake/frame      state deltas      faces, lighting
    │                  │                  │                  │
    └──────────────────┴──────────────────┴──────────────────┘
                              │
                              ▼
                     Weighted Fusion Layer
    overall = 0.40 × fake_ratio + 0.30 × avg_fake_prob
            + 0.20 × temporal_artifacts + 0.10 × spatial_score
                              │
                              ▼
                     Verdict + Confidence
    FAKE:      fake_ratio ≥ 0.40 OR overall ≥ 0.55
    REAL:      fake_ratio ≤ 0.20 AND overall ≤ 0.35
    UNCERTAIN: otherwise
```

### CV Fallback (when deep models fail to load)

Activates automatically if `transformers` or `torch` model loading fails. Uses Laplacian blur, Canny edges, brightness stats, color histograms, noise patterns, and DCT analysis — no deep learning required.

### End-to-End UX Flow

```
User selects/drops video → preview shown → "Run Analysis" button appears
    │
    ▼
Health check (5s timeout) → fail fast if backend unreachable
    │
    ▼
POST /api/upload (60s timeout) → returns video_id
    │
    ▼
POST /api/analyze/{video_id} (10s timeout) → triggers background task
    │
    ▼
Poll GET /api/analysis/{video_id} every 2s
    │
    ▼
Results display: verdict, metrics, artifact overlays, frame details
```

## 📡 API Reference

| Method | Endpoint                   | Description                        | Timeout |
| ------ | -------------------------- | ---------------------------------- | ------- |
| GET    | `/health`                  | Health check (no model loading)    | 5s      |
| POST   | `/api/upload`              | Upload video → returns `video_id`  | 60s     |
| POST   | `/api/analyze/{video_id}`  | Trigger analysis (background task) | 10s     |
| GET    | `/api/analysis/{video_id}` | Poll for result                    | -       |

**Swagger UI**: http://localhost:8000/api/docs  
**ReDoc**: http://localhost:8000/api/redoc

## 🔧 Configuration

### Backend (.env)

```env
HOST=0.0.0.0
PORT=8000
DEBUG=True
CORS_ORIGINS=http://localhost:5173,http://localhost:3000
MAX_UPLOAD_SIZE_MB=100
ALLOWED_VIDEO_EXTENSIONS=.mp4,.avi,.mov,.mkv,.webm
FRAME_SAMPLE_RATE=5
MIN_CONFIDENCE_THRESHOLD=0.7
```

### Frontend (.env)

```env
VITE_API_URL=http://127.0.0.1:8000/api
```

> Use `127.0.0.1` on Windows — `localhost` resolves to IPv6 which doesn't route correctly to Docker.

## 🐳 Docker Commands

```bash
# Build and start (first run bakes model weights into image)
docker compose up --build

# Run in background
docker compose up -d --build

# View logs
docker compose logs -f

# Stop containers
docker compose stop

# Remove containers and volumes
docker compose down -v

# Rebuild without cache
docker compose build --no-cache
```

## 🔮 Future Enhancements

- [ ] GPU acceleration support
- [ ] Audio deepfake detection
- [ ] Real-time streaming analysis
- [ ] User authentication system
- [ ] Database integration (PostgreSQL) for result persistence
- [ ] Result history and analytics
- [ ] Batch video processing
- [ ] API rate limiting
- [ ] Train BiLSTM on deepfake-specific data (currently random initialization)

## 🚨 Troubleshooting

### Backend won't start

- Check if port 8000 is available
- Verify Docker is running
- Check logs: `docker compose logs backend`

### Frontend can't connect to backend

- Verify backend is running on port 8000
- On Windows, use `http://127.0.0.1:8000/api` (not `localhost`)
- Check CORS settings in backend `.env`

### First analysis is slow

- First `Run Analysis` click triggers model loading (~2-5 min cold start)
- Subsequent analyses reuse loaded models and are much faster
- Docker image pre-downloads model weights to avoid runtime downloads

### Upload fails

- Check file size (max 100 MB by default)
- Verify file format is supported (.mp4, .avi, .mov, .mkv, .webm)
- Check backend logs for errors

## ⚠️ Known Limitations

- **BiLSTM weights randomly initialized** — temporal scoring is structurally sound but not trained on deepfake-specific data
- **In-memory storage** — analysis results stored in `analysis_cache` dict, lost on server restart
- **No authentication or rate limiting** — demo-grade only
- **CPU-only** — no GPU acceleration
- **Single analysis at a time** — `ThreadPoolExecutor(max_workers=1)` serializes concurrent analyses
- **HuggingFace API deprecated** — model runs locally only via `transformers` pipeline

## 👥 Contributing

This is an academic project. For collaboration inquiries, please contact the project maintainer.

## 📄 License

[Specify your license here]

## 🙏 Acknowledgments

- FastAPI and React communities
- OpenCV and PyTorch contributors
- HuggingFace Transformers library
- `prithivMLmods/Deep-Fake-Detector-Model` (SigLIP deepfake classifier)
- Deepfake detection research community
- Academic advisors and mentors

---

**Developed as part of academic research on AI-Based Deepfake Detection**
