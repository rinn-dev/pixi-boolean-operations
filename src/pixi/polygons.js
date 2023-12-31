import { MODE, POLYGONS, SELECTED_POLYGON, pixiStore } from "../services/Store";
import { Container, Application, Graphics } from "pixi.js-legacy";
import { drawPolygon } from "../utils";

/**
 * Polygon renderer
 *
 * @param {Application<ICanvas>} app - The PIXI application instance.
 * @return {void}
 */
export function renderPolygons(app) {
  const graphics = [];

  // Add polygons container to the stage
  const container = new Container();
  app.stage.addChild(container);

  /**
   * Get the handler event for selection mode based on index
   * @param {number} index - Index of the selected polygon
   * @returns {() => void} handler function for single selection of polygon
   */
  function handleSelection(index) {
    return (e) => {
      e.stopPropagation();
      const selectedPolygons = pixiStore[SELECTED_POLYGON];
      if (selectedPolygons.includes(index)) {
        pixiStore[SELECTED_POLYGON] = selectedPolygons.filter(
          (polygonIndex) => polygonIndex !== index
        );
      } else {
        pixiStore[SELECTED_POLYGON] = [index];
      }
    };
  }

  /**
   * Draw the stored polygons and reset drawing one on deltaValues changed (i.e. on resizing)
   * @returns {void}
   */
  const drawPolygons = () => {
    const polygons = pixiStore[POLYGONS];
    const selectedPolygons = pixiStore[SELECTED_POLYGON];

    // To make sure the merged graphics always clean its drawings
    graphics.slice(polygons.length).forEach((graphic) => graphic.clear());

    polygons.forEach((polygon, index) => {
      let graphic = graphics[index];
      if (!graphic) {
        graphic = new Graphics();
        graphics[index] = graphic;
        container.addChild(graphic);
      }

      drawPolygon({
        points: polygon,
        graphic,
        hasCircles: false,
        fill: selectedPolygons.includes(index),
      });

      // Remove the existing events to avoid duplication
      graphic.removeAllListeners();
      if (pixiStore[MODE] != "select") {
        graphic.eventMode = "none";
      } else {
        graphic.eventMode = "static";
        graphic.addEventListener("pointerdown", handleSelection(index));
      }
    });
  };

  /**
   * Toggle the interaction of polygons (to disable interactions on rubberband selection)
   * @param {boolean} isInteractive - Boolean flag to toggle interactions
   * @returns {void}
   */
  const toggleInteraction = (isInteractive = true) => {
    graphics.forEach((graphic, index) => {
      graphic.removeAllListeners();
      if (isInteractive) {
        graphic.eventMode = "static";
        graphic.addEventListener("pointerdown", handleSelection(index));
      } else {
        graphic.eventMode = "none";
      }
    });
  };

  // Repaint the polygons on certain events
  const windowEvents = {
    deltaValuesChanged: drawPolygons,
    polygonsChanged: drawPolygons, // After a polygon is added or removed
    polygonsSelected: drawPolygons, // To paint the highlight of the selected polygons
  };

  const windowTempEvents = {
    rubberbandSelectionStart: () => toggleInteraction(false), // To remove the interactive events on polygons while on rubberband selection
    rubberbandSelectionEnd: () => toggleInteraction(true), // To add the interactive events on polygons while the rubberband selection ends
  };

  // Repaint the polygons on state changes
  Object.entries({ ...windowEvents, ...windowTempEvents }).map(
    ([event, handler]) => {
      window.addEventListener(event, handler);
    }
  );
}
