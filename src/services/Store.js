export const MODE = "mode";
export const DELTA_VALUES = "deltaValues";
export const POLYGONS = "polygons";

/**
 * @typedef {Object} Store - The Store object represents a store that holds application data and dispatch related events on mutation.
 * @property {("select" | "pen")} MODE - The current mode of the PIXI application.
 * @property {{x: number, y: number} | null} deltaValues - The standard scaling factor calculated based on the actual dimensions of the background texture.
 * @property {number[][]} polygons - The array of polygons drawn on the PIXI application.
 */
const Store = {
  [MODE]: "select",
  [DELTA_VALUES]: null,
  [POLYGONS]: [],
};

const events = {
  [MODE]: "modeChanged",
  [DELTA_VALUES]: "deltaValuesChanged",
  [POLYGONS]: "polygonsChanged",
};

export const pixiStore = new Proxy(Store, {
  set(target, key, value) {
    target[key] = value;
    console.log(events[key] ?? "rerenderStage");
    window.dispatchEvent(new Event(events[key] ?? "rerenderStage"));
    return true;
  },
});
