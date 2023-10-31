import { Application } from "pixi.js-legacy";
import { initScenes, renderScenes } from "./scene";
import { renderPolygons } from "./polygons";

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

    const bgSprite = await initScenes(app);
    renderScenes(app, container, bgSprite);

    // Rerender PIXI application on window resizing
    window.addEventListener("resize", () =>
      renderScenes(app, container, bgSprite)
    );

    renderPolygons(app);
    return app;
  } catch (e) {
    console.log(e);
  }
}
