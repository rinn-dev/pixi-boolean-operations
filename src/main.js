import "../styles/global.css";
import { initApplication } from "./pixi";

window.addEventListener("DOMContentLoaded", async () => {
  const container = document.querySelector(".canvas-container");
  await initApplication(container);
});
