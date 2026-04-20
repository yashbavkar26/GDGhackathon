# Implementation Plan: Multimodal Local Model (Gemma 4) on Mobile via Flutter

## Phase 1: Environment & Project Setup
1.  **Initialize Flutter Project:** Create a new Flutter project and configure `minSdkVersion` (typically 24+) and iOS deployment targets.
2.  **Permissions Configuration:**
    *   **Android:** Update `AndroidManifest.xml` for `INTERNET`, `CAMERA`, `RECORD_AUDIO`, and `READ_EXTERNAL_STORAGE`.
    *   **iOS:** Update `Info.plist` for `NSCameraUsageDescription`, `NSMicrophoneUsageDescription`, and `NSPhotoLibraryUsageDescription`.
3.  **Dependency Integration:** Add the following to `pubspec.yaml`:
    *   `google_mlkit_commons` or `mediapipe` (for local LLM inference).
    *   `speech_to_text` (for multilingual voice-to-text).
    *   `image_picker` (for image input).
    *   `dio` (for downloading the model files).
    *   `path_provider` (for local storage management).

## Phase 2: Model Management (The Download System)
1.  **Model Hosting:** Host the Gemma 4 model weights and tokenizer files on a cloud storage provider (e.g., Firebase Storage or AWS S3).
2.  **Download Service:**
    *   Implement a service using `dio` to download the model files to the device's `getApplicationDocumentsDirectory()`.
    *   Implement a progress bar UI to show the user the download status.
3.  **Verification:** Use a checksum (SHA-256) verification after downloading to ensure the model file is not corrupted before attempting to load it.

## Phase 3: Local Inference Engine Implementation
1.  **Mediapipe Integration:** Integrate the **Mediapipe LLM Inference API**. This is the optimized way to run Gemma models on mobile hardware (CPU/GPU/NPU).
2.  **Engine Initialization:** Create a singleton class that initializes the inference engine using the local file path of the downloaded Gemma 4 model.
3.  **Multimodal Pipeline:**
    *   **Text Path:** Pass strings directly to the inference engine.
    *   **Voice Path:** Use `speech_to_text` to convert multilingual audio into text, then pass the resulting string to the engine.
    *   **Vision Path:** Use a vision-capable version of the model (or a pipeline where the image is processed into tokens/embeddings) to allow the model to "see" the input.

## Phase 4: UI/UX Development (The Flutter App)
1.  **Chat Interface:** Build a scrollable list of "message bubbles" to display user inputs (text, images, or voice transcripts) and model responses.
2.  **Input Components:**
    *   **Text Input:** A `TextField` with a submit button.
    *   **Voice Button:** A long-press or tap button that triggers the `speech_to_text` listener.
    *   **Image Button:** A button that opens the `image_picker` gallery or camera.
3.  **Output Display:** Implement a streaming text effect so the model's response appears to "type out" in real-time, improving the user experience during inference.

## Phase 5: Testing & Optimization
1.  **Performance Benchmarking:** Test the "Time to First Token" (TTFT) on various hardware levels to ensure the device doesn't freeze during inference.
2.  **Memory Management:** Monitor RAM usage to ensure the model doesn't cause the app to crash (OOM - Out of Memory).
3.  **Multilingual Accuracy:** Validate that the `speech_to_text` engine correctly captures various languages before passing them to Gemma 4.
