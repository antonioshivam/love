import { prefersReducedMotion } from "./utils.js";

export class HeroSection {
  constructor({ stage, button, effects, hearts, message, audio }) {
    this.stage = stage;
    this.button = button;
    this.effects = effects;
    this.hearts = hearts;
    this.message = message;
    this.audio = audio;
    this.opened = false;

    this.button.addEventListener("click", () => this.open());
  }

  async open() {
    if (this.opened) {
      return;
    }

    this.opened = true;
    this.button.classList.add("is-opening");

    if (!prefersReducedMotion()) {
      this.button.animate(
        [
          { transform: "scale(1)", opacity: 1 },
          { transform: "scale(0.92)", opacity: 0.95, offset: 0.35 },
          { transform: "scale(1.08)", opacity: 0.85, offset: 0.58 },
          { transform: "scale(0.68)", opacity: 0 }
        ],
        {
          duration: 920,
          easing: "cubic-bezier(0.22, 1, 0.36, 1)",
          fill: "forwards"
        }
      );
    }

    this.effects.activate(this.button);
    this.hearts.activate();
    this.audio.start();

    window.setTimeout(() => {
      this.message.reveal();
    }, prefersReducedMotion() ? 80 : 1050);
  }
}
