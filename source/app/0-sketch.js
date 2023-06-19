"use strict";

// ------------------------------------------------
// GLOBALS

const verbose = !true;
const debug = !true;

let pattern, punch, knit;
let topGUI, patternGUI, punchGUI, knitGUI, shiftGUI, GUIS;
let patternDimensionsSPAN, punchDimensionsSPAN, knitDimensionsSPAN;
let parametersFromURL, needsUpdateURL;
let wallpaperGUI, waveGUI;
let messageBoxDIV, messageListDIV, messages;
let parameters;

// ------------------------------------------------
// SETUP

function setup() {
  // Turn of default canvas, and use graphics objects instead.
  noCanvas();

  // Set pixel density.
  pixelDensity(2);

  // We will update only when needed.
  noLoop();

  // Set up viewport fix for Safari on iOS.
  setUpViewportFix();

  // Set needsUpdateURL parameter.
  needsUpdateURL = true;

  // Initialize.
  init();
}

async function init(withReset = true, urlString = location.href) {
  if (verbose)
    console.log(" ------------------------------------------------ INIT");

  if (withReset) {
    // Reset parameters.
    parameters = {};

    // Read URL.
    await setParametersFromURL(urlString);
  }

  messages = {};

  // Define color pairs.
  let colorPairs = [];
  colorPairs.push(["#5C527F", "#A89ABF"]);

  // Pick random color pair.
  let colorPair = colorPairs[Math.floor(Math.random() * colorPairs.length)];

  // Set global paramters.
  parameters.suppressMessages = !true;
  parameters.knitMainColor = getStringFromParameters(
    "main",
    colorPair[0],
    // randomDarkColorString(),
    /^[0-9a-fA-F]{6}/
  );
  parameters.knitMainColor =
    (parameters.knitMainColor.charAt(0) !== "#" ? "#" : "") +
    parameters.knitMainColor;

  parameters.knitBackColor = getStringFromParameters(
    "back",
    colorPair[1],
    // matchingLightColorString(parameters.knitMainColor),
    /^[0-9a-fA-F]{6}/
  );
  parameters.knitBackColor =
    (parameters.knitBackColor.charAt(0) !== "#" ? "#" : "") +
    parameters.knitBackColor;

  // Reset elements.
  select("#pattern").elt.replaceChildren();
  select("#punch").elt.replaceChildren();
  select("#knit").elt.replaceChildren();

  // Define pattern.
  pattern = new Pattern(
    select("#pattern"),
    getIntFromParameters("rows", 6),
    getIntFromParameters("cols", 6)
  );
  pattern.setPatternFromString(
    getStringFromParameters(
      "pattern",
      "101111101111100001101101100001111111",
      // "011111101101110101111001100011111111",
      /^[01]*$/
    )
  );

  // Define punch.
  punch = new Punch(select("#punch"), 60, 24);
  punch.mode = getStringFromParameters("mode", "wallpaper", punch.modetypes);
  punch.wallpaperacross = getStringFromParameters(
    "across",
    "alternate",
    punch.wallpaperacrosstypes
  );
  punch.wallpaperup = getStringFromParameters(
    "up",
    "rotate",
    punch.wallpaperuptypes
  );
  punch.xshift = getIntFromParameters("x", 0);
  punch.yshift = getIntFromParameters("y", 0); // Laura changed 3 to 0

  punch.wavestrictness = getStringFromParameters(
    "strictness",
    "normal",
    punch.wavestrictnesstypes
  );

  // Knit.
  knit = new Knit(select("#knit"), 120, 120);
  knit.cellSize = getIntFromParameters("zoom", 12, 5, 100);

  // Create GUI.
  initGUI();

  // Update Pattern, Punch, and Knit.
  pattern.update();
}

function windowResized() {
  // Resize.
  pattern.resize();
  punch.resize();
  knit.resize();

  // Show.
  pattern.show();
  punch.show();

  // Turn off update URL.
  needsUpdateURL = false;

  // Update.
  knit.update();
}

// ------------------------------------------------
// DRAW

function draw() {
  // We don’t need draw.
}

// ------------------------------------------------
// MOUSE ACTIONS

function mousePressed(e) {
  if (e.target == pattern.graphics.canvas) {
    pattern.mousePressed(e.offsetX, e.offsetY);
    pattern.update();
  }
}

function mouseWheel(e) {
  if (e.target == knit.graphics.canvas) {
    let newCellSize = min(max(5, floor(knit.cellSize - e.delta / 16)), 100);
    if (newCellSize !== knit.cellSize) {
      knit.cellSize = newCellSize;
      needsUpdateURL = false;
      knit.update();
    }
  }
}

function colorToCode(c) {
  return (
    "#" +
    hex(floor(c.levels[0]), 2) +
    hex(floor(c.levels[1]), 2) +
    hex(floor(c.levels[2]), 2)
  );
}

// Clear all
function clearAll() {

  // Set global paramters.
  parameters.suppressMessages = !true;

  // Reset elements.
  select("#pattern").elt.replaceChildren();
  select("#punch").elt.replaceChildren();
  select("#knit").elt.replaceChildren();

  // Define pattern.
  pattern = new Pattern(
    select("#pattern"),
    getIntFromParameters("rows", 6),
    getIntFromParameters("cols", 6)
  );

  // Define punch.
  punch = new Punch(select("#punch"), 60, 24);
  punch.mode = getStringFromParameters("mode", "wallpaper", punch.modetypes);
  punch.wallpaperacross = "repeat";
  punch.wallpaperup = "repeat";
  punch.xshift = getIntFromParameters("x", 0);
  punch.yshift = getIntFromParameters("y", 0);
  punch.wavestrictness = "normal";

  // Knit.
  knit = new Knit(select("#knit"), 120, 120);
  knit.cellSize = 12;

  // Create GUI.
  initGUI();

  // Update Pattern, Punch, and Knit.
  pattern.update();

}