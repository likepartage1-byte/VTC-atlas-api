// useDocumentScanner.ts — Clean React Integration Hook for DocumentVisionEngine
import { useState, useEffect, useRef } from 'react';
import { DocumentVisionEngine } from '../DocumentVisionEngine';
import { DocumentScannerState } from '../interfaces/IDocumentVisionProvider';

export function useDocumentScanner() {
  const engineRef = useRef<DocumentVisionEngine | null>(null);
  if (!engineRef.current) {
    engineRef.current = new DocumentVisionEngine();
  }

  const [scannerState, setScannerState] = useState<DocumentScannerState>(
    engineRef.current.getState()
  );

  useEffect(() => {
    const engine = engineRef.current!;
    engine.start();

    engine.registerStateCallback((newState) => {
      setScannerState(newState);
    });

    return () => {
      engine.stop();
    };
  }, []);

  const processFrame = (width: number, height: number) => {
    engineRef.current?.processFrameTelemetry(width, height);
  };

  return {
    scannerState,
    processFrame,
    engine: engineRef.current!,
  };
}
