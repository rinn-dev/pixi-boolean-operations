import { POLYGONS, SELECTED_POLYGON, pixiStore } from "../services/Store";
import { completePolygon, polygonsToExecutable } from "../utils";
import polybool from "polybooljs";

/**
 * A function that merge the polygons only when the polygons are intersecting each other
 * @returns {void}
 */
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
    const combineSegment = polybool.combine(segments, currentSegment);

    // Perform union operation on combined segments to merge the polygons
    segments = polybool.selectUnion(combineSegment);
  }

  const mergedPolygons = polybool.polygon(segments).regions;

  if (mergedPolygons.length > 1) {
    // Display Error as the merge process fails, selected polygons are not intersecting
    dispatchEvent(
      new CustomEvent("pixiError", {
        detail: {
          message: "The selected polygons must be touching to perform merging",
        },
      })
    );
  } else {
    // Flat the array and complete the polygon points
    const mergedPolygon = completePolygon(mergedPolygons.pop().flat());

    // Update the store with the merged polygons
    pixiStore[POLYGONS] = polygons
      .filter((_, index) => !selectedIndex.includes(index))
      .concat([mergedPolygon]);
  }
}
