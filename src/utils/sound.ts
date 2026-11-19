let audioCtx: AudioContext | null = null;

function getContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!AudioCtx) return null;
  if (!audioCtx) {
    audioCtx = new AudioCtx();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume().catch(() => {});
  }
  return audioCtx;
}

function playTone(
  freq: number,
  durationSec: number,
  startOffsetSec = 0,
  type: OscillatorType = 'sine',
  gainPeak = 0.09
) {
  const ctx = getContext();
  if (!ctx) return;

  const now = ctx.currentTime + startOffsetSec;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = type;
  osc.frequency.setValueAtTime(freq, now);

  gain.gain.setValueAtTime(0.0001, now);
  gain.gain.exponentialRampToValueAtTime(gainPeak, now + 0.02);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + durationSec);

  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.start(now);
  osc.stop(now + durationSec + 0.02);
}

export function playSuccessChime(enabled: boolean): void {
  if (!enabled) return;
  try {
    playTone(523.25, 0.14, 0, 'triangle', 0.09); // C5
    playTone(659.25, 0.14, 0.1, 'triangle', 0.09); // E5
    playTone(783.99, 0.22, 0.2, 'triangle', 0.1); // G5
  } catch {
    // Audio optional
  }
}

export function playWrongChime(enabled: boolean): void {
  if (!enabled) return;
  try {
    playTone(310, 0.16, 0, 'sine', 0.07);
    playTone(250, 0.22, 0.12, 'sine', 0.07);
  } catch {
    // Audio optional
  }
}

export function playStepTick(enabled: boolean): void {
  if (!enabled) return;
  try {
    playTone(587.33, 0.08, 0, 'sine', 0.05);
  } catch {
    // Audio optional
  }
}

export function playFanfare(enabled: boolean): void {
  if (!enabled) return;
  try {
    playTone(523.25, 0.12, 0, 'triangle', 0.09);
    playTone(659.25, 0.12, 0.1, 'triangle', 0.09);
    playTone(783.99, 0.12, 0.2, 'triangle', 0.09);
    playTone(1046.5, 0.34, 0.3, 'triangle', 0.11);
  } catch {
    // Audio optional
  }
}
