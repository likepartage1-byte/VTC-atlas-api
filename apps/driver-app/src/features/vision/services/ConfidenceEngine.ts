// ConfidenceEngine.ts — Composite Weighted Score Engine (0% to 100%)

export interface ConfidenceEvaluation {
  score: number; // 0 to 100
  isConfidenceMet: boolean; // >= 92%
  aspectMatchScore: number;
  qualityMatchScore: number;
  stabilityMatchScore: number;
  geometryMatchScore: number;
}

export class ConfidenceEngine {
  private static readonly CONFIDENCE_PASS_THRESHOLD = 92;

  public static evaluate(
    ratioConfidence: number, // 0.0 to 1.0 from DocumentClassifier
    qualityScore: number, // 0.0 to 1.0 from DocumentQualityEngine
    isStable: boolean, // boolean from StabilityEngine
    isQuadValid: boolean // boolean from QuadDetector
  ): ConfidenceEvaluation {
    const aspectMatchScore = Math.round(ratioConfidence * 30); // Max 30 points
    const qualityMatchScore = Math.round(qualityScore * 35); // Max 35 points
    const stabilityMatchScore = isStable ? 20 : 5; // Max 20 points
    const geometryMatchScore = isQuadValid ? 15 : 0; // Max 15 points

    const totalScore = Math.min(100, aspectMatchScore + qualityMatchScore + stabilityMatchScore + geometryMatchScore);
    const isConfidenceMet = totalScore >= this.CONFIDENCE_PASS_THRESHOLD;

    return {
      score: totalScore,
      isConfidenceMet,
      aspectMatchScore,
      qualityMatchScore,
      stabilityMatchScore,
      geometryMatchScore,
    };
  }
}
