import { prefersReducedMotion } from "./utils.js";

export class LoveMessage {
  constructor(root, textNode, secondLine) {
    this.root = root;
    this.textNode = textNode;
    this.secondLine = secondLine;
    this.text = "I love you";
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
      this.secondLine.classList.add("is-visible");
      return;
    }

    letters.forEach((letter, index) => {
      window.setTimeout(() => {
        letter.classList.add("is-shown");
      }, 420 + index * 145);
    });

    window.setTimeout(() => {
      this.secondLine.classList.add("is-visible");
    }, 10000);
  }
}
