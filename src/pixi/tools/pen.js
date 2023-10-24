import {
  Application,
  FederatedPointerEvent,
  Graphics,
  Container,
} from "pixi.js-legacy";
import { getDrawingPoint, roundPos, syncPointPosition } from "../../utils";
import { secondaryColor, whiteColor } from "../../constants";
import { POLYGONS, pixiStore } from "../../services/Store";

/**
 * Initialize the pen tool that is used to draw polygons of the PIXI application
 *
 * @param {Application<ICanvas>} app - The PIXI application instance.
 * @return {() => void} A function that cleans up the pen tool event listeners.
 */
export function initPenTool(app) {
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
   * @param {boolean} hasCircles - Precence of circles on each polygon node
   * @returns {void}
   */
  const drawPolygon = (points, graphic, hasCircles = true) => {
    graphic.clear();

    if (graphic != null && points.length > 0) {
      graphic.lineStyle(2, secondaryColor);
      graphic.beginFill(secondaryColor, 0.25);

      // Get the drawing points based on current screen size
      const nodes = getDrawingPoint(points.concat(hintingPos));
      const [startX, startY, ...restPoints] = nodes;

      // Move to the first polygon node
      graphic.moveTo(startX, startY);

      // Draw lines between each polygon node
      while (restPoints.length) {
        const x = restPoints.shift();
        const y = restPoints.shift();
        graphic.lineTo(x, y);
      }

      // Draw circles on each polygon node
      if (hasCircles) {
        graphic.lineStyle(2, secondaryColor);
        graphic.beginFill(secondaryColor);
        while (nodes.length) {
          const x = nodes.shift();
          const y = nodes.shift();
          graphic.drawCircle(x, y, 3.5);

          graphic.lineStyle(2, secondaryColor);
          graphic.beginFill(whiteColor);
        }
        graphic.endFill();
      }
    }
  };

  /**
   * Reset drawing polygon points
   * @returns {void}
   */
  const resetDrawingPolygon = () => {
    drawingPolygonPoints = [];
    hintingPos = [];
    drawPolygon(drawingPolygonPoints, drawingPolygon);
  };

  /**
   * Draw the stored polygons and reset drawing one on deltaValues changed (i.e. on resizing)
   * @returns {void}
   */
  const drawPolygons = () => {
    const polygons = pixiStore[POLYGONS];
    resetDrawingPolygon();
    polygons.forEach((polygon, index) => {
      let graphic = graphics[index];
      if (!graphic) {
        graphic = new Graphics();
        graphics[index] = graphic;
        container.addChild(graphic);
      }
      drawPolygon(polygon, graphic, false);
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
        pixiStore[POLYGONS] = [...pixiStore[POLYGONS], drawingPolygonPoints];
      } else {
        drawPolygon(drawingPolygonPoints, drawingPolygon);
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
      drawPolygon(drawingPolygonPoints, drawingPolygon);
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
    drawPolygon(drawingPolygonPoints, drawingPolygon);
  };

  const events = {
    pointerdown: onPointerDown,
    pointermove: onPointerMove,
    rightclick: onRightClick,
  };

  const windowEvents = {
    deltaValuesChanged: drawPolygons,
    polygonsChanged: drawPolygons,
  };

  // Add event listeners for pen tool
  Object.entries(events).map(([event, handler]) => {
    app.stage.addEventListener(event, handler);
  });

  // Repaint the polygons on state changes
  Object.entries(windowEvents).map(([event, handler]) => {
    window.addEventListener(event, handler);
  });

  app.stage.addChild(container);
  app.view.classList.add("pen");

  // Clean up function to be called on mode change
  return () => {
    // Remove the graphic from the stage and free from memory
    app.stage.removeChild(container);
    container.destroy(true);

    // Remove event listeners
    Object.entries(events).map(([event, handler]) => {
      app.stage.removeEventListener(event, handler);
    });

    Object.entries(windowEvents).map(([event, handler]) => {
      window.removeEventListener(event, handler);
    });
    console.log("Cleaned up selection tool");
  };
}
