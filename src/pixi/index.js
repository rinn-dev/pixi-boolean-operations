import { Application } from "pixi.js-legacy";
import { renderScenes } from "./scene";
// import { initSelectTool } from "./tools/selection";
import { initPenTool } from "./tools/pen";

/**
 * Initializes the PIXI application and appends it to the specified container element.
 * @async
 * @param {HTMLElement} container - The HTML element to which the PIXI application will be appended.
 * @returns {Promise<PIXI.Application>} A Promise that resolves with the PIXI application instance.
 * @throws {Error} If an error occurs during initialization, it is logged to the console for debugging.
 */
export async function initApplication(container) {
  if (container?.append === undefined) return;

  try {
    const { clientWidth } = container;
    const dpr = window.devicePixelRatio;

    const app = new Application({
      width: clientWidth, // Canvas width
      backgroundAlpha: 0.001, // Background opacity of the canvas,
      resolution: dpr > 2 ? dpr : 2, // Resolution for PIXI application
      autoDensity: true, // Sync canvas style (width and height) on calling app.renderer.resize() method
    });

    // Setting PIXI application as global variable (Easy to debug)
    window.app = app;

    // Appending canvas into the container
    container.appendChild(app.view);

    await renderScenes(app, container);

    // Rerender PIXI application on window resizing
    window.addEventListener("resize", () => renderScenes(app, container));

    // initSelectTool(app);
    initPenTool(app);

    return app;
  } catch (e) {
    console.log(e);
  }
}
