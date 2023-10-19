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
