/**
 * A function that handle to display the errors from PIXI applicatoin
 * @param {Event} e - PIXI error
 * @returns {void}
 */
export function handleError(e) {
  const message = e.detail.message;
  if (message) {
    let errorElement = document.getElementById("error-container");
    errorElement.innerText = `* The selected polygons must be touching to perform merging.`;
    setTimeout(() => (errorElement.innerText = ""), 5000);
  }
}
