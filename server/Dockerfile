FROM python:3.11-slim AS builder

WORKDIR /app

# Install only build-time system deps; purge apt cache in same layer
RUN apt-get update && apt-get install -y --no-install-recommends \
        gcc \
        libgl1 \
        libglib2.0-0 \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .

# Install with CPU-only torch, no cache, and strip compiled bytecode we don't need
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir \
        --extra-index-url https://download.pytorch.org/whl/cpu \
        -r requirements.txt && \
    # Remove test suites, __pycache__, and .dist-info bloat to shrink site-packages
    find /usr/local/lib/python3.11/site-packages -type d -name "tests"       -exec rm -rf {} + 2>/dev/null || true && \
    find /usr/local/lib/python3.11/site-packages -type d -name "test"        -exec rm -rf {} + 2>/dev/null || true && \
    find /usr/local/lib/python3.11/site-packages -type d -name "__pycache__" -exec rm -rf {} + 2>/dev/null || true && \
    find /usr/local/lib/python3.11/site-packages -name "*.pyc"               -delete 2>/dev/null || true

FROM python:3.11-slim AS model-downloader

WORKDIR /models

COPY --from=builder /usr/local/lib/python3.11/site-packages /usr/local/lib/python3.11/site-packages
COPY --from=builder /usr/local/bin /usr/local/bin

# Download weights into an explicit local cache dir we control
ENV HF_HOME=/models/hf_cache \
    TORCH_HOME=/models/torch_cache

RUN python -c "\
from transformers import pipeline; \
pipeline('image-classification', model='dima806/deepfake_vs_real_image_detection'); \
import torchvision.models as m; \
m.resnext50_32x4d(weights=m.ResNeXt50_32X4D_Weights.IMAGENET1K_V2); \
print('All weights downloaded.')"

FROM python:3.11-slim

WORKDIR /app

# Runtime-only system libs — no gcc, no build tools
RUN apt-get update && apt-get install -y --no-install-recommends \
        libgl1 \
        libglib2.0-0 \
        libgomp1 \
    && rm -rf /var/lib/apt/lists/*

# Copy cleaned site-packages from builder (not model-downloader, to keep layers separate)
COPY --from=builder /usr/local/lib/python3.11/site-packages /usr/local/lib/python3.11/site-packages
COPY --from=builder /usr/local/bin /usr/local/bin

# Copy pre-downloaded model weights
ENV HF_HOME=/models/hf_cache \
    TORCH_HOME=/models/torch_cache
COPY --from=model-downloader /models /models

# Copy application source (changes most often → last, preserves cache above)
COPY app/ ./app/

RUN mkdir -p uploads temp logs

EXPOSE 8000

# Use exec form; tighten worker count to avoid memory pressure
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000", "--workers", "1"]