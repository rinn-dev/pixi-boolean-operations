import "../styles/global.css";
import { initApplication } from "./pixi";
import { bindModeEvents } from "./pixi/modes";
import { pixiStore } from "./services/Store";

window.addEventListener("DOMContentLoaded", async () => {
  const container = document.querySelector(".canvas-container");
  await initApplication(container);
  window.pixiStore = pixiStore;
  bindModeEvents();
});
