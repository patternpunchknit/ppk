// ------------------------------------------------
// COLORS that laura likes

let myWhite = [255, 255, 255]; // 0xffffff
let myLightGray = [245, 245, 245]; // 0xf5f5f5
let myGray = [200, 200, 200]; // 0xc8c8c8
let myDarkGray = [100, 100, 100]; // 0x646464
let myBlack = [0, 0, 0]; // 0x000000
let myGreen = [0, 200, 0]; // 0x00C800
let myBlue = [0, 100, 200]; // 0x0064C8
let myWarningColor = [200, 100, 100];

// ------------------------------------------------
// STYLE set in one line
// stroke color, stroke weight, fill color
// use -1 to leave unchanged and 'none' for noFill
// use number or color(r,g,b) for stroke and fill colors

function setStyle(newWeight, newColor, newFill, canvas) {
  if (canvas == undefined) {
    if (newWeight != -1) {
      strokeWeight(newWeight);
    }
    if (newColor != -1) {
      stroke(newColor);
    }
    if (newFill != -1) {
      fill(newFill);
    }
    if (newFill == "none") {
      noFill();
    }
  } else {
    if (newWeight != -1) {
      canvas.strokeWeight(newWeight);
    }
    if (newColor != -1) {
      canvas.stroke(newColor);
    }
    if (newFill != -1) {
      canvas.fill(newFill);
    }
    if (newFill == "none") {
      canvas.noFill();
    }
  }
}

// ------------------------------------------------
// 2D ARRAY construction shortcut

function createMatrix(rows, cols, initial) {
  let theMatrix = [];
  for (let i = 0; i < rows; i++) {
    theMatrix[i] = []; // Nested array.
    for (let j = 0; j < cols; j++) {
      theMatrix[i][j] = initial;
    }
  }
  return theMatrix;
}

// ------------------------------------------------
// mod that is always positive

function mod(a, b) {
  return ((a % b) + b) % b;
}
