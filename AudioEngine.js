export class AudioEngine {
  constructor(toggle) {
    this.toggle = toggle;
    this.context = null;
    this.master = null;
    this.oscillators = [];
    this.bellTimer = null;
    this.enabled = true;
    this.started = false;
    this.loveCuePlayed = false;
    this.voices = [];

    this.loadVoices();
    if ("speechSynthesis" in window) {
      window.speechSynthesis.addEventListener("voiceschanged", () => {
        this.loadVoices();
      });
    }

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

  loadVoices() {
    if (!("speechSynthesis" in window)) {
      return;
    }

    this.voices = window.speechSynthesis.getVoices();
  }

  async waitForVoices() {
    this.loadVoices();

    if (this.voices.length) {
      return;
    }

    await new Promise((resolve) => window.setTimeout(resolve, 180));
    this.loadVoices();
  }

  scoreDeepVoice(voice) {
    const name = voice.name.toLowerCase();
    const langScore = voice.lang.startsWith("en") ? 30 : 0;
    const naturalScore = /(natural|neural|online|premium|enhanced)/.test(name) ? 25 : 0;
    const maleScore = /(male|david|mark|guy|alex|daniel|ryan|thomas|george|fred|james|liam|oliver|arthur|aaron|ravi)/.test(name)
      ? 35
      : 0;
    const avoidScore = /(female|zira|samantha|susan|hazel|heera)/.test(name) ? -40 : 0;

    return langScore + naturalScore + maleScore + avoidScore;
  }

  pickDeepRomanticVoice() {
    if (!this.voices.length) {
      this.loadVoices();
    }

    const englishVoices = this.voices.filter((voice) => voice.lang.startsWith("en"));
    const candidates = englishVoices.length ? englishVoices : this.voices;

    if (!candidates.length) {
      return null;
    }

    return [...candidates].sort((a, b) => this.scoreDeepVoice(b) - this.scoreDeepVoice(a))[0];
  }

  async playLoveYouCue() {
    if (this.loveCuePlayed || !this.enabled) {
      return;
    }

    this.loveCuePlayed = true;
    await this.resume();
    await this.waitForVoices();
    this.playDeepRomanticBed();
    this.playLoveChime();

    if (!("speechSynthesis" in window)) {
      return;
    }

    const utterance = new SpeechSynthesisUtterance("I love you");
    utterance.lang = "en-US";
    utterance.rate = 0.62;
    utterance.pitch = 0.48;
    utterance.volume = 0.96;

    const voice = this.pickDeepRomanticVoice();
    if (voice) {
      utterance.voice = voice;
      utterance.lang = voice.lang;
    }

    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);
  }

  playDeepRomanticBed() {
    if (!this.context || !this.master || !this.enabled) {
      return;
    }

    const now = this.context.currentTime;
    const filter = this.context.createBiquadFilter();
    const gain = this.context.createGain();
    const pulse = this.context.createOscillator();
    const warmth = this.context.createOscillator();

    filter.type = "lowpass";
    filter.frequency.setValueAtTime(420, now);
    filter.Q.value = 0.9;

    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(0.06, now + 0.14);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 2.4);

    pulse.type = "sine";
    warmth.type = "triangle";
    pulse.frequency.setValueAtTime(86, now);
    warmth.frequency.setValueAtTime(129, now);

    pulse.connect(filter);
    warmth.connect(filter);
    filter.connect(gain);
    gain.connect(this.master);

    pulse.start(now);
    warmth.start(now + 0.05);
    pulse.stop(now + 2.45);
    warmth.stop(now + 2.45);
  }

  playLoveChime() {
    if (!this.context || !this.master || !this.enabled) {
      return;
    }

    const now = this.context.currentTime;
    const notes = [523.25, 659.25, 783.99];

    notes.forEach((frequency, index) => {
      const oscillator = this.context.createOscillator();
      const gain = this.context.createGain();
      const start = now + index * 0.16;

      oscillator.type = "sine";
      oscillator.frequency.setValueAtTime(frequency, start);
      gain.gain.setValueAtTime(0.0001, start);
      gain.gain.exponentialRampToValueAtTime(0.075, start + 0.045);
      gain.gain.exponentialRampToValueAtTime(0.0001, start + 1.15);

      oscillator.connect(gain);
      gain.connect(this.master);
      oscillator.start(start);
      oscillator.stop(start + 1.2);
    });
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
