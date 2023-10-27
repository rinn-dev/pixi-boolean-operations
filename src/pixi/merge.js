import { POLYGONS, SELECTED_POLYGON, pixiStore } from "../services/Store";
import { completePolygon, polygonsToExecutable } from "../utils";
import polybool from "polybooljs";

export function merge() {
  const selectedIndex = pixiStore[SELECTED_POLYGON];
  const polygons = pixiStore[POLYGONS];

  // Transform slected polygons to executable format
  const selectedPolygons = selectedIndex.map((index) => {
    return polygonsToExecutable(polygons[index]);
  });

  // The first polygon as the base segment
  var segments = polybool.segments(selectedPolygons[0]);
  for (var i = 1; i < selectedPolygons.length; i++) {
    // Combine the base segment with the current segment
    const currentSegment = polybool.segments(selectedPolygons[i]);
    const mergedPolygon = polybool.combine(segments, currentSegment);
    segments = polybool.selectUnion(mergedPolygon);
  }

  // Flat the array and complete the polygon points
  const mergedPolygon = polybool
    .polygon(segments)
    .regions.map((region) => completePolygon(region.flat()));

  // Update the store with the merged polygon
  pixiStore[POLYGONS] = polygons
    .filter((_, index) => !selectedIndex.includes(index))
    .concat(mergedPolygon);
}
