export const MODE = "mode";
export const DELTA_VALUES = "deltaValues";
export const POLYGONS = "polygons";
export const SELECTED_POLYGON = "selectedPolygons";

/**
 * @typedef {Object} Store - The Store object represents a store that holds application data and dispatch related events on mutation.
 * @property {("select" | "pen" | "merge" | "split")} MODE - The current mode of the PIXI application.
 * @property {{x: number, y: number} | null} deltaValues - The standard scaling factor calculated based on the actual dimensions of the background texture.
 * @property {number[][]} polygons - The array of polygons drawn on the PIXI application.
 * @property {number[]} selectedPolygons - The array of indexes of the selected polygons.
 */
const Store = {
  [MODE]: "select",
  [DELTA_VALUES]: null,
  [POLYGONS]: [],
  [SELECTED_POLYGON]: [],
};

const events = {
  [MODE]: "modeChanged",
  [DELTA_VALUES]: "deltaValuesChanged",
  [POLYGONS]: "polygonsChanged",
  [SELECTED_POLYGON]: "polygonsSelected",
};

export const pixiStore = new Proxy(Store, {
  set(target, key, value) {
    target[key] = value;

    window.dispatchEvent(new Event(events[key] ?? "rerenderStage"));
    return true;
  },
});
