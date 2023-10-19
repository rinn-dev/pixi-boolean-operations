export const MODE = "mode";
export const DELTA_VALUES = "deltaValues";

/**
 * @typedef {Object} Store - The Store object represents a store that holds application data and dispatch related events on mutation.
 * @property {("select" | "pen")} MODE - The current mode of the Pixi application.
 * @property {{x: number, y: number} | null} deltaValues - The standard scaling factor calculated based on the actual dimensions of the background texture.
 */
const Store = {
  [MODE]: "select",
  [DELTA_VALUES]: null,
};

export const pixiStore = new Proxy(Store, {
  set(target, key, value) {
    target[key] = value;
    let eventName;

    switch (key) {
      case DELTA_VALUES:
        eventName = "deltaValuesChanged";
        break;
      default:
        eventName = "rerenderStage";
        break;
    }

    window.dispatchEvent(new Event(eventName));
    return true;
  },
});
