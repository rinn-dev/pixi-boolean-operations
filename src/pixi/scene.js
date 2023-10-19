import { Application, Assets, Sprite } from "pixi.js-legacy";
import { DELTA_VALUES, pixiStore } from "../services/Store";

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
    const accessibilityPlugin = app.renderer.plugins.accessibility;
    if (accessibilityPlugin) {
      app.renderer.plugins.accessibility.destroy();
      delete app.renderer.plugins.accessibility;
    }

    // Set initial event mode for stage
    app.stage.eventMode = "static";

    /**
     * Registering interaction events on Stage or Container won't be working without a Sprite
     * You can remove if you have already at least one Sprite in your Pixi application
     */
    const transparentTexture = await Assets.load("/transparent.png");

    const { width, height } = transparentTexture;
    const deltaX = app.screen.width / width;
    const deltaY = app.screen.height / height;
    pixiStore[DELTA_VALUES] = { x: deltaX, y: deltaY };

    const placeHolderSprite = new Sprite(transparentTexture);
    placeHolderSprite.width = app.screen.width;
    placeHolderSprite.height = app.screen.height;
    app.stage.addChild(placeHolderSprite);

    // Disable right click context menu
    app.view.addEventListener("contextmenu", (e) => {
      e.preventDefault();
    });
  }
}
