import { AudioEngine } from "./AudioEngine.js";
import { EffectsLayer } from "./EffectsLayer.js";
import { HeartSystem } from "./HeartSystem.js";
import { HeroSection } from "./HeroSection.js";
import { LoveMessage } from "./LoveMessage.js";

const stage = document.querySelector("#hero");
const button = document.querySelector("#surprise-button");
const effectsRoot = document.querySelector("#effects-layer");
const heartsRoot = document.querySelector("#heart-system");
const messageRoot = document.querySelector("#love-message");
const loveText = document.querySelector("#main-love-text");
const flirtyLine = document.querySelector("#flirty-line");
const secondLine = document.querySelector("#second-line");
const audioToggle = document.querySelector("#audio-toggle");

const heartSystem = new HeartSystem(heartsRoot);
const effects = new EffectsLayer(effectsRoot, stage, heartSystem);
const message = new LoveMessage(messageRoot, loveText, secondLine, flirtyLine);
const audio = new AudioEngine(audioToggle);

new HeroSection({
  stage,
  button,
  effects,
  hearts: heartSystem,
  message,
  audio
});
