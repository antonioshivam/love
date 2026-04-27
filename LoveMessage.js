import { prefersReducedMotion } from "./utils.js";

export class LoveMessage {
  constructor(root, textNode, secondLine, flirtyLine) {
    this.root = root;
    this.textNode = textNode;
    this.secondLine = secondLine;
    this.flirtyLine = flirtyLine;
    this.text = "I love you";
    this.flirtyLines = [
      "you make my heart forget how to behave",
      "come closer, this love has your name on it",
      "your smile is my favorite kind of trouble",
      "if kisses were stars, I would give you the sky",
      "you are my sweetest little distraction",
      "one look from you, and the whole world blushes"
    ];
    this.flirtyIndex = 0;
    this.flirtyTimer = null;
    this.revealed = false;
    this.renderLetters();
  }

  renderLetters() {
    this.textNode.textContent = "";

    [...this.text].forEach((character, index) => {
      const span = document.createElement("span");
      span.className = character === " " ? "space" : "letter";
      span.dataset.index = index;
      span.innerHTML = character === " " ? "&nbsp;" : character;
      this.textNode.append(span);
    });
  }

  reveal() {
    if (this.revealed) {
      return;
    }

    this.revealed = true;
    this.root.removeAttribute("aria-hidden");
    this.root.classList.add("is-visible");

    const letters = [...this.textNode.querySelectorAll(".letter")];

    if (prefersReducedMotion()) {
      letters.forEach((letter) => letter.classList.add("is-shown"));
      this.showFlirtyLine();
      this.secondLine.classList.add("is-visible");
      return;
    }

    letters.forEach((letter, index) => {
      window.setTimeout(() => {
        letter.classList.add("is-shown");
      }, 420 + index * 145);
    });

    window.setTimeout(() => {
      this.showFlirtyLine();
      this.startFlirtyCycle();
    }, 1700);

    window.setTimeout(() => {
      this.secondLine.classList.add("is-visible");
    }, 8200);
  }

  showFlirtyLine() {
    if (!this.flirtyLine) {
      return;
    }

    this.flirtyLine.textContent = this.flirtyLines[this.flirtyIndex];
    this.flirtyLine.classList.add("is-visible");
  }

  startFlirtyCycle() {
    if (!this.flirtyLine || this.flirtyTimer) {
      return;
    }

    this.flirtyTimer = window.setInterval(() => {
      this.flirtyLine.classList.remove("is-visible");
      window.setTimeout(() => {
        this.flirtyIndex = (this.flirtyIndex + 1) % this.flirtyLines.length;
        this.flirtyLine.textContent = this.flirtyLines[this.flirtyIndex];
        this.flirtyLine.classList.add("is-visible");
      }, 520);
    }, 3900);
  }
}
