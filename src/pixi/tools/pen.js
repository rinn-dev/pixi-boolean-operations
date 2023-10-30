import { Application, FederatedPointerEvent, Graphics } from "pixi.js-legacy";
import { drawPolygon, roundPos, syncPointPosition } from "../../utils";
import { secondaryColor } from "../../constants";

/**
 * Initialize the pen tool that is used to draw polygons of the PIXI application
 *
 * @param {Application<ICanvas>} app - The PIXI application instance.
 * @param {(newPolygon: number[]) => void} addPolygon - The mutation function for polygons storage.
 * @param {number} [baseColor=secondaryColor] - The color of the polygon.
 * @return {() => void} A function that cleans up the pen tool event listeners.
 */
export function initPenTool(app, addPolygon, baseColor = secondaryColor) {
  let drawingPolygonPoints = [];
  let hintingPos = [];

  // Adding drawing polygon graphic to the container
  const drawingPolygon = new Graphics();
  app.stage.addChild(drawingPolygon);

  /**
   * Reset drawing polygon points
   * @returns {void}
   */
  const resetDrawingPolygon = () => {
    drawingPolygonPoints = [];
    hintingPos = [];
    drawPolygon({
      points: drawingPolygonPoints,
      graphic: drawingPolygon,
      baseColor,
    });
  };

  /**
   * Pointerdown event for pen tool
   *
   * @param {FederatedPointerEvent} e - Pointer event
   * @returns {void}
   */
  const onPointerDown = (e) => {
    e.stopPropagation();

    // Ensure that's the left click on desktop
    if (e.button === 0) {
      const { x, y } = e.global;

      // Push points into drawing polygon array
      const [roundedPos, isNearStartPoint] = roundPos(
        drawingPolygonPoints.slice(0, 2),
        syncPointPosition([x, y])
      );
      roundedPos.forEach((value) => drawingPolygonPoints.push(value));
      if (isNearStartPoint) {
        // Notice: that must be pure mutation (don't use .push) in order to trigger the proxy traps
        addPolygon(drawingPolygonPoints);
        resetDrawingPolygon();
      } else {
        drawPolygon({
          points: drawingPolygonPoints.concat(hintingPos),
          graphic: drawingPolygon,
          baseColor,
        });
      }
    }
  };

  /**
   * Pointermove event for pen tool that calculates and rounds the hinting position
   *
   * @param {FederatedPointerEvent} e - Pointer event
   * @returns {void}
   */
  const onPointerMove = (e) => {
    e.stopPropagation();
    if (drawingPolygonPoints.length) {
      const [x1, y1] = drawingPolygonPoints;
      const { x, y } = e.global;

      // Calculate and round the hinting position based on start point and current point
      hintingPos = roundPos([x1, y1], syncPointPosition([x, y]))[0];
      drawPolygon({
        points: drawingPolygonPoints.concat(hintingPos),
        graphic: drawingPolygon,
        baseColor,
      });
    }
  };

  /**
   * Stop drawing and reset points on right click
   *
   * @param {FederatedPointerEvent} e - Pointer event
   * @returns {void}
   */
  const onRightClick = (e) => {
    e.stopPropagation();
    resetDrawingPolygon();
    drawPolygon({
      points: drawingPolygonPoints,
      graphic: drawingPolygon,
      baseColor,
    });
  };

  // Event listeners for pen tool
  const events = {
    pointerdown: onPointerDown,
    pointermove: onPointerMove,
    rightclick: onRightClick,
  };

  // Reset drawing polygon points on window resize
  const windowEvent = {
    deltaValuesChanged: resetDrawingPolygon,
  };

  // Add event listeners for pen tool
  Object.entries(events).map(([event, handler]) => {
    app.stage.addEventListener(event, handler);
  });
  Object.entries(windowEvent).map(([event, handler]) => {
    window.addEventListener(event, handler);
  });

  // app.stage.addChild(container);
  app.view.classList.add("pen");

  // Clean up function to be called on mode change
  return () => {
    app.stage.removeChild(drawingPolygon);
    drawingPolygon.destroy(true);

    // Remove event listeners
    Object.entries(events).map(([event, handler]) => {
      app.stage.removeEventListener(event, handler);
    });
    Object.entries(windowEvent).map(([event, handler]) => {
      window.removeEventListener(event, handler);
    });

    // Remove cursor
    app.view.classList.remove("pen");
  };
}
