import { Application } from "pixi.js-legacy";
import { renderScenes } from "./scene";

export async function initApplication(container) {
  if (container?.append === undefined) return;

  try {
    const { clientWidth } = container;

    // setting pixi resolution with device pixel ratio
    const dpr = window.devicePixelRatio;

    const app = new Application({
      width: clientWidth, // Canvas width
      backgroundAlpha: 0.001, // Background opacity of the canvas,
      resolution: dpr > 2 ? dpr : 2,
      autoDensity: true, //
    });

    // Setting PIXI application as global variable
    window.app = app;

    // Appending canvas into the container
    container.appendChild(app.view);
    const canvas = container.querySelector("canvas");
    canvas.style.touchAction = "auto";

    await renderScenes(app, container);

    window.addEventListener("resize", () => renderScenes(app, container));

    return app;
  } catch (e) {
    console.log(e);
  }
}
