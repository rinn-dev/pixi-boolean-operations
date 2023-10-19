export const MODE = "mode";

/**
 * The Store object represents a store that holds application data and dispatch related events on mutation.
 * @namespace
 * @property {("select" | "pen")} MODE - The current mode of the Pixi application.
 */
const Store = {
  [MODE]: "select",
};

export const pixiStore = new Proxy(Store, {
  set(target, key, value) {
    target[key] = value;

    window.dispatchEvent(new Event("rerenderStage"));
    return true;
  },
});
