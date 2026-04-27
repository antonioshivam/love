import {
  clamp,
  mapRange,
  random,
  randomInt,
  removeAfterAnimation
} from "./utils.js";

const NOTES = [
  "forever yours",
  "my everything",
  "always & always",
  "drishti",
  "every heartbeat",
  "only you",
  "kiss me slowly",
  "your smile",
  "mine, softly",
  "little forever",
  "stay close",
  "xoxo",
  "my favorite hello",
  "blushing again"
];

const FLIRTY_BURSTS = [
  "miss me?",
  "come closer",
  "that smile...",
  "you + me",
  "heart stolen",
  "dangerously cute",
  "just yours",
  "one more kiss"
];

export class EffectsLayer {
  constructor(root, stage, heartSystem) {
    this.root = root;
    this.stage = stage;
    this.heartSystem = heartSystem;
    this.particleLayer = root.querySelector("#particle-layer");
    this.noteLayer = root.querySelector("#note-layer");
    this.flirtyLayer = root.querySelector("#flirty-layer");
    this.petalLayer = root.querySelector("#petal-layer");
    this.sparkleLayer = root.querySelector("#sparkle-layer");
    this.rippleLayer = root.querySelector("#ripple-layer");
    this.active = false;
    this.lastSparkle = 0;
    this.lastWhisper = 0;
    this.petalTimer = null;
    this.whisperTimer = null;
    this.longPressTimer = null;
    this.pressPoint = null;

    this.createParticles();
    this.createNotes();
    this.bindPointer();
  }

  activate(fromElement) {
    if (this.active) {
      return;
    }

    this.active = true;
    this.stage.classList.add("is-awakened");
    this.bloomFromElement(fromElement);
    this.seedPetals();
    this.startPetals();
    this.startAmbientWhispers();
  }

  createParticles() {
    const count = window.innerWidth < 720 ? 42 : 68;

    for (let index = 0; index < count; index += 1) {
      const particle = document.createElement("span");
      particle.className = "particle";
      particle.style.setProperty("--x", `${random(0, 100).toFixed(2)}%`);
      particle.style.setProperty("--y", `${random(0, 100).toFixed(2)}%`);
      particle.style.setProperty("--size", `${random(1.2, 3.6).toFixed(2)}px`);
      particle.style.setProperty("--opacity", random(0.18, 0.72).toFixed(2));
      particle.style.setProperty("--duration", `${random(6, 14).toFixed(2)}s`);
      particle.style.setProperty("--delay", `${random(-14, 0).toFixed(2)}s`);
      particle.style.setProperty("--drift", `${random(-22, 22).toFixed(2)}px`);
      this.particleLayer.append(particle);
    }
  }

  createNotes() {
    const count = window.innerWidth < 720 ? 14 : 24;

    for (let index = 0; index < count; index += 1) {
      const note = document.createElement("span");
      note.className = "romantic-note";
      note.textContent = NOTES[randomInt(0, NOTES.length - 1)];
      note.style.setProperty("--x", `${random(-5, 88).toFixed(2)}%`);
      note.style.setProperty("--y", `${random(8, 84).toFixed(2)}%`);
      note.style.setProperty("--rotate", `${random(-13, 13).toFixed(2)}deg`);
      note.style.setProperty("--opacity", random(0.14, 0.38).toFixed(2));
      note.style.setProperty("--duration", `${random(11, 19).toFixed(2)}s`);
      note.style.setProperty("--delay", `${random(-20, 8).toFixed(2)}s`);
      this.noteLayer.append(note);
    }
  }

  bindPointer() {
    window.addEventListener("pointermove", (event) => {
      const x = clamp(mapRange(event.clientX, 0, window.innerWidth, -1, 1), -1, 1);
      const y = clamp(mapRange(event.clientY, 0, window.innerHeight, -1, 1), -1, 1);
      this.stage.style.setProperty("--cursor-x", x.toFixed(3));
      this.stage.style.setProperty("--cursor-y", y.toFixed(3));

      if (this.active) {
        this.createSparkle(event.clientX, event.clientY);
      }
    });

    window.addEventListener("pointerdown", (event) => {
      this.pressPoint = { x: event.clientX, y: event.clientY };
      this.longPressTimer = window.setTimeout(() => {
        if (!this.active || !this.pressPoint) {
          return;
        }

        this.createRipple(this.pressPoint.x, this.pressPoint.y, true);
        this.heartSystem.createBurst(this.pressPoint.x, this.pressPoint.y, 24, true);
      }, 620);
    });

    window.addEventListener("pointerup", (event) => {
      window.clearTimeout(this.longPressTimer);
      this.longPressTimer = null;

      if (!this.active) {
        return;
      }

      this.createRipple(event.clientX, event.clientY, false);
      this.heartSystem.createBurst(event.clientX, event.clientY, randomInt(6, 11));
      this.createWhisper(event.clientX, event.clientY, true);
    });

    window.addEventListener("pointercancel", () => {
      window.clearTimeout(this.longPressTimer);
      this.longPressTimer = null;
      this.pressPoint = null;
    });
  }

  seedPetals() {
    const count = window.innerWidth < 720 ? 18 : 32;

    for (let index = 0; index < count; index += 1) {
      this.createPetal({
        x: random(-5, 105),
        y: random(-12, 92),
        delay: random(-10, 2)
      });
    }
  }

  startPetals() {
    if (this.petalTimer) {
      return;
    }

    this.petalTimer = window.setInterval(() => {
      this.createPetal();
    }, window.innerWidth < 720 ? 920 : 620);
  }

  createPetal({ x = random(-8, 108), y = -10, delay = 0 } = {}) {
    const petal = document.createElement("span");
    petal.className = "rose-petal";
    petal.style.setProperty("--x", `${x.toFixed(2)}vw`);
    petal.style.setProperty("--y", `${y.toFixed(2)}vh`);
    petal.style.setProperty("--size", `${random(0.55, 1.15).toFixed(2)}rem`);
    petal.style.setProperty("--drift", `${random(-9, 9).toFixed(2)}rem`);
    petal.style.setProperty("--rotate", `${random(-38, 38).toFixed(2)}deg`);
    petal.style.setProperty("--duration", `${random(9, 16).toFixed(2)}s`);
    petal.style.setProperty("--delay", `${delay.toFixed(2)}s`);
    petal.style.setProperty("--opacity", random(0.18, 0.48).toFixed(2));
    this.petalLayer.append(petal);
    removeAfterAnimation(petal);
  }

  startAmbientWhispers() {
    if (this.whisperTimer) {
      return;
    }

    this.whisperTimer = window.setInterval(() => {
      this.createWhisper(
        random(window.innerWidth * 0.16, window.innerWidth * 0.84),
        random(window.innerHeight * 0.18, window.innerHeight * 0.78),
        false
      );
    }, 2700);
  }

  createWhisper(x, y, strong) {
    if (!this.flirtyLayer) {
      return;
    }

    const now = performance.now();
    if (!strong && now - this.lastWhisper < 1300) {
      return;
    }

    this.lastWhisper = now;
    const whisper = document.createElement("span");
    whisper.className = `flirty-whisper ${strong ? "is-strong" : ""}`;
    whisper.textContent = FLIRTY_BURSTS[randomInt(0, FLIRTY_BURSTS.length - 1)];
    whisper.style.setProperty("--x", `${x}px`);
    whisper.style.setProperty("--y", `${y}px`);
    whisper.style.setProperty("--float-x", `${random(-2.4, 2.4).toFixed(2)}rem`);
    whisper.style.setProperty("--rotate", `${random(-8, 8).toFixed(2)}deg`);
    whisper.style.setProperty("--duration", `${strong ? random(1.7, 2.3) : random(2.4, 3.4)}s`);
    this.flirtyLayer.append(whisper);
    removeAfterAnimation(whisper);
  }

  createSparkle(x, y) {
    const now = performance.now();
    if (now - this.lastSparkle < 48) {
      return;
    }

    this.lastSparkle = now;
    const sparkle = document.createElement("span");
    sparkle.className = "sparkle";
    sparkle.style.setProperty("--x", `${x + random(-6, 6)}px`);
    sparkle.style.setProperty("--y", `${y + random(-6, 6)}px`);
    sparkle.style.setProperty("--dx", `${random(-14, 14)}px`);
    sparkle.style.setProperty("--dy", `${random(-18, 10)}px`);
    sparkle.style.setProperty("--size", `${random(4, 9)}px`);
    this.sparkleLayer.append(sparkle);
    removeAfterAnimation(sparkle);
  }

  createRipple(x, y, strong) {
    const ripple = document.createElement("span");
    ripple.className = "love-ripple";
    ripple.style.setProperty("--x", `${x}px`);
    ripple.style.setProperty("--y", `${y}px`);
    ripple.style.setProperty("--size", strong ? "16rem" : "8rem");
    ripple.style.setProperty("--duration", strong ? "1.45s" : "0.95s");
    this.rippleLayer.append(ripple);
    removeAfterAnimation(ripple);
  }

  bloomFromElement(element) {
    const rect = element.getBoundingClientRect();
    const x = rect.left + rect.width / 2;
    const y = rect.top + rect.height / 2;
    const bloom = document.createElement("span");
    bloom.className = "center-bloom";
    bloom.style.setProperty("--x", `${x}px`);
    bloom.style.setProperty("--y", `${y}px`);
    this.rippleLayer.append(bloom);
    removeAfterAnimation(bloom);

    for (let index = 0; index < 24; index += 1) {
      const dot = document.createElement("span");
      dot.className = "button-burst";
      dot.style.setProperty("--x", `${x}px`);
      dot.style.setProperty("--y", `${y}px`);
      dot.style.setProperty("--angle", `${index * 15 + random(-4, 4)}deg`);
      dot.style.setProperty("--distance", `${random(3.8, 8.8)}rem`);
      this.rippleLayer.append(dot);
      removeAfterAnimation(dot);
    }
  }
}
