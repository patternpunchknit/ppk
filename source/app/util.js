function randomDarkColorString() {
  return "#" + hex(floor(random(10, 130)), 2) + hex(floor(random(10, 130)), 2) + hex(floor(random(10, 130)), 2);
}

function randomColorString() {
  return "#" + hex(floor(random(0, 255)), 2) + hex(floor(random(0, 255)), 2) + hex(floor(random(0, 255)), 2);
}

function randomLightColorString() {
  return "#" + hex(floor(random(180, 255)), 2) + hex(floor(random(180, 255)), 2) + hex(floor(random(180, 255)), 2);
}

function matchingLightColorString(col) {
  return colorToCode(lerpColor(color(col), color(randomLightColorString()), random(0.5, 0.8)));
}

function takeScreenshot() {
  saveCanvas(graphics, getTimeString() + ".png");
}

function getTimeString() {
  return str(year()) + ("0" + str(month())).slice(-2) + ("0" + str(day())).slice(-2) + "_" + ("0" + str(hour())).slice(-2) + ("0" + str(minute())).slice(-2) + ("0" + str(second())).slice(-2);
}

function writeParametersToFile() {
  let filename = getTimeString();
  let infoStrings = [];
  infoStrings.push("parameters = " + JSON.stringify(parameters));

  for (let index = 0; index < graph.nodes.length; index++) {
    infoStrings.push("node " + index + " = " + posToString(graph.nodes[index].position));
  }
  let state = easycam.getState();
  infoStrings.push("camera = " + JSON.stringify(state));
  infoStrings.push("volume = " + graph.volume);

  saveStrings(infoStrings, filename, "txt");
  saveCanvas(graphics, filename + ".png");
}

function neighborSum(i, j, grid, N, M) {
  let result =
    grid[mod(i - 1, N)][mod(j - 1, M)] + //
    grid[mod(i - 1, N)][mod(j, M)] + //
    grid[mod(i - 1, N)][mod(j + 1, M)] + //
    grid[mod(i, N)][mod(j - 1, M)] + //
    grid[mod(i, N)][mod(j, M)] + //
    grid[mod(i + 1, N)][mod(j - 1, M)] + //
    grid[mod(i + 1, N)][mod(j, M)] + //
    grid[mod(i + 1, N)][mod(j + 1, M)]; //
  return result;
}
