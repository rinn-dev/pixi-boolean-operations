import { Application } from "pixi.js-legacy";
import { MODE, POLYGONS, SELECTED_POLYGON, pixiStore } from "../services/Store";
import { initPenTool } from "./tools/pen";
import { initSelectTool } from "./tools/selection";
import { merge } from "./merge";

/**
 * Bind mode change events to the buttons
 * @param {Application} app - The PIXI application
 */
export function bindModeEvents(app) {
  document
    .querySelectorAll(".tool")
    .forEach((tool) =>
      tool.addEventListener("click", (e) => changeMode(e, tool.id))
    );

  window.addEventListener("modeChanged", getModeHandler(app));
}

/**
 * Change the mode of the PIXI application
 *
 * @param {Event} e - The event object.
 * @param {string} mode - The mode to be set.
 */
export function changeMode(e, mode) {
  pixiStore[MODE] = mode;
  if (mode != "merge") {
    document.querySelectorAll(".tool").forEach((tool) => {
      tool.classList.remove("active");
    });
    e.target.classList.add("active");
  }
}

/**
 * A closure function that returns mode handler function
 * @param {Application} app - The PIXI application
 * @param {() => void} cleanupFunction - The cleanup function for the previous mode
 * @returns {() => void} Mode handler function
 */
export function getModeHandler(app, cleanupFunction = () => void 0) {
  return () => {
    const selectedMode = pixiStore[MODE];
    if (selectedMode !== "merge") {
      // Clean up events and memory of the previous mode
      cleanupFunction && cleanupFunction();

      // Reassign the clean up function for current mode to be used in the next mode change
      switch (selectedMode) {
        case "pen":
          cleanupFunction = initPenTool(app, (newPolygon) => {
            pixiStore[POLYGONS] = [...pixiStore[POLYGONS], newPolygon];
          });
          break;
        default:
          cleanupFunction = initSelectTool(app);
          break;
      }
    } else {
      // Merge is just a function rather than a mode
      merge();
      pixiStore[MODE] = "select";
    }
    // To trigger adding selection handlers on polygons
    pixiStore[SELECTED_POLYGON] = [];
  };
}
