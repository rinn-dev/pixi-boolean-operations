const Store = {};

export const pixiStore = new Proxy(Store, {
  set(target, key, value) {
    target[key] = value;

    window.dispatchEvent(new Event("rerenderStage"));
    return true;
  },
});
