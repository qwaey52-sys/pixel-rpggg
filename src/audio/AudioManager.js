// Если в Phaser загружен внешний трек с нужным ключом, он играет.
// Иначе включается встроенная chiptune-мелодия на Web Audio.

const MELODIES = {
  town: {
    tempo: 120,
    notes: [523, 659, 784, 659, 587, 698, 880, 698, 523, 659, 784, 1047, 784, 659, 587, 523]
  },
  battle: {
    tempo: 160,
    notes: [330, 330, 392, 330, 294, 294, 349, 294, 330, 392, 440, 392, 330, 294, 262, 294]
  },
  ending_good: {
    tempo: 90,
    notes: [523, 659, 784, 1047, 784, 1047, 1319, 1047]
  },
  ending_bad: {
    tempo: 70,
    notes: [220, 208, 196, 185, 175, 165, 147, 131]
  }
};

class AudioManager {
  constructor() {
    this.ctx = null;
    this.scene = null;
    this.current = null;
    this.muted = false;
    this.timer = null;
  }

  init(scene) {
    this.scene = scene;
    // Контекст создаётся при первом касании, так как мобильные браузеры
    // блокируют звук без жеста пользователя.
    scene.input.once('pointerdown', () => this.unlock());
  }

  unlock() {
    if (!this.ctx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (AC) this.ctx = new AC();
    }
    if (this.ctx && this.ctx.state === 'suspended') this.ctx.resume();
  }

  play(key) {
    if (this.current === key) return;
    this.stop();
    this.current = key;

    const sceneSound = this.scene && this.scene.sound.get(key);
    if (this.scene && this.scene.cache.audio.exists(key) && !this.muted) {
      this.bgm = this.scene.sound.add(key, { loop: true, volume: 0.5 });
      this.bgm.play();
      return;
    }
    this.playChiptune(key);
  }

  playChiptune(key) {
    const def = MELODIES[key];
    if (!def || !this.ctx || this.muted) return;
    const stepMs = (60 / def.tempo) * 1000 / 2;
    let i = 0;
    const tick = () => {
      const freq = def.notes[i % def.notes.length];
      this.blip(freq, stepMs / 1000);
      i++;
      this.timer = setTimeout(tick, stepMs);
    };
    tick();
  }

  blip(freq, dur) {
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'square';
    osc.frequency.value = freq;
    gain.gain.value = 0.04;
    gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + dur);
    osc.connect(gain).connect(this.ctx.destination);
    osc.start();
    osc.stop(this.ctx.currentTime + dur);
  }

  stop() {
    if (this.bgm) {
      this.bgm.stop();
      this.bgm = null;
    }
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }
    this.current = null;
  }

  toggleMute() {
    this.muted = !this.muted;
    if (this.muted) this.stop();
    return this.muted;
  }
}

export const audio = new AudioManager();
