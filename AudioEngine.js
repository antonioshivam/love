export class AudioEngine {
  constructor(toggle) {
    this.toggle = toggle;
    this.context = null;
    this.master = null;
    this.oscillators = [];
    this.bellTimer = null;
    this.enabled = true;
    this.started = false;

    this.toggle.addEventListener("click", () => this.toggleMute());
  }

  async start() {
    if (this.started) {
      await this.resume();
      return;
    }

    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) {
      this.toggle.hidden = true;
      return;
    }

    this.context = new AudioContext();
    this.master = this.context.createGain();
    this.master.gain.value = 0.0001;
    this.master.connect(this.context.destination);

    this.createPad();
    this.scheduleBells();
    this.started = true;
    this.enabled = true;
    this.toggle.hidden = false;
    requestAnimationFrame(() => this.toggle.classList.add("is-visible"));
    this.setToggleState();

    await this.resume();
    this.fadeTo(0.038, 2.8);
  }

  async resume() {
    if (this.context?.state === "suspended") {
      await this.context.resume();
    }
  }

  createPad() {
    const notes = [220, 277.18, 329.63, 440];

    notes.forEach((frequency, index) => {
      const oscillator = this.context.createOscillator();
      const gain = this.context.createGain();
      const lfo = this.context.createOscillator();
      const lfoGain = this.context.createGain();

      oscillator.type = index % 2 ? "sine" : "triangle";
      oscillator.frequency.value = frequency;
      gain.gain.value = 0.05 / notes.length;

      lfo.frequency.value = 0.045 + index * 0.012;
      lfoGain.gain.value = 2.5;
      lfo.connect(lfoGain);
      lfoGain.connect(oscillator.frequency);

      oscillator.connect(gain);
      gain.connect(this.master);
      oscillator.start();
      lfo.start();

      this.oscillators.push(oscillator, lfo);
    });
  }

  scheduleBells() {
    const playBell = () => {
      if (!this.context || !this.enabled) {
        return;
      }

      const now = this.context.currentTime;
      const oscillator = this.context.createOscillator();
      const gain = this.context.createGain();
      const frequencies = [554.37, 659.25, 739.99, 880];
      oscillator.type = "sine";
      oscillator.frequency.value =
        frequencies[Math.floor(Math.random() * frequencies.length)];
      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.exponentialRampToValueAtTime(0.035, now + 0.08);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 2.6);
      oscillator.connect(gain);
      gain.connect(this.master);
      oscillator.start(now);
      oscillator.stop(now + 2.7);
    };

    this.bellTimer = window.setInterval(playBell, 4200);
  }

  fadeTo(value, seconds) {
    if (!this.master || !this.context) {
      return;
    }

    const now = this.context.currentTime;
    this.master.gain.cancelScheduledValues(now);
    this.master.gain.setTargetAtTime(value, now, seconds / 4);
  }

  toggleMute() {
    if (!this.started) {
      return;
    }

    this.enabled = !this.enabled;
    this.fadeTo(this.enabled ? 0.038 : 0.0001, 1.2);
    this.setToggleState();
  }

  setToggleState() {
    this.toggle.setAttribute("aria-pressed", String(this.enabled));
    this.toggle.querySelector(".audio-label").textContent = this.enabled
      ? "sound on"
      : "muted";
  }
}
