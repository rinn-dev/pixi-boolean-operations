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

    // Destroy accessibility plugin that might cause some issues while clicking Tab key or Return key in IOS
    // It might cover the canvas element with a div with the absolute position and blocking out all of the interactions on Sprites, Stage and Containers.
    // Source - https://github.com/pixijs/pixijs/issues/5111
    app.renderer.plugins.accessibility.destroy();
    delete app.renderer.plugins.accessibility;
  }
}
