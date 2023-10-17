import { Application } from "pixi.js-legacy";

/**
 * Render the pixi application
 *
 * @param {Application<ICanvas>} app - The Pixi application instance.
 * @param {HTMLElement} container - The HTML element containing the Pixi canvas.
 */
export async function renderScenes(app, container) {
  const { clientWidth } = container;

  if (typeof clientWidth == "number") {
    // Setting canvas width and height with 16/9 ratio
    app.renderer.resize(clientWidth, clientWidth * 0.5625);
  }
}
