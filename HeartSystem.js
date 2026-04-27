import { heartSvg, prefersReducedMotion, random, randomInt } from "./utils.js";

const HEART_COLORS = [
  "rgba(255, 255, 255, 0.88)",
  "rgba(255, 214, 221, 0.9)",
  "rgba(255, 107, 129, 0.82)",
  "rgba(255, 215, 0, 0.5)"
];

export class HeartSystem {
  constructor(root) {
    this.root = root;
    this.backLayer = document.createElement("div");
    this.frontLayer = document.createElement("div");
    this.backLayer.className = "heart-layer heart-layer--back";
    this.frontLayer.className = "heart-layer heart-layer--front";
    this.root.append(this.backLayer, this.frontLayer);

    this.hearts = [];
    this.active = false;
    this.frame = null;
    this.lastTime = performance.now();
    this.spawnAccumulator = 0;
    this.maxHearts = window.innerWidth < 720 ? 76 : 112;
    this.reducedMotion = prefersReducedMotion();
  }

  activate() {
    if (this.active || this.reducedMotion) {
      return;
    }

    this.active = true;
    const initialCount = window.innerWidth < 720 ? 32 : 46;
    for (let index = 0; index < initialCount; index += 1) {
      this.createFloatingHeart({
        x: random(-window.innerWidth * 0.04, window.innerWidth * 1.04),
        y: random(window.innerHeight * 0.08, window.innerHeight * 0.96),
        stagger: index * 18
      });
    }
    this.lastTime = performance.now();
    this.frame = requestAnimationFrame((time) => this.update(time));
  }

  createFloatingHeart({ stagger = 0, x = null, y = null } = {}) {
    if (this.hearts.length >= this.maxHearts) {
      this.removeHeart(this.hearts[0]);
    }

    const depth = Math.random() > 0.42 ? "front" : "back";
    const size = depth === "front" ? random(16, 38) : random(10, 24);
    const startX = x ?? random(-window.innerWidth * 0.05, window.innerWidth * 1.05);
    const startY = y ?? window.innerHeight + random(20, 140) + stagger;
    const node = this.createHeartNode(size, depth);
    const heart = {
      node,
      depth,
      mode: "float",
      x: startX,
      y: startY,
      originX: startX,
      opacity: depth === "front" ? random(0.45, 0.82) : random(0.24, 0.5),
      drift: random(-28, 28),
      wave: random(0.5, 1.4),
      speed: depth === "front" ? random(18, 38) : random(10, 22),
      rotation: random(-25, 25),
      rotationSpeed: random(-16, 16),
      born: performance.now() + stagger,
      delay: stagger
    };

    (depth === "front" ? this.frontLayer : this.backLayer).append(node);
    this.hearts.push(heart);
  }

  createBurst(x, y, count = 10, strong = false) {
    if (this.reducedMotion) {
      return;
    }

    for (let index = 0; index < count; index += 1) {
      if (this.hearts.length >= this.maxHearts) {
        this.removeHeart(this.hearts[0]);
      }

      const angle = random(0, Math.PI * 2);
      const force = random(strong ? 110 : 70, strong ? 230 : 145);
      const size = random(strong ? 13 : 9, strong ? 32 : 22);
      const depth = Math.random() > 0.25 ? "front" : "back";
      const node = this.createHeartNode(size, depth);
      const heart = {
        node,
        depth,
        mode: "burst",
        x,
        y,
        vx: Math.cos(angle) * force,
        vy: Math.sin(angle) * force - random(25, 120),
        opacity: random(0.5, 0.92),
        rotation: random(-40, 40),
        rotationSpeed: random(-95, 95),
        life: 0,
        ttl: random(strong ? 1.8 : 1.15, strong ? 2.7 : 1.9)
      };

      (depth === "front" ? this.frontLayer : this.backLayer).append(node);
      this.hearts.push(heart);
    }
  }

  createHeartNode(size, depth) {
    const node = document.createElement("span");
    node.className = `floating-heart ${depth === "back" ? "is-back" : ""}`;
    node.style.setProperty("--size", `${size}px`);
    node.style.setProperty(
      "--heart-color",
      HEART_COLORS[randomInt(0, HEART_COLORS.length - 1)]
    );
    node.innerHTML = heartSvg;
    return node;
  }

  update(time) {
    const delta = Math.min((time - this.lastTime) / 1000, 0.05);
    this.lastTime = time;

    if (this.active) {
      this.spawnAccumulator += delta;
      if (this.spawnAccumulator > 0.38) {
        this.spawnAccumulator = 0;
        this.createFloatingHeart();
      }
    }

    this.hearts.forEach((heart) => this.updateHeart(heart, time, delta));
    this.hearts = this.hearts.filter((heart) => {
      const keep =
        heart.mode === "float"
          ? heart.y > -120
          : heart.life < heart.ttl;

      if (!keep) {
        heart.node.remove();
      }
      return keep;
    });

    this.frame = requestAnimationFrame((nextTime) => this.update(nextTime));
  }

  updateHeart(heart, time, delta) {
    if (time < heart.born) {
      return;
    }

    if (heart.mode === "float") {
      const age = (time - heart.born) / 1000;
      heart.y -= heart.speed * delta;
      heart.x =
        heart.originX +
        Math.sin(age * heart.wave + heart.originX * 0.01) * heart.drift;
      heart.rotation += heart.rotationSpeed * delta;
      const fadeIn = Math.min(age / 2.2, 1);
      const fadeOut = Math.min((heart.y + 120) / 260, 1);
      const opacity = heart.opacity * Math.min(fadeIn, fadeOut);
      this.paintHeart(heart, opacity);
      return;
    }

    heart.life += delta;
    heart.vy += 52 * delta;
    heart.x += heart.vx * delta;
    heart.y += heart.vy * delta;
    heart.rotation += heart.rotationSpeed * delta;
    const progress = heart.life / heart.ttl;
    const opacity = heart.opacity * Math.max(1 - progress, 0);
    this.paintHeart(heart, opacity, 1 + progress * 0.45);
  }

  paintHeart(heart, opacity, scale = 1) {
    heart.node.style.opacity = opacity.toFixed(3);
    heart.node.style.transform = `translate3d(${heart.x.toFixed(2)}px, ${heart.y.toFixed(2)}px, 0) rotate(${heart.rotation.toFixed(2)}deg) scale(${scale.toFixed(3)})`;
  }

  removeHeart(heart) {
    heart.node.remove();
    const index = this.hearts.indexOf(heart);
    if (index >= 0) {
      this.hearts.splice(index, 1);
    }
  }
}
