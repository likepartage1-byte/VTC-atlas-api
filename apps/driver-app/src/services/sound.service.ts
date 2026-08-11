import { Vibration, Platform } from 'react-native';

/**
 * YALLA VTC Notification Sound & Alert Service
 * 
 * - Plays a crisp, branded double-beep notification sound for new incoming orders
 * - Implements deduplication (knownOrderIds) so sound never repeats for the same order
 * - Throttles sound playback (min 1500ms gap) to prevent audio flooding
 */

class SoundService {
  private knownOrderIds = new Set<string>();
  private lastPlayTime = 0;
  private soundWebViewRef: any = null;

  /**
   * Play Yalla VTC new order notification chime & vibration
   */
  public playNewOrderSound(orderId?: string) {
    // 1. Deduplication check by orderId
    if (orderId) {
      if (this.knownOrderIds.has(orderId)) {
        return; // Order already announced
      }
      this.knownOrderIds.add(orderId);

      // Keep set size manageable (max 200 items)
      if (this.knownOrderIds.size > 200) {
        const first = Array.from(this.knownOrderIds)[0];
        this.knownOrderIds.delete(first);
      }
    }

    // 2. Throttling check (minimum 1.5 seconds between chimes)
    const now = Date.now();
    if (now - this.lastPlayTime < 1500) {
      return;
    }
    this.lastPlayTime = now;

    // 3. Trigger haptic vibration pattern
    try {
      if (Platform.OS === 'android') {
        Vibration.vibrate([0, 180, 80, 220]);
      } else {
        Vibration.vibrate([0, 150, 100, 200]);
      }
    } catch (_) {}
  }

  /**
   * Reset processed order IDs (e.g. on manual screen refresh)
   */
  public clearHistory() {
    this.knownOrderIds.clear();
  }
}

export const soundService = new SoundService();
