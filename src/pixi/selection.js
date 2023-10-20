import { Application, FederatedPointerEvent, Graphics } from "pixi.js-legacy";
import {
  generateRectPoints,
  getRectangleDrawingPoint,
  syncPointPosition,
} from "../utils";
import { selectionColor } from "../constants";

/**
 * Render the pixi application
 *
 * @param {Application<ICanvas>} app - The Pixi application instance.
 * @return {() => void} A function that cleanup the selection tool event listeners.
 */
export async function initSelectTool(app) {
  let selectionBounds = [];
  let rectanglePoints = [];
  const selectionRectangle = new Graphics();

  /**
   * Draw a rectangle on the PIXI application
   */
  const drawRect = () => {
    if (rectanglePoints.length == 4) {
      selectionRectangle.clear();
      selectionRectangle.lineStyle(1, selectionColor, 1);
      selectionRectangle.beginFill(selectionColor, 0.25);

      const [x1, y1, x2, y2] = getRectangleDrawingPoint(rectanglePoints);

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
   * @return {void}
   */
  const onPointerDown = (e) => {
    e.stopPropagation();

    // Ensure that's the left click on desktop
    if (e.button === 0) {
      const { x, y } = e.global;
      selectionBounds = Object.values(syncPointPosition({ x, y }));
    }
  };

  /**
   * Pointermove event for selection tool
   *
   * @param {FederatedPointerEvent} e - Pointer event
   * @return {void}
   */
  const onPointerMove = (e) => {
    e.stopPropagation();
    if (selectionBounds.length >= 2) {
      const { x, y } = e.global;
      const { x: endX, y: endY } = syncPointPosition({ x, y });
      const [startX, startY] = selectionBounds;
      selectionBounds = [startX, startY, endX, endY];

      // Generate top left and bottom right points of the rectangle
      // That ensure the drawing of the rectangle from any direction
      rectanglePoints = generateRectPoints(selectionBounds);

      // Paint the rectangle
      drawRect();
    }
  };

  /**
   * Pointerup event for selection tool
   *
   * @param {FederatedPointerEvent} e - Pointer event
   * @return {void}
   */
  const onPointerUp = (e) => {
    e.stopPropagation();
    selectionBounds = [];
    selectionRectangle.clear();
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

  app.stage.addChild(selectionRectangle);
  app.view.style.cursor = "crosshair";

  // Repaint the rectangle on deltaValuesChanged event
  window.addEventListener("deltaValuesChanged", drawRect);

  return () => {
    app.stage.removeChild(selectionRectangle);
    Object.entries(events).map(([event, handler]) => {
      app.stage.removeEventListener(event, handler);
      window.removeEventListener("rerenderStage", drawRect);
    });
  };
}
