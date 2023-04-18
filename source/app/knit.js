// ------------------------------------------------
// KNIT GRID WITH LOCATIONS AND STATES

class Knit {
  constructor(element, rows, cols) {
    if (verbose) console.log("Creating Knit.");

    // rows and columns
    this.rows = rows;
    this.cols = cols;

    // shape
    this.shapetypes = ["stitch", "box"];
    this.shape = this.shapetypes[0];

    // cell size
    this.cellSize = 8;

    // from bottom
    this.fromBottom = true;

    // float string
    this.floatString = "";

    // knit initials
    this.maxKnitSize = 256;

    // element
    this.element = element;

    // Graphics.
    this.graphics = createGraphics();
    this.graphics.parent(this.element);

    // Resize the canvas.
    this.resize();

    // 60x60 array of grid values: 0 = punch, 1 = no punch
    // usage: knit.value[2][5] will be assigned to 6nd entry in 3rd row from *bottom*
    this.value = createMatrix(this.maxKnitSize, this.maxKnitSize, 1);

    if (verbose) console.log("  Create Knit done.");
  }

  resize(w = this.element.elt.offsetWidth, h = this.element.elt.offsetHeight) {
    // Resize the canvas.
    if (this.graphics !== undefined) this.graphics.resizeCanvas(w, h);

    // Get width and height from DOM element.
    this.width = w;
    this.height = h;

    // Define rows and columns.
    this.rows = min(this.maxKnitSize, floor(this.height / this.cellSize));
    this.cols = min(this.maxKnitSize, floor(this.width / this.cellSize));

    this.paddingH = 0;
    this.realCellSize = this.height / this.rows;
    this.leftX = 0;
    this.rightX = 0;
    this.topY = 0;
    this.bottomY = this.topY + this.height; // todo: remove
  }

  swapColors() {
    let temp = parameters.knitMainColor;
    parameters.knitMainColor = parameters.knitBackColor;
    parameters.knitBackColor = temp;
    pattern.update();
  }

  // update knit in draw loop
  update(
    w = this.element.elt.offsetWidth,
    h = this.element.elt.offsetHeight,
    returnimage = false
  ) {
    if (verbose) console.log("Knit: update()");

    this.resize(w, h);

    // Update knit to be a p1 of the punch.
    for (let i = 0; i < this.rows; i++) {
      for (let j = 0; j < this.cols; j++) {
        this.value[i][j] = punch.value[i % punch.rows][j % punch.cols];
      }
    }

    // Set dimensions on page.
    // knitDimensionsSPAN.elt.innerHTML = this.rows + "×" + this.cols;

    // Update URL.
    if (needsUpdateURL) {
      if (verbose)
        console.log(" needsUpdateURL is true: knit calling updateURL");
      updateURL();
    } else {
      if (verbose)
        console.log(" needsUpdateURL is false: setting needsUpdateURL to true");
      needsUpdateURL = true;
    }

    // Update color of title to be gradient from main color to background color.
    document.querySelectorAll(".maintitle").forEach((e) => {
      e.style.color = parameters.knitMainColor;

    });

    // Update float string.
    this.floatString = this.findFloats();

    // Messages.
    showMessages();

    // Show.
    this.show();

    if (returnimage) {
      return knit.graphics.elt.toDataURL();
    }
  }

  // Find the longest floats in the knit. A float is a sequence of repeated 0s or 1s.
  findFloats() {

    // Ignore rows that are all 0s or all 1s.
    let ignoreRows = punch.getRowsWithSameValue();

    // Find the longest sequence of same values in each row not in ignoreRows.
    let longestSequence = 0;

    // For each row that is not in ignoreRows.
    for (let i = 0; i < this.rows; i++) {
      if (!ignoreRows.includes(i)) {
        longestSequence = max(
          longestSequence,
          this.findLongestSequenceInRow(i)
        );
      }
    }

    // Return.
    return longestSequence + (ignoreRows.length > 0 ? " (∞)" : "");
  }

  // Find the longest sequence of same values in a row.
  findLongestSequenceInRow(row) {
    let longestSequence = 0;
    let currentSequence = 0;
    let currentValue = this.value[row][0];
    for (let i = 0; i < this.cols; i++) {
      if (this.value[row][i] == currentValue) {
        currentSequence++;
      } else {
        longestSequence = max(longestSequence, currentSequence);
        currentSequence = 1;
        currentValue = this.value[row][i];
      }
    }
    return longestSequence;
  }

  // draw background behind knit stitches
  drawBackground() {
    if (verbose) console.log("Knit: drawBackground()");
    this.graphics.clear();
    // extract RGBA vector and set as background
    let backgroundColor = color(parameters.knitBackColor).levels;
    // reduce alpha for semi-transparent background matching backColor
    backgroundColor[3] = 0.7 * backgroundColor[3];
    setStyle(1, backgroundColor, backgroundColor, this.graphics);
    let cellWidth = this.realCellSize * (this.shape == "box" ? 1 : 1.25);
    let cellHeight = this.realCellSize;
    this.graphics.rect(
      this.leftX,
      this.topY,
      cellWidth * this.cols,
      cellHeight * this.rows
    );
  }

  feelingSpicy() {
    if (verbose) console.log("🌶 feelingSpicy");

    // Random parameters for punch.
    punch.mode = random(punch.modetypes);
    switch (punch.mode) {
      case "wallpaper": {
        wallpaperGUI.show();
        waveGUI.hide();
        break;
      }
      case "wave": {
        waveGUI.show();
        wallpaperGUI.hide();
        break;
      }
    }

    // Random parameters for pattern.
    pattern.rows = ceil(random(punch.mode == "wallpaper" ? 30 : 12));
    pattern.cols = ceil(random(punch.mode == "wallpaper" ? 24 : 12));
    pattern.randomdensity = random(pattern.randomdensitytypes);
    pattern.randomattraction = random(pattern.randomattractiontypes);
    pattern.random(false);

    // Random parameters for punch.
    if (punch.mode == "wallpaper") {
      punch.wallpaperacross = random(punch.wallpaperacrosstypes);
      punch.wallpaperup = random(punch.wallpaperuptypes);

      if (random(1) < 0.5) {
        punch.xshift = random([...Array(pattern.cols * 2).keys()]);
        punch.yshift = 0;
      } else {
        punch.xshift = 0;
        punch.yshift = random([...Array(pattern.rows * 2).keys()]);
      }
    } else {
      punch.xshift = 0;
      punch.yshift = 0;
      this.wavestrictness = random(this.wavestrictnesstypes);
    }

    // Random parameters for knit.
    this.randomSpicyColors(false);
    // knit.shape = random(knit.shapetypes);
    // knit.cellSize = floor(random(5, 30));

    // Done.
    if (verbose) console.log("Parameters randomly set. Calling update.");
    pattern.update();
  }

  feelingLucky() {
    if (verbose) console.log("✨ feelingLucky");

    // Random parameters for pattern.
    pattern.rows = random([3, 5, 6, 10, 15]);
    pattern.cols = random([3, 4, 6, 12]);
    pattern.randomdensity = random(pattern.randomdensitytypes);
    pattern.randomattraction = random(pattern.randomattractiontypes);
    pattern.random(false);

    // Random parameters for punch.
    punch.mode = "wallpaper";
    wallpaperGUI.show();
    waveGUI.hide();

    punch.wallpaperacross = random(punch.wallpaperacrosstypes);
    punch.wallpaperup = random(punch.wallpaperuptypes);

    if (random(1) < 0.5) {
      punch.xshift = random(
        [...Array(pattern.cols * 2).keys()].filter((xShift) => {
          return (xShift * (60 / pattern.rows)) % (2 * pattern.cols) == 0;
        })
      );
      punch.yshift = 0;
    } else {
      punch.xshift = 0;
      punch.yshift = random(
        [...Array(pattern.rows * 2).keys()].filter((yShift) => {
          return (yShift * (24 / pattern.cols)) % (2 * pattern.rows) == 0;
        })
      );
    }

    // Random parameters for knit.
    this.randomNiceColors(false);
    this.shape = "stitch";
    this.cellSize = 12;

    // Done.
    if (verbose) console.log("Parameters randomly set. Calling update.");
    pattern.update();
  }

  randomNiceColors(updatePattern = true) {
    parameters.knitMainColor = randomDarkColorString();
    parameters.knitBackColor = matchingLightColorString(
      parameters.knitMainColor
    );
    if (updatePattern) pattern.update();
  }

  randomSpicyColors(updatePattern = true) {
    parameters.knitMainColor = randomColorString();
    parameters.knitBackColor = randomColorString();
    if (updatePattern) pattern.update();
  }

  brightenBackground() {
    parameters.knitBackColor = colorToCode(
      lerpColor(color(parameters.knitBackColor), color("#ffffff"), 0.1)
    );
    pattern.update();
  }

  darkenBackground() {
    parameters.knitBackColor = colorToCode(
      lerpColor(color(parameters.knitBackColor), color("#000000"), 0.1)
    );
    pattern.update();
  }

  // show punch values in cells
  // put 0th list of array into the *bottom* row
  show() {
    if (verbose) console.log("Knit: show()");
    this.graphics.push();
    this.graphics.translate(0, this.paddingH);
    this.graphics.show();
    this.drawBackground();
    let cellWidth = this.realCellSize * (this.shape == "box" ? 1 : 1.25);
    let cellHeight = this.realCellSize;
    for (let i = this.rows - 1; i >= 0; i--) {
      for (let j = 0; j < this.cols; j++) {
        let leftX = this.leftX + j * cellWidth;
        let centerX = leftX + cellWidth / 2;
        let rightX = leftX + cellWidth;
        let topY = this.fromBottom
          ? this.bottomY - (i + 1) * cellHeight
          : i * cellHeight;
        let centerY = topY + cellHeight / 2;
        let bottomY = topY + cellHeight;

        // When b is held down, show box view. (66 is the key code for the letter "b".)
        if (pressedKey(66)) {
          // this.shape == "box"
          this.graphics.rectMode(CORNER);
          this.graphics.noStroke();
          if (this.value[i][j] == 0) {
            this.graphics.fill(parameters.knitMainColor);
          } else {
            this.graphics.fill(parameters.knitBackColor);
          }
          this.graphics.rect(leftX, topY, cellWidth, cellHeight);
        } else if (this.shape == "stitchold") {
          // choose stitch color based on punches
          if (this.value[i][j] == 0) {
            this.graphics.stroke(parameters.knitMainColor);
          } else {
            this.graphics.stroke(parameters.knitBackColor);
          }
          this.graphics.strokeWeight(0.4 * this.cellSize);
          this.graphics.strokeCap(ROUND);

          // draw v-stitch
          let nudge = 0.2 * this.cellSize;
          this.graphics.line(
            leftX + nudge,
            topY + nudge,
            centerX,
            bottomY - nudge
          );
          this.graphics.line(
            centerX,
            bottomY - nudge,
            rightX - nudge,
            topY + nudge
          );
        } else if (this.shape == "stitch") {
          drawStitchReal(
            this.graphics,
            this.value[i][j] == 0
              ? parameters.knitMainColor
              : parameters.knitBackColor,
            cellWidth,
            cellHeight,
            centerX,
            centerY
          );
        }
      }
    }
    this.graphics.pop();
  }

  // show attributes and locations
  debug() {

    // print attribute values to console
    if (verbose) console.log("knit.rows " + this.rows);
    if (verbose) console.log("knit.cols " + this.cols);
    if (verbose) console.log("knit.value[0] " + this.value[0]);
    if (verbose) console.log("knit.value[0][0] " + this.value[0][0]);

    // print color values to console
    if (verbose) console.log("mainColor " + parameters.knitMainColor);
    if (verbose) console.log("backColor " + parameters.knitBackColor);

    // highlight corners of knit area
    push();
    setStyle(1, myWhite, myGreen);
    ellipseMode(CENTER);
    circle(this.leftX, this.topY, 20);
    circle(this.leftX, this.bottomY, 20);
    circle(this.rightX, this.bottomY, 20);
    circle(this.rightX, this.topY, 20);
    pop();
  }
}

function drawStitch(graphics, col, cellWidth, cellHeight, x, y) {
  const centerTop = createVector(x, y - cellHeight / 2);
  const centerBot = createVector(x, y + cellHeight / 2);

  const xSep = createVector(0.07 * cellWidth, 0);
  const xSide = createVector(0.41 * cellWidth, 0);
  const ySep = createVector(0, -0.23 * cellHeight);
  const yGap = createVector(0, 0.5 * cellHeight);

  const yGapSep = p5.Vector.add(ySep, yGap);

  const LInnerB = p5.Vector.sub(centerBot, xSep);
  const LInnerT = p5.Vector.sub(p5.Vector.sub(centerTop, ySep), xSep);
  const LOuterT = p5.Vector.sub(p5.Vector.sub(centerTop, yGapSep), xSide);
  const LOuterB = p5.Vector.sub(p5.Vector.sub(centerBot, yGap), xSide);

  const RInnerB = p5.Vector.add(centerBot, xSep);
  const RInnerT = p5.Vector.add(p5.Vector.sub(centerTop, ySep), xSep);
  const ROuterT = p5.Vector.add(p5.Vector.sub(centerTop, yGapSep), xSide);
  const ROuterB = p5.Vector.add(p5.Vector.sub(centerBot, yGap), xSide);

  graphics.noStroke();
  graphics.fill(col);

  graphics.beginShape();
  graphics.vertex(LInnerB.x, LInnerB.y);
  graphics.vertex(LInnerT.x, LInnerT.y);
  graphics.vertex(LOuterT.x, LOuterT.y);
  graphics.vertex(LOuterB.x, LOuterB.y);
  graphics.endShape(CLOSE);

  drawLine(graphics, cellHeight, col, LInnerB, LInnerT);
  drawLine(graphics, cellHeight, col, LInnerT, LOuterT);
  drawLine(graphics, cellHeight, col, LOuterT, LOuterB);
  drawLine(graphics, cellHeight, col, LOuterB, LInnerB);

  graphics.noStroke();
  graphics.fill(col);

  graphics.beginShape();
  graphics.vertex(RInnerB.x, RInnerB.y);
  graphics.vertex(RInnerT.x, RInnerT.y);
  graphics.vertex(ROuterT.x, ROuterT.y);
  graphics.vertex(ROuterB.x, ROuterB.y);
  graphics.endShape(CLOSE);

  drawLine(graphics, cellHeight, col, RInnerB, RInnerT);
  drawLine(graphics, cellHeight, col, RInnerT, ROuterT);
  drawLine(graphics, cellHeight, col, ROuterT, ROuterB);
  drawLine(graphics, cellHeight, col, ROuterB, RInnerB);
}

function drawLine(graphics, cellSize, col, from, to) {
  graphics.stroke(col);
  graphics.strokeWeight(0.11 * cellSize);
  graphics.strokeCap(ROUND);
  graphics.line(from.x, from.y, to.x, to.y);
}

function drawStitchReal(graphics, col, cellWidth, cellHeight, x, y) {
  graphics.push();

  const X = -20;
  const Y = -102;
  const cellW = 300;
  const cellH = 225;

  const A = createVector(-16, 225);
  const Ao = createVector(39, -73);
  const Bi = createVector(-68, -87);
  const B = createVector(-130, -182);
  const Bo = createVector(-206, 91);
  const Ci = createVector(-35, 96);

  graphics.fill(col);

  graphics.stroke(50);
  graphics.strokeWeight(0.05 * cellW);

  graphics.translate(x, y);
  graphics.scale(cellWidth / cellW, cellHeight / cellH);

  graphics.beginShape();
  graphics.vertex(A.x, A.y);
  graphics.bezierVertex(Ao.x, Ao.y, Bi.x, Bi.y, B.x, B.y);
  graphics.bezierVertex(Bo.x, Bo.y, Ci.x, Ci.y, A.x, A.y);
  graphics.endShape(CLOSE);

  graphics.beginShape();
  graphics.vertex(-A.x, A.y);
  graphics.bezierVertex(-Ao.x, Ao.y, -Bi.x, Bi.y, -B.x, B.y);
  graphics.bezierVertex(-Bo.x, Bo.y, -Ci.x, Ci.y, -A.x, A.y);
  graphics.endShape(CLOSE);

  graphics.pop();
}
