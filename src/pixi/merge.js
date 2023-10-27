import { POLYGONS, SELECTED_POLYGON, pixiStore } from "../services/Store";
import { completePolygon, polygonsToExecutable } from "../utils";
import polybool from "polybooljs";

export function merge() {
  const selectedIndex = pixiStore[SELECTED_POLYGON];
  const polygons = pixiStore[POLYGONS];
  const selectedPolygons = selectedIndex.map((index) => {
    return polygonsToExecutable(polygons[index]);
  });
  var segments = polybool.segments(selectedPolygons[1]);

  for (var i = selectedPolygons.length - 1; i >= 0; i--) {
    const currentSegment = polybool.segments(selectedPolygons[i]);
    const mergedPolygon = polybool.combine(segments, currentSegment);
    segments = polybool.selectUnion(mergedPolygon);
  }
  
  const mergedPolygon = polybool
    .polygon(segments)
    .regions.map((region) => completePolygon(region.flat()));

  pixiStore[POLYGONS] = polygons
    .filter((_, index) => !selectedIndex.includes(index))
    .concat(mergedPolygon);
}
