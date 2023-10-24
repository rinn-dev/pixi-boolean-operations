import { MODE, pixiStore } from "../services/Store";

/**
 * Bind mode change events to the buttons
 */
export function bindModeEvents() {
  document
    .querySelectorAll(".tool")
    .forEach((tool) =>
      tool.addEventListener("click", (e) => changeMode(e, tool.id))
    );

  window.addEventListener("modeChanged", modeHandler);
}

/**
 * Change the mode of the PIXI application
 *
 * @param {Event} e - The event object.
 * @param {string} mode - The mode to be set.
 */
export function changeMode(e, mode) {
  pixiStore[MODE] = mode;
  document.querySelectorAll(".tool").forEach((tool) => {
    tool.classList.remove("active");
  });
  e.target.classList.add("active");
}

/**
 * Handle mode changes
 */
export function modeHandler() {
  const selectedMode = pixiStore[MODE];
  console.log(selectedMode);
}
