# ADR 001: Autonomous Real-Time Document Vision Engine Architecture

- **Status**: Approved
- **Deciders**: Lead Mobile Architect, Core Agentic Team
- **Date**: 2026-07-26

---

## Context & Problem Statement

The **Yalla VTC Driver App** requires a bank-grade, in-app identity document scanner for Moroccan National Identity Cards and Passports. The solution must provide dynamic edge detection, full-screen background dimming, real-time quad tracking, auto-perspective cropping, and multi-language i18n guidance while maintaining steady 60 FPS performance without leaving the Yalla VTC application shell.

---

## Decision Drivers

1. **User Experience (UX)**: Zero app switching (no external Google Document Scanner Activity popups).
2. **Performance**: Real-time per-frame processing under 25ms latency.
3. **Accuracy**: Eliminating non-document captures (hands, keyboards, tables, ambient objects).
4. **Maintainability**: Decoupled layer architecture separating UI (`IdentityCardScreen`) from Computer Vision processing (`DocumentVisionEngine`).

---

## Considered Options & Decisions

### 1. Camera Framework: `react-native-vision-camera` vs `CameraX` / Native View

- **Chosen Option**: `react-native-vision-camera`
- **Rationale**:
  - Provides direct C++ Worklet frame processor extensions running on a dedicated high-priority background thread.
  - Avoids blocking the main JS UI looper.
  - Seamless React Native cross-platform API for Android and iOS.

---

### 2. Computer Vision Engine: `Native OpenCV C++` vs `ML Kit Document Scanner Activity`

- **Chosen Option**: `Native OpenCV C++` (within Frame Processors)
- **Rationale**:
  - ML Kit Document Scanner Activity launches an external Google Play Services UI activity, which violates the brand identity requirement of remaining 100% inside Yalla VTC.
  - Native OpenCV C++ provides raw pixel matrix access (`Mat`), custom Canny edge detection, contour approximation, and deterministic 4-point perspective warp transformations without licensing costs.

---

### 3. Execution Thread: `Worklet Background Thread` vs `JS Main Thread`

- **Chosen Option**: `Worklet Dedicated Background Thread` (`react-native-worklets-core`)
- **Rationale**:
  - Executing image array manipulations on the JavaScript thread causes UI frame drops and looper stutter.
  - Worklets allow C++ native frame processors to run at native 60 FPS while emitting UI state updates back to React Native.

---

### 4. Classification & Quality: `Deterministic Quality Metrics` vs `OCR Pre-Check`

- **Chosen Option**: `Deterministic Quality Metrics (Blur, Glare, Stability, Confidence Score >= 0.92)`
- **Rationale**:
  - Executing OCR (text extraction) per frame is computationally expensive and introduces 200–500ms latency.
  - Document detection, edge tracking, and quality validation must be 100% decoupled from OCR, running deterministically per frame before capture.

---

## Consequences

- **Positive**:
  - Premium in-app eKYC experience matching Revolut, N26, and Uber Driver.
  - Complete control over neon green brand overlays, custom circular countdowns, and localized i18n dynamic guidance.
  - Modular scalability for future document types (Carte Grise, Driver License, Residence Permit).
- **Negative**:
  - Requires explicit Phase 0 environment compatibility auditing across React Native 0.77, Android NDK, CMake, and C++ Worklet runtimes.
