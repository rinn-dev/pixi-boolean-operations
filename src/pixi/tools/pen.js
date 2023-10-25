import { Application, FederatedPointerEvent, Graphics } from "pixi.js-legacy";
import { drawPolygon, roundPos, syncPointPosition } from "../../utils";
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

  // Adding drawing polygon graphic to the container
  const drawingPolygon = new Graphics();
  app.stage.addChild(drawingPolygon);

  /**
   * Get the handler event for selection mode based on index
   * @param {number} index - Index of the selected polygon
   * @returns {() => void} handler function for single selection of polygon
   */
  // function handleSelection(index) {
  //   return (e) => {
  //     e.stopPropagation();
  //     const selectedPolygons = pixiStore[SELECTED_POLYGON];
  //     if (selectedPolygons.includes(index)) {
  //       pixiStore[SELECTED_POLYGON] = selectedPolygons.filter(
  //         (polygonIndex) => polygonIndex !== index
  //       );
  //     } else {
  //       pixiStore[SELECTED_POLYGON] = [...selectedPolygons, index];
  //     }
  //   };
  // }

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
  // const drawPolygons = () => {
  //   const polygons = pixiStore[POLYGONS];
  //   const selectedPolygons = pixiStore[SELECTED_POLYGON];
  //   resetDrawingPolygon();
  //   polygons.forEach((polygon, index) => {
  //     let graphic = graphics[index];
  //     if (!graphic) {
  //       graphic = new Graphics();
  //       graphics[index] = graphic;
  //       container.addChild(graphic);
  //     }

  //     drawPolygon(polygon, graphic, false, selectedPolygons.includes(index));

  //     if (pixiStore[MODE] != "select") {
  //       graphic.removeAllListeners();
  //       graphic.eventMode = "none";
  //     } else {
  //       graphic.eventMode = "static";
  //       graphic.addEventListener("pointerdown", handleSelection(index));
  //     }
  //   });
  // };

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
        drawPolygon(drawingPolygonPoints.concat(hintingPos), drawingPolygon);
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
      drawPolygon(drawingPolygonPoints.concat(hintingPos), drawingPolygon);
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

  /**
   * Toggle the interaction of polygons (to disable interactions on rubberband selection)
   * @param {boolean} isInteractive - Boolean flag to toggle interactions
   * @returns {void}
   */
  // const toggleInteraction = (isInteractive = true) => {
  //   graphics.forEach((graphic, index) => {
  //     graphic.removeAllListeners();
  //     if (isInteractive) {
  //       graphic.eventMode = "static";
  //       graphic.addEventListener("pointerdown", handleSelection(index));
  //       console.log("Add");
  //     } else {
  //       graphic.eventMode = "none";
  //       console.log("Remove");
  //     }
  //   });
  // };

  const events = {
    pointerdown: onPointerDown,
    pointermove: onPointerMove,
    rightclick: onRightClick,
  };

  // const windowEvents = {
  //   deltaValuesChanged: drawPolygons,
  //   polygonsChanged: drawPolygons,
  //   polygonsSelected: drawPolygons, // To paint the highlight of the selected polygons
  // };

  // const windowTempEvents = {
  //   rubberbandSelectionStart: () => toggleInteraction(false), // To remove the interactive events on polygons while on rubberband selection
  //   rubberbandSelectionEnd: () => toggleInteraction(true), // To add the interactive events on polygons while the rubberband selection ends
  // };

  // Add event listeners for pen tool
  Object.entries(events).map(([event, handler]) => {
    app.stage.addEventListener(event, handler);
  });

  // Repaint the polygons on state changes
  // Object.entries({ ...windowEvents, ...windowTempEvents }).map(
  //   ([event, handler]) => {
  //     window.addEventListener(event, handler);
  //   }
  // );

  // app.stage.addChild(container);
  // app.view.classList.add("pen");

  // Clean up function to be called on mode change
  return () => {
    app.stage.removeChild(drawingPolygon);
    drawingPolygon.destroy(true);

    // Remove event listeners
    Object.entries(events).map(([event, handler]) => {
      app.stage.removeEventListener(event, handler);
    });

    // Remove cursor
    app.view.classList.remove("pen");
  };
}
