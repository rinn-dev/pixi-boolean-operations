import {
  Application,
  FederatedPointerEvent,
  Graphics,
  Container,
} from "pixi.js-legacy";
import { getDrawingPoint, syncPointPosition } from "../../utils";
import { secondaryColor } from "../../constants";

/**
 * Initialize the pen tool that is used to draw polygons of the Pixi application
 *
 * @param {Application<ICanvas>} app - The Pixi application instance.
 * @return {() => void} A function that cleans up the pen tool event listeners.
 */
export async function initPenTool(app) {
  let drawingPolygonPoints = [];
  let hintingPos = [];
  const container = new Container();
  const graphics = [];

  // Adding drawing polygon graphic to the container
  const drawingPolygon = new Graphics();
  container.addChild(drawingPolygon);

  /**
   * Draw a polygon on the PIXI application
   * @param {number[]} points - Node points of the polygon
   * @param {Graphics} graphic - PIXI graphic instance
   * @param {boolean} hasCircles - Precense of circles on each polygon node
   * @return {void}
   */
  const drawPolygon = (points, graphic, hasCircles = true) => {
    if (graphic != null && points.length > 0) {
      console.log(points);
      graphic.clear();
      graphic.lineStyle(2, secondaryColor);
      graphic.beginFill(secondaryColor, 0.25);

      const [startX, startY, ...restPoints] = getDrawingPoint(
        points.concat(hintingPos)
      );
      graphic.moveTo(startX, startY);

      while (restPoints.length) {
        const x = restPoints.shift();
        const y = restPoints.shift();

        graphic.lineTo(x, y);
      }

      graphic.endFill();
    }
  };

  const drawPolygons = () => {
    drawPolygon(drawingPolygonPoints, drawingPolygon);
  };

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

      // Push points into drawing polygon array
      syncPointPosition([x, y]).forEach((value) =>
        drawingPolygonPoints.push(value)
      );
      drawPolygon(drawingPolygonPoints, drawingPolygon);
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
    if (drawingPolygonPoints.length) {
      const { x, y } = e.global;
      hintingPos = syncPointPosition([x, y]);
      drawPolygon(drawingPolygonPoints, drawingPolygon);
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
  window.addEventListener("deltaValuesChanged", drawPolygons);

  // Clean up function to be called on mode change
  return () => {
    // Remove the graphic from the stage and free from memory
    app.stage.removeChild(container);
    container.destroy(true);

    // Remove event listeners
    Object.entries(events).map(([event, handler]) => {
      app.stage.removeEventListener(event, handler);
      window.removeEventListener("rerenderStage", drawPolygons);
    });
  };
}
