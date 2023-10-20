import {
  Application,
  FederatedPointerEvent,
  Graphics,
  Container,
} from "pixi.js-legacy";
import { syncPointPosition } from "../../utils";

/**
 * Initialize the pen tool that is used to draw polygons of the Pixi application
 *
 * @param {Application<ICanvas>} app - The Pixi application instance.
 * @return {() => void} A function that cleans up the pen tool event listeners.
 */
export async function initPenTool(app) {
  let polygons = [];
  let polygonPoints = [];
  let hintingPos = [];
  const container = new Container();

  /**
   * Draw a polygon on the PIXI application
   */
  const drawPolygon = () => {};

  /**
   * Pointerdown event for pen tool
   *
   * @param {FederatedPointerEvent} e - Pointer event
   * @return {void}
   */
  const onPointerDown = (e) => {
    e.stopPropagation();

    // Ensure that's the left click on desktop
    if (e.button === 0) {
      const { x, y } = e.global;
      polygonPoints = syncPointPosition([x, y]);
    }
  };

  /**
   * Pointermove event for pen tool that calculates and rounds the hinting position
   *
   * @param {FederatedPointerEvent} e - Pointer event
   * @return {void}
   */
  const onPointerMove = (e) => {
    e.stopPropagation();
    const { x, y } = e.global;
    const [xPos, yPos] = syncPointPosition([x, y]);
    hintingPos = [xPos, yPos];
  };

  /**
   * Pointerup event for selection tool
   *
   * @param {FederatedPointerEvent} e - Pointer event
   * @return {void}
   */
  const onPointerUp = (e) => {
    e.stopPropagation();
  };

  const events = {
    pointerdown: onPointerDown,
    pointermove: onPointerMove,
    pointerup: onPointerUp,
    pointerupoutside: onPointerUp,
    pointerout: onPointerUp,
  };

  Object.entries(events).map(([event, handler]) => {
    app.stage.addEventListener(event, handler);
  });

  app.stage.addChild(container);
  app.view.classList.add("pen");

  // Repaint the rectangle on deltaValuesChanged event
  window.addEventListener("deltaValuesChanged", drawPolygon);

  // Clean up function to be called on mode change
  return () => {
    // Remove the graphic from the stage and free from memory
    app.stage.removeChild(container);
    container.destroy(true);

    // Remove event listeners
    Object.entries(events).map(([event, handler]) => {
      app.stage.removeEventListener(event, handler);
      window.removeEventListener("rerenderStage", drawRect);
    });
  };
}
