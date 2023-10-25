import { MODE, POLYGONS, SELECTED_POLYGON, pixiStore } from "../services/Store";
import {
  Container,
  Application,
  Graphics,
  FederatedPointerEvent,
} from "pixi.js-legacy";
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
      console.log(selectedPolygons);
      if (selectedPolygons.includes(index)) {
        pixiStore[SELECTED_POLYGON] = selectedPolygons.filter(
          (polygonIndex) => polygonIndex !== index
        );
      } else {
        pixiStore[SELECTED_POLYGON] = [...selectedPolygons, index];
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
    polygons.forEach((polygon, index) => {
      let graphic = graphics[index];
      if (!graphic) {
        graphic = new Graphics();
        graphics[index] = graphic;
        container.addChild(graphic);
      }

      drawPolygon(polygon, graphic, false, selectedPolygons.includes(index));

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

  const windowEvents = {
    deltaValuesChanged: drawPolygons,
    polygonsChanged: drawPolygons,
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
