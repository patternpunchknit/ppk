// ------------------------------------------------
// PATTERN GRID WITH LOCATIONS AND STATES

class Pattern {
  constructor(element, rows, cols) {

    // Verbose if needed.
    if (verbose) console.log("Creating pattern.");

    // Define element.
    this.element = element;

    // Set numbers of rows and columns.
    this.maxRows = 60;
    this.maxCols = 24;
    this.rows = rows;
    this.cols = cols;

    // Get width and height from DOM element.
    this.width = this.element.elt.offsetWidth;
    this.height = this.element.elt.offsetHeight;

    // Randomness
    this.randomdensity = "medium";
    this.randomdensitytypes = ["low", "medium", "high"];

    // Randomness
    this.randomattraction = "medium";
    this.randomattractiontypes = ["low", "medium", "high"];

    // Verbose if needed.
    if (verbose) console.log("pattern: " + this.width + " " + this.height);
    if (verbose) console.log(this.element);

    // Create graphics.
    this.graphics = createGraphics(this.width, this.height);
    this.graphics.parent(this.element);

    // array of grid values: 0 = punch, 1 = no punch
    // usage: pattern.value[2][5] will be assigned to 6nd entry in 3rd row from *bottom*
    this.value = createMatrix(this.maxRows, this.maxCols, 1);

    if (verbose) console.log("  Create Pattern done.");
  }

  setPatternFromString(str) {

    // 011111 101101 110101 111001 100011 111111
    for (let i = 0; i < this.rows; i++) {
      for (let j = 0; j < this.cols; j++) {
        if (str.charAt(i * this.cols + j) == "0") this.value[i][j] = 0;
      }
    }
  }

  resize() {
    // Get width and height from DOM element.
    this.width = min(640, this.element.elt.offsetWidth);
    this.height = this.element.elt.offsetHeight;

    // Find cell size.
    this.cellW = this.width / this.cols;
    this.cellH = this.height / this.rows;
    this.cellSize = min(this.cellW, this.cellH);

    // Set sizes accordingly.
    this.paddingW = (this.width - this.cellSize * this.cols) / 2 + 1;
    this.paddingH = 0; // this.height - this.cellSize * this.rows;
    this.width = this.cellSize * this.cols;
    this.height = this.cellSize * this.rows;

    // Resize the canvas.
    if (this.graphics !== undefined) this.graphics.resizeCanvas(this.width, this.height);
  }

  // Update pattern in draw loop.
  update() {
    if (verbose) console.log("Pattern: update()");

    this.resize();

    // Set dimensions text on page.
    // patternDimensionsSPAN.elt.innerHTML = this.rows + "×" + this.cols;

    if (punch.mode == "wallpaper") {
      if (24 % this.cols != 0) {
        addMessage("patternCols", "The number of pattern columns is " + this.cols + ", which does not divide 24. This might cause unexpected wrapping behaviour when using wallpaper patterns.");
      } else if (this.cols == 24 && punch.wallpaperacross !== "repeat") {
        addMessage("patternCols", "The number of pattern columns is " + this.cols + ". The " + punch.wallpaperacross + " across wallpaper pattern will not be performed.");
      } else if (24 % (2 * this.cols) !== 0 && punch.wallpaperacross !== "repeat") {
        addMessage("patternCols", "The number of effective pattern columns is " + this.cols + " or " + 2 * this.cols + ", which may not divide 24. This might cause unexpected wrapping behaviour when using wallpaper patterns.");
      } else {
        deleteMessage("patternCols");
      }
      if (60 % this.rows != 0) {
        addMessage("patternRows", "The number of pattern rows is " + this.rows + ", which does not divide 60. Greyed-out rows of the punch card will not be used.");
      } else if (this.rows == 60 && punch.wallpaperup !== "repeat") {
        addMessage("patternRows", "The number of pattern rows is " + this.rows + ".The " + punch.wallpaperup + " up wallpaper pattern will not be performed.");
      } else if (60 % (2 * this.rows) !== 0 && punch.wallpaperup !== "repeat") {
        addMessage("patternRows", "The number of effective pattern rows is " + this.rows + " or " + 2 * this.rows + ", which may not divide 60. Greyed-out rows of the punch card will not be used.");
      } else {
        deleteMessage("patternRows");
      }
    }

    select("#patterninfo").elt.innerHTML = "(" + this.cols + "×" + this.rows + ")";

    // Show pattern.
    this.show();

    // Update punch.
    punch.update();
  }

  // show pattern values in cells
  // put 0th list of array into the *bottom* row
  show() {
    if (verbose) console.log("pattern.show");
    this.graphics.show();
    this.graphics.push();
    this.graphics.clear();
    this.graphics.background(0, 255, 0);

    for (let i = 0; i < this.rows; i++) {
      for (let j = 0; j < this.cols; j++) {
        // coordinates of top left corner of cell
        let leftX = j * this.cellSize;
        let topY = (this.rows - i - 1) * this.cellSize;

        this.graphics.push();
        // draw dark/light cells for 0/1 cell values
        if (this.value[i][j] == 0) {
          setStyle(1, myLightGray, parameters.knitMainColor, this.graphics);
        } else {
          setStyle(1, myLightGray, parameters.knitBackColor, this.graphics);
        }
        this.graphics.rectMode(CORNER);
        this.graphics.square(leftX, topY, this.cellSize);
        this.graphics.pop();
      }
    }
    this.graphics.pop();
  }

  // changes 0 to 1 or vice-versa
  flipValue(i, j) {
    this.value[i][j] = (this.value[i][j] + 1) % 2;
  }

  // reverses all punches
  inverse() {
    for (let i = 0; i < this.maxRows; i++) {
      for (let j = 0; j < this.maxCols; j++) {
        this.flipValue(i, j);
      }
    }
    this.update();
  }

  // randomize all punches
  random(callupdate = true) {
    let percentageBlack = 0.1 * (2 + this.randomdensitytypes.indexOf(this.randomdensity));
    let spreadThreshold = 4 - this.randomattractiontypes.indexOf(this.randomattraction);
    let currentGrid = createMatrix(this.rows, this.cols, 1);

    let attempts = 0;
    while (attempts++ < 10) {
      for (let i = 0; i < this.rows; i++) {
        for (let j = 0; j < this.cols; j++) {
          if (random(1) < percentageBlack) {
            currentGrid[i][j] = 0;
          } else {
            currentGrid[i][j] = 1;
          }
        }
      }

      // if enough nearby cells are black then turn black too
      for (let i = 0; i < this.rows; i++) {
        for (let j = 0; j < this.cols; j++) {
          // check if white cell and near at least spreadThreshold black cells
          if (currentGrid[i][j] == 1 && 8 - neighborSum(i, j, currentGrid, this.rows, this.cols) >= spreadThreshold) {
            this.value[i][j] = 0;
          } else {
            this.value[i][j] = currentGrid[i][j];
          }
        }
      }
      if (!this.isBoring()) {
        break;
      }
    }

    if (callupdate) this.update();
  }

  isBoring() {
    let ones = 0;
    let zeros = 0;
    for (let i = 0; i < this.rows; i++) {
      for (let j = 0; j < this.cols; j++) {
        if (this.value[i][j] == 0) zeros++;
        else if (this.value[i][j] == 1) ones++;
      }
    }
    const ratio = ones / (this.rows * this.cols);
    return ratio < 0.2 || ratio > 0.8;
  }

  checkerBoard() {
    for (let i = 0; i < this.maxRows; i++) {
      for (let j = 0; j < this.maxCols; j++) {
        if ((i + j) % 2 == 0) {
          this.value[i][j] = 0;
        } else {
          this.value[i][j] = 1;
        }
      }
    }
    this.update();
  }

  letterP() {
    this.rows = 6;
    this.cols = 6;
    this.clearPattern(false);
    this.setPatternFromString("101111101111100001101101100001111111");
    this.update();
  }

  comma() {
    this.rows = 8;
    this.cols = 8;
    this.clearPattern(false);
    this.setPatternFromString("1110011111011111101111111011001110110001110111011110001111111111");
    this.update();
  }

  pirate() {
    this.rows = 12;
    this.cols = 12;
    this.clearPattern(false);
    this.setPatternFromString("111111111111111111111111111000000111110111111011101111111101111111111111111111111111110001101011110101110111110001101011111111111111111111111111");
    this.update();
  }

  JForWave() {
    this.rows = 6;
    this.cols = 6;
    this.clearPattern(false);
    this.setPatternFromString("100001101101101101101101111101111101");
    this.update();
  }

  EESTI() {
    this.rows = 24;
    this.cols = 24;
    this.clearPattern(false);
    this.setPatternFromString("000011100110110011100001011001001101011001001100101100011011101100011010110110110110110110110110011011101100011011101100001101011001001101011001100110110011100110110011001101011001001101011001011011101100011011101100110110110110110110110110101100011010101100011011011001001100011001001101110011100001000011100110011001001100011001001101101100011010101100011011110110110110110110110110011011101100011011101100001101011001001101011001100110110011100110110011001101011001001101011001011011101100011011101100110110110110110110110110101100011011101100011010011001001101011001001100");
    this.update();
  }

  shiftLeft() {
    let newValue = createMatrix(this.maxRows, this.maxCols, 1);
    for (let i = 0; i < this.rows; i++) {
      for (let j = 0; j < this.cols; j++) {
        newValue[i][j] = this.value[i][(j + 1) % this.cols];
      }
    }
    this.value = newValue;
    this.update();
  }

  shiftRight() {
    let newValue = createMatrix(this.maxRows, this.maxCols, 1);
    for (let i = 0; i < this.rows; i++) {
      for (let j = 0; j < this.cols; j++) {
        newValue[i][j] = this.value[i][(j + this.cols - 1) % this.cols];
      }
    }
    this.value = newValue;
    this.update();
  }

  shiftUp() {
    let newValue = createMatrix(this.maxRows, this.maxCols, 1);
    for (let i = 0; i < this.rows; i++) {
      for (let j = 0; j < this.cols; j++) {
        newValue[i][j] = this.value[(i + this.rows - 1) % this.rows][j];
      }
    }
    this.value = newValue;
    this.update();
  }

  shiftDown() {
    let newValue = createMatrix(this.maxRows, this.maxCols, 1);
    for (let i = 0; i < this.rows; i++) {
      for (let j = 0; j < this.cols; j++) {
        newValue[i][j] = this.value[(i + 1) % this.rows][j];
      }
    }
    this.value = newValue;
    this.update();
  }

  flipHorizontal() {
    let newValue = createMatrix(this.maxRows, this.maxCols, 1);
    for (let i = 0; i < this.rows; i++) {
      for (let j = 0; j < this.cols; j++) {
        newValue[i][j] = this.value[i][this.cols - j - 1];
      }
    }
    this.value = newValue;
    this.update();
  }

  flipVertical() {
    let newValue = createMatrix(this.maxRows, this.maxCols, 1);
    for (let i = 0; i < this.rows; i++) {
      for (let j = 0; j < this.cols; j++) {
        newValue[i][j] = this.value[this.rows - i - 1][j];
      }
    }
    this.value = newValue;
    this.update();
  }

  rotate() {
    // Rotate 180 degrees clockwise if the pattern is not square
    if (this.rows != this.cols) {
      this.flipHorizontal();
      this.flipVertical();
      return;
    } else {
      let newValue = createMatrix(this.maxRows, this.maxCols, 1);
      for (let i = 0; i < this.rows; i++) {
        for (let j = 0; j < this.cols; j++) {
          newValue[i][j] = this.value[j][this.cols - i - 1];
        }
      }
      this.value = newValue;
      this.update();
    }
  }

  // reset all values to 1 (unpunched)
  clearPattern(update = true) {
    for (let i = 0; i < this.maxRows; i++) {
      for (let j = 0; j < this.maxCols; j++) {
        this.value[i][j] = 1;
      }
    }
    if (update) this.update();
  }

  // reset all SEEN values to 1 (unpunched)
  resetSeen() {
    for (let i = 0; i < this.rows; i++) {
      for (let j = 0; j < this.cols; j++) {
        this.value[i][j] = 1;
      }
    }
    this.update();
  }

  // reset all UNSEEN values to 1 (unpunched)
  resetUnseen() {
    for (let i = 0; i < this.maxRows; i++) {
      for (let j = 0; j < this.maxCols; j++) {
        if (i >= this.rows || j >= this.cols) {
          this.value[i][j] = 1;
        }
      }
    }
    this.update();
  }

  // determine if an (x,y) coordinate is inside pattern cells area
  containsPoint(x, y) {
    if (x > 0 && x < this.cols * this.cellSize && y > 0 && y < this.rows * this.cellSize) {
      return true;
    } else {
      return false;
    }
  }

  // find which row of the pattern contains y-coordinate
  rowLocation(y) {
    for (let i = 0; i < this.rows; i++) {
      let rowTopY = (this.rows - i - 1) * this.cellSize;
      let rowBottomY = (this.rows - i) * this.cellSize;
      if (y < rowBottomY && y > rowTopY) {
        return i;
      }
    }
    return -1;
  }

  // find which column of the pattern contains x-coordinate
  colLocation(x) {
    for (let j = 0; j < this.cols; j++) {
      let colLeftX = j * this.cellSize;
      let colRightX = (j + 1) * this.cellSize;
      if (x > colLeftX && x < colRightX) {
        return j;
      }
    }
    return -1;
  }

  mousePressed(x, y) {
    if (verbose) console.log(" pattern mousePressed " + x + " " + y);
    if (verbose) console.log(this.paddingH);
    if (pattern.containsPoint(x, y - this.paddingH)) {
      let i = pattern.rowLocation(y - this.paddingH);
      let j = pattern.colLocation(x);
      if (verbose) console.log("mouse clicked in cell " + i, j + " pattern.topY " + pattern.topY);
      pattern.flipValue(i, j);
    }
  }

  // mouseDragged(x, y) {
  //   if (pattern.containsPoint(x, y - this.paddingH)) {
  //     let i = pattern.rowLocation(y - this.paddingH);
  //     let j = pattern.colLocation(x);
  //     if (keyPressed)
  //     pattern.flipValue(i, j);
  //   }
  // }

  toString() {
    let result = "";
    for (let i = 0; i < this.rows; i++) {
      for (let j = 0; j < this.cols; j++) {
        result += this.value[i][j];
      }
    }
    return result;
  }

  toStringAll() {
    let result = "";
    for (let i = 0; i < this.maxRows; i++) {
      for (let j = 0; j < this.maxCols; j++) {
        result += this.value[i][j];
      }
    }
    return result;
  }
}
