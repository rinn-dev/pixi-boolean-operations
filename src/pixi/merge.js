import { SELECTED_POLYGON, pixiStore } from "../services/Store";

export function merge() {
  const selectedPolygons = pixiStore[SELECTED_POLYGON];
  console.log(selectedPolygons);
}
