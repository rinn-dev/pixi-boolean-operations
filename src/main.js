import "../styles/global.css";
import { initApplication } from "./pixi";
import { bindModeEvents } from "./pixi/modes";
import { MODE, pixiStore } from "./services/Store";

window.addEventListener("DOMContentLoaded", async () => {
  const container = document.querySelector(".canvas-container");
  const app = await initApplication(container);
  window.pixiStore = pixiStore;
  bindModeEvents(app);

  // Set default mode
  pixiStore[MODE] = "select";
});
