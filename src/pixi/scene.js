import { Application, Assets, Sprite } from "pixi.js-legacy";
import { DELTA_VALUES, pixiStore } from "../services/Store";

/**
 * Initialize the PIXI application
 * @param {Application<ICanvas>} app - The PIXI application instance.
 * @returns {Promise<Sprite>} A Promise that resolves with the background sprite.
 */
export async function initScenes(app) {
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
   * You can remove if you have already at least one Sprite in your PIXI application
   */
  const transparentTexture = await Assets.load("/transparent.png");
  const placeHolderSprite = new Sprite(transparentTexture);
  placeHolderSprite.width = app.screen.width;
  placeHolderSprite.height = app.screen.height;
  app.stage.addChild(placeHolderSprite);

  // Disable inline style for cursor
  app.renderer.plugins.interaction.cursorStyles.default = null;
  // Disable highlight on clicking in touch devices
  app.view.classList.add("no-highlight");

  // Disable right click context menu
  app.view.addEventListener("contextmenu", (e) => {
    e.preventDefault();
  });

  return placeHolderSprite;
}

/**
 * Render the PIXI application
 *
 * @param {Application<ICanvas>} app - The PIXI application instance.
 * @param {HTMLElement} container - The HTML element containing the PIXI canvas.
 * @param {Sprite} bgSprite - The background sprite.
 * @returns {void}
 */
export function renderScenes(app, container, bgSprite) {
  const { clientWidth } = container;

  if (typeof clientWidth == "number") {
    // Setting canvas width and height with 16/9 ratio
    app.renderer.resize(clientWidth, clientWidth * 0.5625);

    // Setting background sprite width and height based on the canvas size
    bgSprite.width = app.screen.width;
    bgSprite.height = app.screen.height;
    const { width, height } = bgSprite.texture.baseTexture;

    // Calculate delta values for scaling based on the actual texture size and the current canvas size
    const deltaX = app.screen.width / width;
    const deltaY = app.screen.height / height;
    pixiStore[DELTA_VALUES] = { x: deltaX, y: deltaY };
  }
}
