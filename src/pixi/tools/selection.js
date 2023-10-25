import { Application, FederatedPointerEvent, Graphics } from "pixi.js-legacy";
import {
  generateRectPoints,
  getDrawingPoint,
  syncPointPosition,
} from "../../utils";
import { primaryColor } from "../../constants";

/**
 * Initialize the selection tool of the PIXI application
 *
 * @param {Application<ICanvas>} app - The PIXI application instance.
 * @returns {() => void} A function that cleans up the selection tool event listeners.
 */
export function initSelectTool(app) {
  let selectionBounds = [];
  let rectanglePoints = [];
  const selectionRectangle = new Graphics();

  /**
   * Draw a rectangle on the PIXI application
   */
  const drawRect = () => {
    if (rectanglePoints.length == 4) {
      selectionRectangle.clear();
      selectionRectangle.lineStyle(1, primaryColor, 1);
      selectionRectangle.beginFill(primaryColor, 0.25);

      const [x1, y1, x2, y2] = getDrawingPoint(rectanglePoints);

      const width = x2 - x1;
      const height = y2 - y1;

      // Draw a rectangle with x1 as startPoint, y1 as endPoint, width and height
      selectionRectangle.drawRect(x1, y1, width, height);
    }
  };

  /**
   * Pointerdown event for selection tool
   *
   * @param {FederatedPointerEvent} e - Pointer event
   * @returns {void}
   */
  const onPointerDown = (e) => {
    e.stopPropagation();

    // Ensure that's the left click on desktop
    if (e.button === 0) {
      const { x, y } = e.global;
      selectionBounds = syncPointPosition([x, y]);
      dispatchEvent(new Event("rubberbandSelectionStart"));
    }
  };

  /**
   * Pointermove event for selection tool
   *
   * @param {FederatedPointerEvent} e - Pointer event
   * @returns {void}
   */
  const onPointerMove = (e) => {
    e.stopPropagation();
    if (selectionBounds.length >= 2) {
      const { x, y } = e.global;
      const [endX, endY] = syncPointPosition([x, y]);
      const [startX, startY] = selectionBounds;
      selectionBounds = [startX, startY, endX, endY];

      // Generate top left and bottom right points of the rectangle
      // That ensure the functionality of the drawing of the rectangle from any direction
      rectanglePoints = generateRectPoints(selectionBounds);

      // Paint the rectangle
      drawRect();
    }
  };

  /**
   * Pointerup event for selection tool
   *
   * @param {FederatedPointerEvent} e - Pointer event
   * @returns {void}
   */
  const onPointerUp = (e) => {
    e.stopPropagation();
    selectionBounds = [];
    selectionRectangle.clear();
    dispatchEvent(new Event("rubberbandSelectionEnd"));
  };

  const events = {
    pointerdown: onPointerDown,
    pointermove: onPointerMove,
    pointerup: onPointerUp,
    pointerupoutside: onPointerUp,
  };

  Object.entries(events).map(([event, handler]) => {
    app.stage.addEventListener(event, handler);
  });

  app.stage.addChild(selectionRectangle);
  app.view.classList.add("selection");

  // Repaint the rectangle on deltaValuesChanged event
  window.addEventListener("deltaValuesChanged", drawRect);

  // Clean up function to be called on mode change
  return () => {
    // Remove the graphic from the stage and free from memory
    app.stage.removeChild(selectionRectangle);
    selectionRectangle.destroy(true);
    app.view.classList.remove("selection");

    // Remove event listeners
    Object.entries(events).map(([event, handler]) => {
      app.stage.removeEventListener(event, handler);
      window.removeEventListener("rerenderStage", drawRect);
    });
  };
}
