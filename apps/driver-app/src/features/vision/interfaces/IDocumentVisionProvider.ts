// IDocumentVisionProvider.ts — Decoupled Vision Provider Interface

export type ScannerStatus =
  | 'Searching'
  | 'CandidateDetected'
  | 'Tracking'
  | 'Stable'
  | 'Countdown'
  | 'Capturing'
  | 'Cropping'
  | 'QualityCheck'
  | 'Preview'
  | 'Upload';

export type SpatialGuidanceKey =
  | 'align_center'
  | 'move_closer'
  | 'move_farther'
  | 'move_left'
  | 'move_right'
  | 'correct_tilt'
  | 'hold_still';

export interface DocumentScannerState {
  status: ScannerStatus;
  confidence: number;
  quality: {
    blur: number;
    brightness: number;
    glare: number;
    exposure: 'ok' | 'too_dark' | 'too_bright';
    stability: boolean;
  };
  diagnostics: {
    fps: number;
    latencyMs: number;
    frameCount: number;
    resolution: { width: number; height: number };
    droppedFrames: number;
    quadFound: boolean;
    docType: string;
  };
  spatialGuidance: SpatialGuidanceKey;
  polygon: { x: number; y: number }[] | null;
}

export interface IDocumentVisionProvider {
  start(): void;
  stop(): void;
  getState(): DocumentScannerState;
  registerStateCallback(callback: (state: DocumentScannerState) => void): void;
}
