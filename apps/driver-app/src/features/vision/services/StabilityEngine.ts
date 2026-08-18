// StabilityEngine.ts — Multi-Frame Motion & Gyroscope Stability Engine

export interface Point2D {
  x: number;
  y: number;
}

export interface StabilityAnalysisResult {
  isStable: boolean;
  cornerDelta: number; // Max movement in pixels between frames
  stableFramesCount: number;
  guidanceKey?: string;
}

export class StabilityEngine {
  private previousPoints: Point2D[] | null = null;
  private stableFramesCount: number = 0;
  private static readonly MAX_ALLOWED_DELTA_PX = 3.5; // Max 3.5px movement allowed
  private static readonly STABLE_THRESHOLD_FRAMES = 4;

  public processFramePoints(currentPoints: Point2D[]): StabilityAnalysisResult {
    if (!this.previousPoints || this.previousPoints.length !== currentPoints.length) {
      this.previousPoints = currentPoints;
      this.stableFramesCount = 0;
      return {
        isStable: false,
        cornerDelta: 99.0,
        stableFramesCount: 0,
        guidanceKey: 'hold_steady',
      };
    }

    // Calculate maximum euclidean distance shift across corners
    let maxDelta = 0;
    for (let i = 0; i < currentPoints.length; i++) {
      const dx = currentPoints[i].x - this.previousPoints[i].x;
      const dy = currentPoints[i].y - this.previousPoints[i].y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist > maxDelta) maxDelta = dist;
    }

    this.previousPoints = currentPoints;

    if (maxDelta <= StabilityEngine.MAX_ALLOWED_DELTA_PX) {
      this.stableFramesCount += 1;
    } else {
      this.stableFramesCount = 0;
    }

    const isStable = this.stableFramesCount >= StabilityEngine.STABLE_THRESHOLD_FRAMES;

    return {
      isStable,
      cornerDelta: Math.round(maxDelta * 10) / 10,
      stableFramesCount: this.stableFramesCount,
      guidanceKey: isStable ? undefined : 'hold_steady',
    };
  }

  public reset(): void {
    this.previousPoints = null;
    this.stableFramesCount = 0;
  }
}
