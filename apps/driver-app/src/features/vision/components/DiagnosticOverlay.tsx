// DiagnosticOverlay.tsx — Milestone 1.5 Real-Time Telemetry HUD Component
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { DocumentScannerState } from '../interfaces/IDocumentVisionProvider';

interface DiagnosticOverlayProps {
  state: DocumentScannerState;
  visible?: boolean;
}

export const DiagnosticOverlay: React.FC<DiagnosticOverlayProps> = ({ state, visible = true }) => {
  if (!__DEV__ || !visible) return null;

  const { diagnostics, quality, confidence, status, spatialGuidance } = state;

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.titleText}>⚡ Milestone 1.5 — Live Vision Telemetry HUD</Text>
        <Text style={styles.statusBadge}>{status}</Text>
      </View>

      <Text style={styles.metricsText}>
        FPS: <Text style={styles.highlight}>{diagnostics.fps}</Text> | Res: {diagnostics.resolution.width}×{diagnostics.resolution.height} | Frame #{diagnostics.frameCount}
      </Text>

      <Text style={styles.metricsText}>
        Latency: <Text style={styles.highlight}>{diagnostics.latencyMs}ms</Text> | Brightness: {quality.brightness} | Exposure: {quality.exposure}
      </Text>

      <View style={styles.gridRow}>
        <Text style={styles.pill}>Quad: {diagnostics.quadFound ? '✅ YES' : '❌ NO'}</Text>
        <Text style={styles.pill}>Confidence: {(confidence * 100).toFixed(0)}%</Text>
        <Text style={styles.pill}>Stable: {quality.stability ? 'YES' : 'NO'}</Text>
      </View>

      <Text style={styles.guidanceText}>
        Guidance: <Text style={{ color: '#16C47F', fontWeight: 'bold' }}>{spatialGuidance}</Text>
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 85,
    left: 14,
    right: 14,
    backgroundColor: 'rgba(0, 0, 0, 0.88)',
    borderRadius: 10,
    padding: 10,
    borderWidth: 1,
    borderColor: '#16C47F',
    zIndex: 999,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  titleText: {
    color: '#16C47F',
    fontWeight: 'bold',
    fontSize: 11,
  },
  statusBadge: {
    color: '#000',
    backgroundColor: '#16C47F',
    fontSize: 9,
    fontWeight: 'bold',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  metricsText: {
    color: '#E2E8F0',
    fontSize: 10,
    marginBottom: 2,
    fontFamily: 'monospace',
  },
  highlight: {
    color: '#22C55E',
    fontWeight: 'bold',
  },
  gridRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 4,
    marginBottom: 2,
  },
  pill: {
    color: '#CBD5E1',
    fontSize: 9,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  guidanceText: {
    color: '#94A3B8',
    fontSize: 10,
    marginTop: 2,
  },
});
