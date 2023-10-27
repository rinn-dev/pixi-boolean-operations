import { secondaryColor, whiteColor } from "../constants";
import { DELTA_VALUES, pixiStore } from "../services/Store";
import polybool from "polybooljs";

/**
 * Sort and generate rectangle points
 * @param {number[]} points - The points of the rectangle
 * @returns {number[]} An array of 4 numbers representing the coordinates of the top-left and bottom-right points of a rectangle
 */
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
 * @param {number[]} point - The points of the cursor
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
 * Get graphic object data based on current screen size
 * @param {number[]} point - The array of x and y points of the graphic object
 * @returns {number[]} - The array of x and y points of the graphic object based on current screen size
 */
export function getDrawingPoint(points) {
  const deltaValue = pixiStore[DELTA_VALUES];

  if (deltaValue != null) {
    return points.map((point, index) =>
      index % 2 == 0 ? point * deltaValue.x : point * deltaValue.y
    );
  }

  return points;
}

/**
 * Calculates and rounds the position of a segment based on its start and current points.
 *
 * @param {number[]} startPoint - The starting point of the segment.
 * @param {number[]} currentPoint - The current point of the segment.
 * @returns {[number[], boolean]} An array containing the calculated position and a boolean value indicating whether the position is near the starting point.
 *
 * @example
 * const startPoint = [0,0];
 * const currentPoint = [10,10];
 * const [position, isNearStartPoint] = roundPos(startPoint, currentPoint);
 */
export function roundPos(startPoint, currentPoint, diffFactor = 5) {
  if (startPoint.length < 2) {
    return [currentPoint, false];
  }

  const [x1, y1] = startPoint;
  const [x2, y2] = currentPoint;

  const xDiff = Math.abs(x2 - x1);
  const yDiff = Math.abs(y2 - y1);

  const isNearStartPoint = xDiff < diffFactor && yDiff < diffFactor;

  const xPos = isNearStartPoint ? x1 : x2;
  const yPos = isNearStartPoint ? y1 : y2;

  return [[xPos, yPos], isNearStartPoint];
}

/**
 * Draw a polygon on the PIXI application
 * @param {number[]} points - Node points of the polygon
 * @param {Graphics} graphic - PIXI graphic instance
 * @param {[boolean]} hasCircles - Precence of circles on each polygon node
 * @param {[boolean]} fill - Fill the polygon with color
 * @returns {void}
 */
export function drawPolygon(points, graphic, hasCircles = true, fill = true) {
  graphic.clear();

  if (graphic != null && points.length > 0) {
    graphic.lineStyle(2, secondaryColor);
    graphic.beginFill(secondaryColor, fill ? 0.25 : 0.05);

    // Get the drawing points based on current screen size
    const nodes = getDrawingPoint(points);
    const [startX, startY, ...restPoints] = nodes;

    // Move to the first polygon node
    graphic.moveTo(startX, startY);

    // Draw lines between each polygon node
    while (restPoints.length) {
      const x = restPoints.shift();
      const y = restPoints.shift();
      graphic.lineTo(x, y);
    }

    // Draw circles on each polygon node
    if (hasCircles) {
      graphic.lineStyle(2, secondaryColor);
      graphic.beginFill(secondaryColor);
      while (nodes.length) {
        const x = nodes.shift();
        const y = nodes.shift();
        graphic.drawCircle(x, y, 3.5);

        graphic.lineStyle(2, secondaryColor);
        graphic.beginFill(whiteColor);
      }
      graphic.endFill();
    }
  }
}

/**
 * Parser function to convert rectangle points into polygons (i.e, in polygon format) for boolean operations with polygons
 * @param {[number, number, number, number]} points - The top-left and bottom-right points of a rectangle
 * @returns {{regions: number[][], inverted: boolean}} Executable rectangle points
 */
export function rectToExcutable(points) {
  const [x1, y1, x2, y2] = points;
  return {
    regions: [
      [
        [x1, y1],
        [x2, y1],
        [x2, y2],
        [x1, y2],
      ],
    ],
    inverted: false,
  };
}

/**
 * Parser function to convert polygon points into excutable format
 * @param {number[]} points - The polygon points
 * @returns {{regions: number[][], inverted: boolean}} Executable polygon points
 */
export function polygonsToExecutable(points) {
  const polygonPoints = [];
  for (let x = 0; x < points.length; x += 2) {
    polygonPoints.push([points[x], points[x + 1]]);
  }
  return { regions: [polygonPoints], inverted: false };
}

/**
 * Function that checks the intersection of the polygons and returns the inserset polygon indexes
 * @param {number[]} selection - The polygon points of the selection rectangles
 * @param {number[][]} targets - The polygon points of the target polygon
 * @returns {number[]} Returns the result of intersection checking
 */
export function getSelectedIndexes(selection, targets) {
  let selectedIndexes = [];
  const selectionPolygon = rectToExcutable(selection);

  targets.forEach((target, index) => {
    const targetPolygon = polygonsToExecutable(target);
    const result = polybool.intersect(selectionPolygon, targetPolygon);
    if (result.regions?.length > 0) selectedIndexes.push(index);
  });

  return selectedIndexes;
}

/**
 * Function that checks and completes the polygon points
 * @param {number[]} points - The polygon points
 * @returns {number[]} Returns the completed polygon points
 */
export function completePolygon(points) {
  let [x, y, ...rest] = [...points];
  if (x === rest.slice(-1)[0] && y === rest.slice(-2)[0]) {
    return points;
  } else {
    // Complete the polygon by adding the first x,y at the end for points connection
    return [...points, x, y];
  }
}
