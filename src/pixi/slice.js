import polybool from "polybooljs";
import { POLYGONS, pixiStore } from "../services/Store";
import { completePolygon, polygonsToExecutable } from "../utils";

/**
 * A function that slices the intersecting polygon into multiple polygons
 * @param {number[]} sliceBoundary - The slice boundary points
 * @returns {void}
 */
export function slice(sliceBoundary) {
  const polygons = pixiStore[POLYGONS];
  let targetPolygon;
  let targetIndex;
  const boundary = polygonsToExecutable(sliceBoundary);

  // Check the first intersecting polygon
  for (let i = 0; i < polygons.length; i++) {
    const polygonPoints = polygonsToExecutable(polygons[i]);
    const result = polybool.intersect(polygonPoints, boundary);
    if (result.regions?.length > 0) {
      targetIndex = i;
      targetPolygon = polygonPoints;
      break;
    }
  }

  if (targetPolygon != undefined) {
    const difference = polybool.difference(targetPolygon, boundary);

    // If the difference is more than 1, it means the polygon slicing is successful
    if (difference.regions.length > 1) {
      // Transform the difference into multiple polygons
      const newPolygons = difference.regions.map((polygon) =>
        completePolygon(polygon.flat())
      );

      // Update the store with the new polygons
      pixiStore[POLYGONS] = polygons
        .filter((_, index) => index !== targetIndex)
        .concat(newPolygons);
    }
  } else {
    // Display error on slice fails
    dispatchEvent(
      new CustomEvent("pixiError", {
        detail: {
          message:
            "There is no target polygon intersecting the slicing boundary.",
        },
      })
    );
  }
}
