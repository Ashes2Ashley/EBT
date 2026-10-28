/**
 * Tactical Web Audio chime generator for OSINT alert triggers
 */
class TacticalAudio {
  private ctx: AudioContext | null = null;
  private soundEnabled = true;

  constructor() {
    // Initialized on user interaction
  }

  public setSoundEnabled(enabled: boolean) {
    this.soundEnabled = enabled;
  }

  public isEnabled(): boolean {
    return this.soundEnabled;
  }

  private initCtx() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public playAlertChime(severity: 'CRITICAL' | 'HIGH' | 'MED' = 'CRITICAL') {
    if (!this.soundEnabled || typeof window === 'undefined') return;
    try {
      this.initCtx();
      if (!this.ctx) return;

      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      if (severity === 'CRITICAL') {
        // High urgency two-tone cyber alert
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(880, now);
        osc.frequency.setValueAtTime(1200, now + 0.1);
        osc.frequency.setValueAtTime(950, now + 0.2);

        gain.gain.setValueAtTime(0.08, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

        osc.start(now);
        osc.stop(now + 0.35);
      } else if (severity === 'HIGH') {
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(660, now);
        osc.frequency.setValueAtTime(880, now + 0.1);

        gain.gain.setValueAtTime(0.05, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);

        osc.start(now);
        osc.stop(now + 0.25);
      } else {
        // Subtle tactile ping
        osc.type = 'sine';
        osc.frequency.setValueAtTime(520, now);

        gain.gain.setValueAtTime(0.03, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);

        osc.start(now);
        osc.stop(now + 0.15);
      }
    } catch {
      // Audio playback gracefully suppressed if audio hardware unavailable
    }
  }
}

export const soundManager = new TacticalAudio();
