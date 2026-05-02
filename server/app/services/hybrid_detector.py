"""
Hybrid Spatial-Temporal Deepfake Detector
==========================================
Based on: AI-Based Deepfake Detection Using Hybrid Spatial-Temporal
          Deep Learning Framework

Architecture
------------
  Spatial branch  : ResNeXt-50 (ImageNet pretrained)
                    Extracts a 2048-dim deep CNN feature vector per frame.
                    High inter-frame feature variance flags facial swapping.

  Temporal branch : Bidirectional LSTM (2 layers, hidden=512, input=2048)
                    Processes the ordered sequence of ResNeXt feature vectors.
                    Coefficient-of-variation of per-step L2 deltas measures
                    temporal discontinuities characteristic of face-swap artefacts.

  Classification  : ViT binary classifier
                    (dima806/deepfake_vs_real_image_detection, 99.27% accuracy)
                    Provides a calibrated per-frame deepfake probability.

  Fusion          : Weighted combination (ViT-dominant)
                    overall_score = fake_ratio * 0.45
                                  + avg_vit_fake_prob * 0.40
                                  + temporal_artifacts   * 0.10
                                  + spatial_overall      * 0.05
"""

import logging
from datetime import datetime, timezone
from typing import List, Tuple

import cv2
import numpy as np
import torch
import torch.nn as nn
import torchvision.models as tv_models
from PIL import Image
from torchvision import transforms
from transformers import pipeline as hf_pipeline

from app.models import (
    AnalysisResult,
    ArtifactRegion,
    DeepfakeResult,
    FrameAnalysis,
    SpatialAnalysis,
    TemporalAnalysis,
)

logger = logging.getLogger(__name__)


class HybridSpatialTemporalDetector:
    """
    Hybrid Spatial-Temporal Deepfake Detector.

    Spatial branch  : ResNeXt-50 backbone (ImageNet pretrained) -> 2048-dim features.
    Temporal branch : Bidirectional LSTM over frame feature sequence.
    Classification  : ViT per-frame binary classifier (dima806/deepfake_vs_real_image_detection).
    Fusion          : Weighted combination of all three signals.
    """

    VIT_MODEL = "dima806/deepfake_vs_real_image_detection"

    def __init__(self):
        self.USE_FALLBACK = False
        try:
            # ViT binary classifier (dima806/deepfake_vs_real_image_detection)
            logger.info("Loading ViT deepfake classifier...")
            self._classifier = hf_pipeline(
                "image-classification", model=self.VIT_MODEL
            )
            # Log the label mapping so we can verify it
            model_config = self._classifier.model.config
            logger.info(f"ViT label mapping: {model_config.id2label}")

            # ResNeXt-50 spatial feature extractor
            logger.info("Loading ResNeXt-50 spatial backbone...")
            _resnext = tv_models.resnext50_32x4d(
                weights=tv_models.ResNeXt50_32X4D_Weights.IMAGENET1K_V2
            )
            _resnext.fc = nn.Identity()  # drop classifier head -> 2048-dim output
            self._spatial_extractor = _resnext.eval()

            self._preprocess = transforms.Compose([
                transforms.Resize(232),
                transforms.CenterCrop(224),
                transforms.ToTensor(),
                transforms.Normalize(
                    mean=[0.485, 0.456, 0.406],
                    std=[0.229, 0.224, 0.225],
                ),
            ])

            # Bidirectional LSTM temporal modeler
            # input  : 2048-dim ResNeXt feature per timestep
            # output : 1024-dim hidden state per timestep (512 x 2 directions)
            self._lstm = nn.LSTM(
                input_size=2048,
                hidden_size=512,
                num_layers=2,
                batch_first=True,
                bidirectional=True,
                dropout=0.3,
            ).eval()

            # Haar cascade for face detection (used to crop faces for ViT)
            self._face_cascade = cv2.CascadeClassifier(
                cv2.data.haarcascades + "haarcascade_frontalface_default.xml"
            )

            logger.info("Hybrid Spatial-Temporal Detector ready.")

        except Exception as e:
            logger.warning(f"Hybrid model load failed: {e} -- falling back to CV analysis")
            self.USE_FALLBACK = True

    # -------------------------------------------------------------------------
    # Public interface
    # -------------------------------------------------------------------------

    def analyze_video(
        self,
        video_path: str,
        video_id: str = "",
        progress_callback=None,
    ) -> AnalysisResult:
        start = datetime.now(timezone.utc)
        mode = "CV fallback" if self.USE_FALLBACK else "Hybrid ResNeXt-LSTM + ViT"
        logger.info(f"Starting analysis [{mode}]: {video_path}")

        try:
            frames = self._extract_frames(video_path)
            if not frames:
                raise ValueError("Could not extract frames from video")

            # Report total frames immediately
            if progress_callback:
                progress_callback(0, len(frames))

            if self.USE_FALLBACK:
                return self._analyze_cv_fallback(frames, video_id, start)

            return self._analyze_hybrid(frames, video_id, start, progress_callback)

        except Exception as e:
            logger.error(f"Analysis error: {e}")
            raise

    # -------------------------------------------------------------------------
    # Hybrid pipeline
    # -------------------------------------------------------------------------

    def _analyze_hybrid(
        self,
        frames: List[Tuple[np.ndarray, float]],
        video_id: str,
        start: datetime,
        progress_callback=None,
    ) -> AnalysisResult:
        logger.info(f"Processing {len(frames)} frames (hybrid mode)...")

        # Step 1: Per-frame ViT classification + ResNeXt features
        frame_results: List[FrameAnalysis] = []
        spatial_features: List[torch.Tensor] = []

        for idx, (frame, timestamp) in enumerate(frames):
            if idx == 0 or (idx + 1) % 5 == 0 or idx == len(frames) - 1:
                logger.info(f"  Frame {idx + 1}/{len(frames)}")

            # Report progress after each frame
            if progress_callback:
                progress_callback(idx + 1, len(frames))

            # Convert once, reuse for both ViT and ResNeXt
            pil_img = Image.fromarray(cv2.cvtColor(frame, cv2.COLOR_BGR2RGB))

            is_fake, fake_prob = self._classify_frame(frame, pil_img)
            feat = self._extract_spatial_features(frame, pil_img)
            spatial_features.append(feat)

            if idx == 0 or idx == len(frames) - 1:
                logger.info(
                    f"  Frame {idx + 1}: fake_prob={fake_prob:.3f}, is_fake={is_fake}"
                )

            frame_results.append(FrameAnalysis(
                frame_number=idx,
                timestamp=timestamp,
                confidence=fake_prob,
                is_fake=is_fake,
                anomalies=self._detect_frame_anomalies(frame),
                artifact_regions=self._detect_artifact_regions(frame, is_fake),
            ))

        # Step 2: Temporal branch -- Bidirectional LSTM
        lstm_outputs = self._run_temporal_lstm(spatial_features)

        # Step 3: Build spatial and temporal score objects
        spatial_analysis = self._build_spatial_analysis(
            frame_results, spatial_features, frames
        )
        temporal_analysis = self._build_temporal_analysis(
            frame_results, lstm_outputs, spatial_features
        )

        # Step 4: Fusion & final verdict
        fake_count = sum(1 for f in frame_results if f.is_fake)
        fake_ratio = fake_count / len(frames)
        avg_fake_prob = sum(f.confidence for f in frame_results) / len(frame_results)

        logger.info(
            f"Fusion inputs: fake_ratio={fake_ratio:.3f}, "
            f"avg_fake_prob={avg_fake_prob:.3f}, "
            f"temporal_artifacts={temporal_analysis.temporal_artifacts:.3f}, "
            f"spatial_overall={spatial_analysis.overall_score:.3f}"
        )

        overall_score = (
            fake_ratio                              * 0.45
            + avg_fake_prob                         * 0.40
            + temporal_analysis.temporal_artifacts  * 0.10
            + spatial_analysis.overall_score        * 0.05
        )

        result = self._determine_result(overall_score, fake_ratio)
        final_confidence = self._calculate_confidence(overall_score, fake_ratio)
        elapsed = (datetime.now(timezone.utc) - start).total_seconds()

        logger.info(
            f"Analysis complete -- {result.value.upper()}, "
            f"confidence {final_confidence:.1%}, "
            f"{fake_count}/{len(frames)} frames fake, "
            f"{elapsed:.1f}s"
        )

        return AnalysisResult(
            video_id=video_id,
            status="completed",
            result=result,
            confidence=final_confidence,
            overall_score=overall_score,
            spatial_analysis=spatial_analysis,
            temporal_analysis=temporal_analysis,
            suspicious_frames=sorted(frame_results, key=lambda f: f.timestamp),
            total_frames_analyzed=len(frames),
            processing_time_seconds=elapsed,
            analyzed_at=datetime.now(timezone.utc),
            explanation=self._generate_explanation(result, fake_ratio, overall_score),
            recommendations=self._generate_recommendations(result, frame_results),
        )

    # -------------------------------------------------------------------------
    # Spatial branch
    # -------------------------------------------------------------------------

    def _extract_spatial_features(self, frame: np.ndarray, pil_img: Image.Image | None = None) -> torch.Tensor:
        """Extract 2048-dim ResNeXt feature vector from a single frame."""
        if pil_img is None:
            pil_img = Image.fromarray(cv2.cvtColor(frame, cv2.COLOR_BGR2RGB))
        tensor = self._preprocess(pil_img).unsqueeze(0)
        with torch.no_grad():
            features = self._spatial_extractor(tensor)
        return features.squeeze(0)  # (2048,)

    FAKE_THRESHOLD = 0.5

    def _crop_face(self, frame: np.ndarray) -> np.ndarray | None:
        """Detect and crop the largest face from a frame.

        The dima806 ViT model was trained on tightly-cropped face images.
        Feeding full video frames (with backgrounds) makes it output ~99.9%
        'Real' for everything.  Cropping the face region first lets the
        model see the content it was trained on.

        Returns the cropped face BGR array, or None if no face found.
        """
        gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
        faces = self._face_cascade.detectMultiScale(
            gray, scaleFactor=1.1, minNeighbors=4, minSize=(60, 60)
        )
        if len(faces) == 0:
            return None
        # Pick the largest face by area
        x, y, w, h = max(faces, key=lambda f: f[2] * f[3])
        # Add 20% padding around the face for context (clamped to frame)
        pad_w, pad_h = int(w * 0.2), int(h * 0.2)
        fh, fw = frame.shape[:2]
        x1 = max(0, x - pad_w)
        y1 = max(0, y - pad_h)
        x2 = min(fw, x + w + pad_w)
        y2 = min(fh, y + h + pad_h)
        return frame[y1:y2, x1:x2]

    def _classify_frame(self, frame: np.ndarray, pil_img: Image.Image | None = None) -> Tuple[bool, float]:
        """ViT per-frame classification -> (is_fake, fake_probability 0-1).

        Crops the largest face before classification.  Falls back to the
        full frame if no face is detected.
        """
        face_crop = self._crop_face(frame)
        if face_crop is not None:
            pil_input = Image.fromarray(cv2.cvtColor(face_crop, cv2.COLOR_BGR2RGB))
        elif pil_img is not None:
            pil_input = pil_img
        else:
            pil_input = Image.fromarray(cv2.cvtColor(frame, cv2.COLOR_BGR2RGB))

        results = self._classifier(pil_input)
        fake_r = next((r for r in results if "fake" in r["label"].lower()), None)
        real_r = next((r for r in results if "real" in r["label"].lower()), None)

        logger.info(
            f"ViT raw -> {results} (face={'found' if face_crop is not None else 'NOT found'})"
        )

        if fake_r and real_r:
            fake_prob = fake_r["score"]
            is_fake = fake_prob >= self.FAKE_THRESHOLD
            return is_fake, fake_prob
        if fake_r:
            return fake_r["score"] >= self.FAKE_THRESHOLD, fake_r["score"]
        if real_r:
            fake_prob = 1.0 - real_r["score"]
            return fake_prob >= self.FAKE_THRESHOLD, fake_prob
        return False, 0.5

    # -------------------------------------------------------------------------
    # Temporal branch
    # -------------------------------------------------------------------------

    def _run_temporal_lstm(
        self, spatial_features: List[torch.Tensor]
    ) -> torch.Tensor:
        """
        Run Bidirectional LSTM over the sequence of ResNeXt feature vectors.
        Returns LSTM output tensor of shape (T, 1024).
        """
        seq = torch.stack(spatial_features).unsqueeze(0)  # (1, T, 2048)
        with torch.no_grad():
            lstm_out, _ = self._lstm(seq)
        return lstm_out.squeeze(0)  # (T, 1024)

    def _build_spatial_analysis(
        self,
        frame_results: List[FrameAnalysis],
        spatial_features: List[torch.Tensor],
        frames: List[Tuple[np.ndarray, float]],
    ) -> SpatialAnalysis:
        """
        Spatial branch scores:
          facial_inconsistencies -- variance of ResNeXt features across frames.
                                    High variance indicates facial swapping artefacts.
          lighting_anomalies     -- CV-based brightness consistency check.
          artifact_detection     -- mean ViT fake probability across all frames.
          overall_score          -- weighted combination.
        """
        feat_matrix = torch.stack(spatial_features)  # (T, 2048)
        feat_var = feat_matrix.var(dim=0).mean().item()
        facial_inconsistencies = min(1.0, feat_var / 2.0)

        n = len(frames)
        lighting_count = sum(
            1 for frame, _ in frames
            if np.std(cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)) > 70
        )
        lighting_anomalies = min(1.0, lighting_count / n)
        artifact_detection = min(
            1.0, sum(f.confidence for f in frame_results) / len(frame_results)
        )

        overall = (
            facial_inconsistencies * 0.40
            + lighting_anomalies   * 0.20
            + artifact_detection   * 0.40
        )
        return SpatialAnalysis(
            facial_inconsistencies=facial_inconsistencies,
            lighting_anomalies=lighting_anomalies,
            artifact_detection=artifact_detection,
            overall_score=min(1.0, overall),
        )

    def _build_temporal_analysis(
        self,
        frame_results: List[FrameAnalysis],
        lstm_outputs: torch.Tensor,
        spatial_features: List[torch.Tensor],
    ) -> TemporalAnalysis:
        """
        Temporal branch scores derived from LSTM hidden-state dynamics.

          frame_continuity   -- smoothness of LSTM hidden-state trajectory.
                                1 - CV(per-step L2 deltas).
                                Real videos evolve smoothly -> low CV -> high continuity.
                                Deepfakes flicker -> high CV -> low continuity.

          motion_consistency -- mean cosine similarity of adjacent ResNeXt features.
                                Unnatural jumps lower this score.

          temporal_artifacts -- normalised LSTM delta coefficient of variation.
                                High CV = temporal artefacts typical of deepfakes.
        """
        T = lstm_outputs.shape[0]

        # LSTM temporal gradient
        if T >= 2:
            deltas = [
                (lstm_outputs[i] - lstm_outputs[i - 1]).norm().item()
                for i in range(1, T)
            ]
            delta_tensor = torch.tensor(deltas, dtype=torch.float32)
            mean_delta = delta_tensor.mean().item()
            std_delta = delta_tensor.std().item() if len(deltas) > 1 else 0.0
            temporal_cv = std_delta / (mean_delta + 1e-8)
            temporal_artifacts = min(1.0, temporal_cv / 2.0)
            frame_continuity = max(0.0, 1.0 - temporal_artifacts)
        else:
            temporal_artifacts = 0.0
            frame_continuity = 1.0

        # Inter-frame ResNeXt cosine similarity
        if len(spatial_features) >= 2:
            cos_sims = [
                nn.functional.cosine_similarity(
                    spatial_features[i - 1].unsqueeze(0),
                    spatial_features[i].unsqueeze(0),
                ).item()
                for i in range(1, len(spatial_features))
            ]
            motion_consistency = max(0.0, float(np.mean(cos_sims)))
        else:
            motion_consistency = 1.0

        overall = (
            frame_continuity               * 0.40
            + motion_consistency           * 0.30
            + (1.0 - temporal_artifacts)   * 0.30
        )
        return TemporalAnalysis(
            frame_continuity=frame_continuity,
            motion_consistency=motion_consistency,
            temporal_artifacts=temporal_artifacts,
            overall_score=min(1.0, overall),
        )

    # -------------------------------------------------------------------------
    # CV fallback (used only when model loading fails)
    # -------------------------------------------------------------------------

    def _analyze_cv_fallback(
        self,
        frames: List[Tuple[np.ndarray, float]],
        video_id: str,
        start: datetime,
    ) -> AnalysisResult:
        frame_results = [
            self._fallback_frame_analysis(frame, idx, ts)
            for idx, (frame, ts) in enumerate(frames)
        ]
        fake_count = sum(1 for f in frame_results if f.is_fake)
        fake_ratio = fake_count / len(frames)
        avg_conf = sum(f.confidence for f in frame_results) / len(frame_results)

        confidences = [f.confidence for f in frame_results]
        conf_std = float(np.std(confidences))
        continuity = max(0.0, 1.0 - conf_std * 2)
        motion = max(0.0, 1.0 - conf_std * 1.5)
        t_artifacts = min(1.0, conf_std * 2)
        t_overall = (continuity + motion + (1.0 - t_artifacts)) / 3

        temporal = TemporalAnalysis(
            frame_continuity=continuity,
            motion_consistency=motion,
            temporal_artifacts=t_artifacts,
            overall_score=t_overall,
        )

        n = len(frames)
        lighting = sum(
            1 for frame, _ in frames
            if np.std(cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)) > 70
        ) / n
        artifact = sum(
            1 for frame, _ in frames
            if np.sum(
                cv2.Canny(cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY), 50, 150)
            ) / cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY).size > 0.1
        ) / n

        # Facial inconsistency via inter-frame histogram variance
        gray_hists = []
        for frame, _ in frames:
            gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
            hist = cv2.calcHist([gray], [0], None, [64], [0, 256]).flatten()
            hist = hist / (hist.sum() + 1e-8)
            gray_hists.append(hist)
        if len(gray_hists) >= 2:
            hist_matrix = np.stack(gray_hists)
            facial_score = min(1.0, float(np.var(hist_matrix)) * 50)
        else:
            facial_score = 0.0

        spatial = SpatialAnalysis(
            facial_inconsistencies=facial_score,
            lighting_anomalies=min(1.0, lighting),
            artifact_detection=min(1.0, artifact),
            overall_score=min(1.0, (facial_score * 0.4 + lighting * 0.2 + artifact * 0.4)),
        )

        overall_score = fake_ratio * 0.5 + avg_conf * 0.3 + t_overall * 0.2
        result = self._determine_result(overall_score, fake_ratio)
        final_confidence = self._calculate_confidence(overall_score, fake_ratio)
        elapsed = (datetime.now(timezone.utc) - start).total_seconds()

        return AnalysisResult(
            video_id=video_id,
            status="completed",
            result=result,
            confidence=final_confidence,
            overall_score=overall_score,
            spatial_analysis=spatial,
            temporal_analysis=temporal,
            suspicious_frames=sorted(frame_results, key=lambda f: f.timestamp),
            total_frames_analyzed=len(frames),
            processing_time_seconds=elapsed,
            analyzed_at=datetime.now(timezone.utc),
            explanation=self._generate_explanation(result, fake_ratio, overall_score),
            recommendations=self._generate_recommendations(result, frame_results),
        )

    # -------------------------------------------------------------------------
    # Shared utilities
    # -------------------------------------------------------------------------

    def _extract_frames(
        self, video_path: str, max_frames: int = 30
    ) -> List[Tuple[np.ndarray, float]]:
        cap = cv2.VideoCapture(video_path)
        frames = []
        try:
            total = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
            fps = cap.get(cv2.CAP_PROP_FPS) or 25.0
            interval = max(1, total // max_frames)
            count = 0
            while cap.isOpened() and len(frames) < max_frames:
                ret, frame = cap.read()
                if not ret:
                    break
                if count % interval == 0:
                    frames.append((frame, count / fps))
                count += 1
        finally:
            cap.release()
        logger.info(f"Extracted {len(frames)} frames")
        return frames

    def _detect_frame_anomalies(self, frame: np.ndarray) -> List[str]:
        anomalies = []
        gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
        if cv2.Laplacian(gray, cv2.CV_64F).var() < 50:
            anomalies.append("Unnatural blur pattern")
        brightness = np.mean(gray)
        if brightness < 50 or brightness > 200:
            anomalies.append("Abnormal lighting conditions")
        edges = cv2.Canny(gray, 50, 150)
        edge_density = np.sum(edges) / edges.size
        if edge_density < 0.02 or edge_density > 0.15:
            anomalies.append("Inconsistent edge patterns")
        hsv = cv2.cvtColor(frame, cv2.COLOR_BGR2HSV)
        if np.std(cv2.calcHist([hsv], [0], None, [180], [0, 180])) < 500:
            anomalies.append("Unnatural color distribution")
        return anomalies

    def _detect_artifact_regions(
        self, frame: np.ndarray, is_fake: bool
    ) -> List[ArtifactRegion]:
        regions = []
        h, w = frame.shape[:2]
        gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)

        # Blur contours
        blur_map = np.abs(cv2.Laplacian(gray, cv2.CV_64F))
        blur_mask = (blur_map < np.percentile(blur_map, 25)).astype(np.uint8) * 255
        for contour in cv2.findContours(
            blur_mask, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE
        )[0]:
            if cv2.contourArea(contour) > w * h * 0.01:
                x, y, cw, ch = cv2.boundingRect(contour)
                regions.append(ArtifactRegion(
                    x=x / w, y=y / h, width=cw / w, height=ch / h,
                    type="blur_anomaly", confidence=0.7 if is_fake else 0.4,
                ))

        # Face regions
        try:
            cascade = cv2.CascadeClassifier(
                cv2.data.haarcascades + "haarcascade_frontalface_default.xml"
            )
            for (fx, fy, fw, fh) in cascade.detectMultiScale(gray, 1.1, 4)[:3]:
                face_roi = gray[fy:fy + fh, fx:fx + fw]
                blur_var = cv2.Laplacian(face_roi, cv2.CV_64F).var()
                # Detect faces with blur, edge, or texture anomalies
                edge_density = np.sum(cv2.Canny(face_roi, 50, 150)) / face_roi.size
                has_blur = blur_var < 200
                has_edge_issue = edge_density < 0.02 or edge_density > 0.12
                if has_blur or has_edge_issue or is_fake:
                    conf = 0.85 if is_fake else 0.55
                    if has_blur and blur_var < 80:
                        conf = min(conf + 0.1, 1.0)
                    regions.append(ArtifactRegion(
                        x=fx / w, y=fy / h, width=fw / w, height=fh / h,
                        type="face_blur", confidence=conf,
                    ))
        except Exception:
            pass

        # Lighting
        center = gray[h // 4:3 * h // 4, w // 4:3 * w // 4]
        if center.size and abs(float(np.mean(center)) - float(np.mean(gray))) > 20:
            regions.append(ArtifactRegion(
                x=0.25, y=0.25, width=0.5, height=0.5,
                type="lighting_inconsistency", confidence=0.75 if is_fake else 0.4,
            ))

        return sorted(regions, key=lambda r: r.confidence, reverse=True)[:15]

    def _fallback_frame_analysis(
        self, frame: np.ndarray, idx: int, timestamp: float
    ) -> FrameAnalysis:
        gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
        score = 0.0
        anomalies = []

        blur = cv2.Laplacian(gray, cv2.CV_64F).var()
        if blur < 150:
            s = (150 - blur) / 150 * 0.35
            score += s
            if s > 0.15:
                anomalies.append(f"Unnatural blur (score: {blur:.0f})")
        elif blur > 800:
            score += 0.25
            anomalies.append(f"Over-sharpened (score: {blur:.0f})")

        edges = cv2.Canny(gray, 50, 150)
        density = np.sum(edges) / edges.size
        if density < 0.03 or density > 0.12:
            score += 0.30
            anomalies.append(f"Inconsistent edges (density: {density:.3f})")

        brightness = np.mean(gray)
        if brightness < 60 or brightness > 195:
            score += 0.20
            anomalies.append(f"Abnormal brightness ({brightness:.0f})")
        if np.std(gray) < 35:
            score += 0.25
            anomalies.append("Unnaturally uniform lighting")

        hsv = cv2.cvtColor(frame, cv2.COLOR_BGR2HSV)
        if np.std(hsv[:, :, 0]) < 25:
            score += 0.20
            anomalies.append("Unnatural color distribution")
        if np.mean(hsv[:, :, 1]) < 30 or np.mean(hsv[:, :, 1]) > 200:
            score += 0.15
            anomalies.append("Abnormal color saturation")

        noise = gray.astype(np.float32) - cv2.GaussianBlur(
            gray, (5, 5), 0
        ).astype(np.float32)
        noise_std = np.std(noise)
        if noise_std < 5:
            score += 0.25
            anomalies.append("Unnaturally clean image")
        elif noise_std > 30:
            score += 0.15
            anomalies.append("Excessive noise")

        score = min(1.0, score)
        is_fake = score > 0.35
        return FrameAnalysis(
            frame_number=idx,
            timestamp=timestamp,
            confidence=score if is_fake else 1.0 - score,
            is_fake=is_fake,
            anomalies=anomalies,
            artifact_regions=self._detect_artifact_regions(frame, is_fake),
        )

    def _determine_result(
        self, overall_score: float, fake_ratio: float
    ) -> DeepfakeResult:
        if fake_ratio >= 0.50 or overall_score >= 0.55:
            return DeepfakeResult.FAKE
        if fake_ratio <= 0.25 and overall_score <= 0.35:
            return DeepfakeResult.REAL
        return DeepfakeResult.UNCERTAIN

    def _calculate_confidence(
        self, overall_score: float, fake_ratio: float
    ) -> float:
        return min(
            1.0,
            (abs(overall_score - 0.5) * 2 + abs(fake_ratio - 0.5) * 2) / 2,
        )

    def _generate_explanation(
        self, result: DeepfakeResult, fake_ratio: float, overall_score: float
    ) -> str:
        pct = int(fake_ratio * 100)
        score_pct = int(overall_score * 100)
        if result == DeepfakeResult.FAKE:
            return (
                f"This video shows strong indicators of manipulation. "
                f"{pct}% of analyzed frames displayed deepfake characteristics. "
                f"Hybrid spatial-temporal score: {score_pct}%."
            )
        if result == DeepfakeResult.REAL:
            return (
                f"This video appears to be authentic. "
                f"Only {pct}% of frames showed suspicious patterns. "
                f"Hybrid detection confidence: {100 - score_pct}% authentic."
            )
        return (
            f"Results are inconclusive. {pct}% of frames flagged as suspicious. "
            f"Hybrid score: {score_pct}%. Manual verification recommended."
        )

    def _generate_recommendations(
        self, result: DeepfakeResult, frame_results: List[FrameAnalysis]
    ) -> List[str]:
        recs = []
        suspicious = sum(1 for f in frame_results if f.is_fake)
        if result == DeepfakeResult.FAKE:
            recs.append("Do not trust this video as authentic")
            recs.append("Look for visual artifacts around faces and edges")
            recs.append("Verify the source and context of this video")
            if suspicious > len(frame_results) * 0.8:
                recs.append("High confidence deepfake -- recommend expert verification")
        elif result == DeepfakeResult.UNCERTAIN:
            recs.append("Exercise caution with this content")
            recs.append("Seek additional verification from trusted sources")
            recs.append("Check for corroborating evidence")
            recs.append("Consider expert analysis for important decisions")
        return recs
