/**
 * Sort and generate rectangle points
 * @param {number[]} points - The points of the rectangle
 * @returns {number[]} An array of 4 numbers representing the coordinates of the top-left and bottom-right points of a rectangle
 */

import { DELTA_VALUES, pixiStore } from "../services/Store";

export function generateRectPoints(points) {
  const [startX, startY, endX, endY] = points;

  const sortFunction = (a, b) => a - b;
  const [x1, x2] = [startX, endX].sort(sortFunction);
  const [y1, y2] = [startY, endY].sort(sortFunction);

  let rectPoints = [x1, y1, x2, y2];

  return rectPoints;
}

/**
 * Sync current cursor position based on delta values calculated on canvas size and texture size to maintain standard values
 * @param {number[]} point- The points of the cursor
 * @returns {number[]} Synced cursor position
 */

export function syncPointPosition(point) {
  const deltaValue = pixiStore[DELTA_VALUES];

  if (deltaValue != null) {
    const { x: deltaX, y: deltaY } = deltaValue;
    const [x, y] = point;
    return [+(x / deltaX).toFixed(4), +(y / deltaY).toFixed(4)];
  } else {
    return point;
  }
}

/**
 * Get rectangle data based on current screen size
 * @param {number[]} point - The start point and end point of the rectangle
 * @returns {number[]} - The rectangle data based on current screen size
 */
export function getRectangleDrawingPoint(points) {
  const deltaValue = pixiStore[DELTA_VALUES];

  if (deltaValue != null && points.length == 4) {
    return points.map((point, index) =>
      index % 2 == 0 ? point * deltaValue.x : point * deltaValue.y
    );
  }

  return points;
}
