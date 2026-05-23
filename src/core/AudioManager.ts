export class AudioManager {
  ctx: AudioContext | null = null;
  bgmTimer: number | null = null;
  bgmPadNodes: OscillatorNode[] = [];
  bgmGain: GainNode | null = null;
  sfxGain: GainNode | null = null;
  masterGain: GainNode | null = null;
  nextBgmStep: number = 0;
  
  init() {
    if (!this.ctx) {
      this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      this.createMixBus(this.ctx);
    }
    const ctx = this.ctx;
    if (ctx.state === 'suspended') {
      ctx.resume();
    }
  }

  private createMixBus(ctx: AudioContext) {
    this.masterGain = ctx.createGain();
    this.masterGain.gain.value = 0.65;
    this.masterGain.connect(ctx.destination);

    this.bgmGain = ctx.createGain();
    this.bgmGain.gain.value = 0.035;
    this.bgmGain.connect(this.masterGain);

    this.sfxGain = ctx.createGain();
    this.sfxGain.gain.value = 0.7;
    this.sfxGain.connect(this.masterGain);
  }

  private getSfxDestination(ctx: AudioContext): AudioNode {
    if (!this.sfxGain || !this.masterGain) {
      this.createMixBus(ctx);
    }
    return this.sfxGain!;
  }

  private playTone(
    freq: number,
    start: number,
    duration: number,
    type: OscillatorType,
    peak: number,
    destination: AudioNode,
    endFreq?: number,
  ) {
    const ctx = this.ctx;
    if (!ctx) return;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, start);
    if (endFreq) {
      osc.frequency.exponentialRampToValueAtTime(Math.max(20, endFreq), start + duration);
    }

    gain.gain.setValueAtTime(0.0001, start);
    gain.gain.linearRampToValueAtTime(peak, start + Math.min(0.025, duration * 0.25));
    gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);

    osc.connect(gain);
    gain.connect(destination);
    osc.start(start);
    osc.stop(start + duration + 0.02);
  }

  playGrab() {
    const ctx = this.ctx;
    if (!ctx) return;
    const out = this.getSfxDestination(ctx);
    const now = ctx.currentTime;
    this.playTone(260, now, 0.08, 'triangle', 0.12, out, 360);
    this.playTone(160, now + 0.015, 0.11, 'sine', 0.08, out, 120);
  }

  playMoney() {
    const ctx = this.ctx;
    if (!ctx) return;
    const out = this.getSfxDestination(ctx);
    const now = ctx.currentTime;
    [880, 1174, 1568].forEach((freq, i) => {
      this.playTone(freq, now + i * 0.045, 0.16, 'sine', 0.075, out);
    });
  }

  playBomb() {
    const ctx = this.ctx;
    if (!ctx) return;
    const out = this.getSfxDestination(ctx);
    const now = ctx.currentTime;
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(420, now);
    filter.frequency.exponentialRampToValueAtTime(90, now + 0.55);
    filter.connect(out);
    this.playTone(130, now, 0.45, 'sawtooth', 0.22, filter, 35);
    this.playTone(55, now + 0.03, 0.6, 'triangle', 0.16, filter, 28);
  }

  playWin() {
    const ctx = this.ctx;
    if (!ctx) return;
    const out = this.getSfxDestination(ctx);
    const now = ctx.currentTime;
    [523, 659, 784, 1046].forEach((freq, i) => {
      this.playTone(freq, now + i * 0.12, 0.34, 'triangle', 0.11, out);
    });
  }

  playBuy() {
    const ctx = this.ctx;
    if (!ctx) return;
    const out = this.getSfxDestination(ctx);
    const now = ctx.currentTime;
    this.playTone(392, now, 0.12, 'sine', 0.09, out);
    this.playTone(659, now + 0.08, 0.18, 'triangle', 0.08, out);
  }

  playBGM() {
    const ctx = this.ctx;
    if (!ctx) return;
    if (this.bgmTimer !== null) return;
    if (!this.bgmGain || !this.masterGain) {
      this.createMixBus(ctx);
    }

    const padFilter = ctx.createBiquadFilter();
    padFilter.type = 'lowpass';
    padFilter.frequency.value = 900;
    padFilter.Q.value = 0.4;
    padFilter.connect(this.bgmGain!);

    const padGain = ctx.createGain();
    padGain.gain.setValueAtTime(0.0001, ctx.currentTime);
    padGain.gain.linearRampToValueAtTime(0.45, ctx.currentTime + 1.5);
    padGain.connect(padFilter);

    [130.81, 164.81, 196.00].forEach((freq, i) => {
      const osc = ctx.createOscillator();
      osc.type = i === 1 ? 'sine' : 'triangle';
      osc.frequency.value = freq;
      osc.detune.value = i === 0 ? -4 : i === 2 ? 5 : 0;
      osc.connect(padGain);
      osc.start();
      this.bgmPadNodes.push(osc);
    });

    const lfo = ctx.createOscillator();
    lfo.frequency.value = 0.08;
    const lfoGain = ctx.createGain();
    lfoGain.gain.value = 0.012;
    lfo.connect(lfoGain);
    lfoGain.connect(this.bgmGain!.gain);
    lfo.start();
    this.bgmPadNodes.push(lfo);

    const scale = [261.63, 293.66, 329.63, 392.00, 440.00, 392.00, 329.63, 293.66];
    this.bgmTimer = window.setInterval(() => {
      const start = ctx.currentTime + 0.02;
      const freq = scale[this.nextBgmStep % scale.length];
      const out = this.bgmGain!;
      this.playTone(freq, start, 0.55, 'sine', 0.16, out);
      if (this.nextBgmStep % 4 === 0) {
        this.playTone(freq / 2, start, 0.9, 'triangle', 0.10, out);
      }
      this.nextBgmStep++;
    }, 650);
  }
}

export const audioManager = new AudioManager();
