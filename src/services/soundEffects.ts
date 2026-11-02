// Procedural Web Audio API Synthesizer for Mindful Tactile Sounds
let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!audioCtx) {
    const AudioContextClass =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume().catch(() => {});
  }
  return audioCtx;
}

/**
 * Tactile fluid slosh sound when interacting with the Soap Mixture vial
 */
export function playVialSloshSound(): void {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    const now = ctx.currentTime;

    // Dual resonant band-pass filter on low harmonic
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const filter = ctx.createBiquadFilter();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(320, now);
    osc.frequency.exponentialRampToValueAtTime(180, now + 0.18);
    osc.frequency.exponentialRampToValueAtTime(260, now + 0.32);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(450, now);

    gain.gain.setValueAtTime(0.001, now);
    gain.gain.linearRampToValueAtTime(0.12, now + 0.05);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.36);
  } catch (err) {}
}

/**
 * Wand Dipping & Breath Blowing Sound (White-noise breath swelling into a 680Hz chime)
 */
export function playWandBlowSound(): void {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    const now = ctx.currentTime;

    // Breath oscillator
    const breath = ctx.createOscillator();
    const breathGain = ctx.createGain();

    breath.type = 'triangle';
    breath.frequency.setValueAtTime(220, now);
    breath.frequency.linearRampToValueAtTime(160, now + 0.45);

    breathGain.gain.setValueAtTime(0.001, now);
    breathGain.gain.linearRampToValueAtTime(0.1, now + 0.15);
    breathGain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);

    breath.connect(breathGain);
    breathGain.connect(ctx.destination);

    // Chime upon detachment
    const chime = ctx.createOscillator();
    const chimeGain = ctx.createGain();

    chime.type = 'sine';
    chime.frequency.setValueAtTime(680, now + 0.2);
    chime.frequency.exponentialRampToValueAtTime(1020, now + 0.4);

    chimeGain.gain.setValueAtTime(0.001, now + 0.2);
    chimeGain.gain.linearRampToValueAtTime(0.06, now + 0.25);
    chimeGain.gain.exponentialRampToValueAtTime(0.001, now + 0.55);

    chime.connect(chimeGain);
    chimeGain.connect(ctx.destination);

    breath.start(now);
    breath.stop(now + 0.52);

    chime.start(now + 0.2);
    chime.stop(now + 0.58);
  } catch (err) {}
}

/**
 * Rounded liquid bubble burst (soothing acoustic pop)
 */
export function playBubblePopSound(): void {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    const now = ctx.currentTime;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(420, now);
    osc.frequency.exponentialRampToValueAtTime(780, now + 0.05);

    gain.gain.setValueAtTime(0.16, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.09);
  } catch (err) {}
}

/**
 * Morning dew condensation chime
 */
export function playDewChimeSound(): void {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    const now = ctx.currentTime;

    [523.25, 659.25, 783.99].forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + i * 0.08);

      gain.gain.setValueAtTime(0.001, now + i * 0.08);
      gain.gain.linearRampToValueAtTime(0.08, now + i * 0.08 + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.08 + 0.35);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now + i * 0.08);
      osc.stop(now + i * 0.08 + 0.38);
    });
  } catch (err) {}
}

/**
 * Letter sealing tap
 */
export function playWaxSealSound(): void {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    const now = ctx.currentTime;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(180, now);
    osc.frequency.exponentialRampToValueAtTime(80, now + 0.08);

    gain.gain.setValueAtTime(0.14, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.09);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.1);
  } catch (err) {}
}

// Backward compatibility alias
export const playBreezeBlowingSound = playWandBlowSound;
