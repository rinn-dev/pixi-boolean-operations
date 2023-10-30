import polybool from "polybooljs";

/**
 * A function that slices the intersecting polygon into multiple polygons
 * @param {number[]} sliceBoundary - The slice boundary points
 * @returns {void}
 */

import { POLYGONS, pixiStore } from "../services/Store";
import { completePolygon, polygonsToExecutable } from "../utils";

export function slice(sliceBoundary) {
  const polygons = pixiStore[POLYGONS];
  let targetPolygon;
  let targetIndex;
  const boundary = polygonsToExecutable(sliceBoundary);

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
    if (difference.regions.length === 2) {
      const newPolygons = difference.regions.map((polygon) =>
        completePolygon(polygon.flat())
      );
      pixiStore[POLYGONS] = polygons
        .filter((_, index) => index !== targetIndex)
        .concat(newPolygons);
    }
  }
}
