// DocumentStateMachine.ts — Strictly Enforced eKYC Scanner State Machine

export type ScannerState =
  | 'Searching'
  | 'CandidateDetected'
  | 'Tracking'
  | 'Stable'
  | 'Countdown'
  | 'Capturing'
  | 'PerspectiveCrop'
  | 'QualityValidation'
  | 'Preview'
  | 'Upload';

export interface StateTransitionEvent {
  fromState: ScannerState;
  toState: ScannerState;
  timestamp: number;
  reason?: string;
}

export class DocumentStateMachine {
  private currentState: ScannerState = 'Searching';
  private transitionHistory: StateTransitionEvent[] = [];
  private stateChangeListeners: ((state: ScannerState) => void)[] = [];

  constructor(initialState: ScannerState = 'Searching') {
    this.currentState = initialState;
  }

  public getState(): ScannerState {
    return this.currentState;
  }

  public transitionTo(nextState: ScannerState, reason?: string): boolean {
    if (!this.isValidTransition(this.currentState, nextState)) {
      console.warn(`[DocumentStateMachine] Invalid state transition rejected: ${this.currentState} -> ${nextState}`);
      return false;
    }

    const event: StateTransitionEvent = {
      fromState: this.currentState,
      toState: nextState,
      timestamp: Date.now(),
      reason,
    };

    this.currentState = nextState;
    this.transitionHistory.push(event);

    // Notify listeners
    this.stateChangeListeners.forEach(listener => listener(this.currentState));
    return true;
  }

  public onStateChange(listener: (state: ScannerState) => void): () => void {
    this.stateChangeListeners.push(listener);
    return () => {
      this.stateChangeListeners = this.stateChangeListeners.filter(l => l !== listener);
    };
  }

  public getHistory(): StateTransitionEvent[] {
    return [...this.transitionHistory];
  }

  public reset(): void {
    this.transitionTo('Searching', 'User Reset');
  }

  private isValidTransition(from: ScannerState, to: ScannerState): boolean {
    // Standard linear transitions & reset back to Searching
    if (to === 'Searching') return true;

    const allowedTransitions: Record<ScannerState, ScannerState[]> = {
      Searching: ['CandidateDetected'],
      CandidateDetected: ['Searching', 'Tracking'],
      Tracking: ['Searching', 'CandidateDetected', 'Stable'],
      Stable: ['Searching', 'Tracking', 'Countdown'],
      Countdown: ['Searching', 'Tracking', 'Capturing'],
      Capturing: ['Searching', 'PerspectiveCrop'],
      PerspectiveCrop: ['Searching', 'QualityValidation'],
      QualityValidation: ['Searching', 'Preview'],
      Preview: ['Searching', 'Upload'],
      Upload: ['Searching', 'Preview'],
    };

    return allowedTransitions[from]?.includes(to) ?? false;
  }
}
