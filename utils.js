export const prefersReducedMotion = () =>
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

export const random = (min, max) => Math.random() * (max - min) + min;

export const randomInt = (min, max) =>
  Math.floor(random(min, max + 1));

export const clamp = (value, min, max) =>
  Math.min(Math.max(value, min), max);

export const mapRange = (value, inMin, inMax, outMin, outMax) => {
  const progress = (value - inMin) / (inMax - inMin);
  return outMin + progress * (outMax - outMin);
};

export const removeAfterAnimation = (node) => {
  node.addEventListener("animationend", () => node.remove(), { once: true });
};

export const heartSvg = `
  <svg viewBox="0 0 32 29.6" aria-hidden="true" focusable="false">
    <path d="M23.6 0c-2.9 0-5.5 1.7-7.6 4.3C13.9 1.7 11.3 0 8.4 0 3.8 0 0 3.8 0 8.5c0 9.4 16 21.1 16 21.1S32 17.9 32 8.5C32 3.8 28.2 0 23.6 0z"/>
  </svg>
  <span class="heart-glimmer"></span>
`;
