// ------------------------------------------------
// PUNCH GRID WITH LOCATIONS AND STATES

class Punch {
  constructor(element, rows, cols) {
    // Define rows and columns.
    this.maxRows = 60;
    this.rows = rows;
    this.cols = cols;
    this.cardSizeString = this.cols + "×" + this.rows;

    // Define element.
    this.element = element;

    // Shifting.
    this.xshift = 0;
    this.yshift = 0;
    this.shiftString = "";

    // Lines
    this.showRepeatLines = !true;

    // Set up graphics.
    this.graphics = createGraphics();
    this.graphics.parent(this.element);

    // Set default mode.
    this.mode = "wallpaper";
    this.modetypes = ["wallpaper", "wave"];
    this.wallpaper = "p1";
    this.wallpaperacrosstypes = ["repeat", "mirror", "rotate", "alternate"];
    this.wallpaperacross = this.wallpaperacrosstypes[0];
    this.wallpaperuptypes = ["repeat", "mirror", "rotate", "alternate"];
    this.wallpaperup = this.wallpaperuptypes[0];

    // Wave options.
    this.wavestrictness = "normal";
    this.wavestrictnesstypes = ["loose", "normal", "strict"];
    this.waveTileColumns = 3;
    this.waveTileRows = 3;

    // in each one, choices are: copy, mirror, alternate, rotate
    // 
    // e.g. p1 is copy, copy
    // e.g. pmv is mirror, copy
    // e.g. cmv is mirror, alternate
    // name of the symmetry can be "reported" like rows & cols are, below
    // this.wallpapertypes = {
    //   "p1: repeat": "p1",
    //   "pmv: mirror across": "pmv", // mirror reflections (pm)
    //   "pmh: mirror up": "pmh",
    //   "pmm: mirror both": "pmm",
    //   "pgh: alternate across": "pgh", // glide reflections (pg)
    //   "pgv: alternate up": "pgv",
    //   "pgg: alternate both": "pgg",
    //   "p2v: rotate across": "p2v", // p2 rotations (p2)
    //   "p2h: rotate up": "p2h",
    //   "p2vh: rotate both": "p2vh",
    //   "cmv: mirror across, alternate up": "cmv", // cm-v
    //   "pmgvh: mirror across, rotate up": "pmgvh", // pmg-vh
    //   "cmh: alternate across, mirror up": "cmh", // cm-h
    //   "pggB: alternate across, rotate up": "pggB", // pgg-B
    //   "pmghv: rotate across, mirror up": "pmghv", // pmg-hv
    //   "pggA: rotate across, alternate up": "pggA", // pgg-A
    // };

    // array of grid values: 0 = punch, 1 = no punch
    // usage: punch.value[2][5] will be assigned to 6nd entry in 3rd row from *bottom*
    this.value = createMatrix(this.maxRows, 24, 1);
  }

  resize() {
    // Get width and height from DOM element.
    this.width = this.element.elt.offsetWidth;
    this.height = this.element.elt.offsetWidth / 0.35995;

    // Resize the canvas.
    if (this.graphics !== undefined)
      this.graphics.resizeCanvas(this.width, this.height);

    // Find cell size.
    this.cellW = this.width / this.cols;
    this.cellH = this.height / this.maxRows;
    // this.cellSize = min(this.cellW, this.cellH);

    // Set sizes accordingly.
    this.paddingW = 0;
    this.paddingH = 0 + this.height - this.cellH * this.maxRows;
    this.width = this.cellW * this.cols;
    this.height = this.cellH * this.maxRows;
  }

  // Shifting

  shiftLeft() {
    this.xshift -= 1;
    this.update();
  }

  shiftRight() {
    this.xshift += 1;
    this.update();
  }

  shiftUp() {
    this.yshift += 1;
    this.update();
  }

  shiftDown() {
    this.yshift -= 1;
    this.update();
  }

  shiftReset() {
    this.xshift = 0;
    this.yshift = 0;
    this.update();
  }

  shiftWarning() {
    if (this.xshift !== 0 && this.yshift !== 0) {
      addMessage(
        "punchShift",
        "You have shifted both vertically and horizontally. Be aware that this might break your pattern and can cause unexpected results."
      );
    } else {
      deleteMessage("punchShift");
    }
  }

  // Update punch in draw loop.
  update() {
    if (verbose) console.log("Punch: update()");

    // Update values.
    this.rows = this.maxRows;

    if (pattern.rows <= 30) {
      this.rows +=
        this.mode == "wallpaper"
          ? -(
            this.maxRows %
            ((this.wallpaperup !== "repeat" ? 2 : 1) * pattern.rows)
          )
          : 0;
    } else {
      this.rows = pattern.rows;
    }

    // Experimenting with more liberal sizing.
    // this.rows = (this.wallpaperup !== "repeat" ? 2 : 1) * pattern.rows;
    // this.cols = (this.wallpaperup !== "repeat" ? 2 : 1) * pattern.cols;
    // this.maxRows = this.rows;
    // this.maxCols = this.cols;
    // this.value = createMatrix(this.rows, this.cols, 1);

    this.resize();

    if (this.mode == "wave") {
      deleteMessage("shiftWarningHorizontal");
      deleteMessage("shiftWarningVertical");
      deleteMessage("patternRows");
      deleteMessage("patternCols");
      // create wave if pattern changed
      this.wave = new Wave();
      this.wave.setSourceCellsFromMatrix(
        pattern.value,
        pattern.cols,
        pattern.rows
      );
      this.wave.setGridSize(this.cols, this.rows);

      switch (punch.wavestrictness) {
        case "loose": {
          punch.waveTileColumns = 2;
          punch.waveTileRows = 2;
          break;
        }
        case "normal": {
          punch.waveTileColumns = 3;
          punch.waveTileRows = 3;
          break;
        }
        case "strict": {
          punch.waveTileColumns = 4;
          punch.waveTileRows = 4;
          break;
        }
      }
      this.wave.setTileSize(this.waveTileColumns, this.waveTileRows);
      this.wave.setNumberOfColors(3);
      this.wave.tolerateErrors = this.wavetype == "allowerrors";
      // If the seed is set from the URL, use this seed.
      // Then remove seed from parametersFromURL.
      if (parametersFromURL["seed"] !== undefined) {
        const seed = parseInt(parametersFromURL["seed"]);
        this.wave.seed = isNaN(seed) ? floor(random(1000000)) : seed;
        parametersFromURL["seed"] = undefined;
      } else {
        // Otherwise, create a random seed.
        this.wave.seed = floor(random(1000000));
      }

      this.wave.initialize();

      // step wave generator if using
      this.wave.run();

      // use wave code to generate punch from pattern
      this.value = this.wave.getGridMatrix();

      // Check for errors.

      // select("#calculating").html("");
      let waveFound = true;
      for (let i = 0; i < this.rows; i++) {
        for (let j = 0; j < this.cols; j++) {
          if (this.value[i][j] == -1) {
            // .value
            waveFound = false;
            break;
          }
        }
      }
      if (waveFound) {
        deleteMessage("waveNotFound");
      } else {
        addMessage(
          "waveNotFound",
          "The wave algorithm did not generate a full punch card from your pattern. Click the “New wave” button to try again, or change the pattern."
        );
      }
      if (punch.maxRows % pattern.rows !== 0) {
        addMessage(
          "waveParityWarningRows",
          "The number of pattern rows is " +
          pattern.rows +
          ", which does not divide " +
          punch.maxRows +
          ". This might cause unexpected wrapping behaviour when using wave patterns."
        );
      } else {
        deleteMessage("waveParityWarningRows");
      }
      if (punch.cols % pattern.cols !== 0) {
        addMessage(
          "waveParityWarningCols",
          "The number of pattern columns is " +
          pattern.cols +
          ", which does not divide " +
          punch.cols +
          ". This might cause unexpected wrapping behaviour when using wave patterns."
        );
      } else {
        deleteMessage("waveParityWarningCols");
      }
    } else if (this.mode == "wallpaper") {
      deleteMessage("waveNotFound");
      deleteMessage("waveParityWarningRows");
      deleteMessage("waveParityWarningCols");
      for (let i = 0; i < this.rows; i++) {
        for (let j = 0; j < this.cols; j++) {
          let I, J;
          let evenBand = i % (2 * pattern.rows) < pattern.rows;
          let evenPillar = j % (2 * pattern.cols) < pattern.cols;
          let evenCheck =
            (evenBand && evenPillar) || (!evenBand && !evenPillar);
          let southWest = evenBand && evenPillar;
          let southEast = evenBand && !evenPillar;
          let northWest = !evenBand && evenPillar;
          let northEast = !evenBand && !evenPillar;
          let iReverse = pattern.rows - i - 1;
          let jReverse = pattern.cols - j - 1;
          // p = i, j
          // b = iRev, j
          // q = i, jRev
          // d = iRev, jRev

          if (
            this.wallpaperacross == "repeat" &&
            this.wallpaperup == "repeat"
          ) {
            this.wallpaper = "p1";
            // this.wallaperDescription = "repeat across, repeat up";
            // p p
            // p p  // all bands and pillars normal
            I = i;
            J = j;
          } else if (
            this.wallpaperacross == "mirror" &&
            this.wallpaperup == "repeat"
          ) {
            this.wallpaper = "pmv";
            // this.wallaperDescription = "mirror across, repeat up";
            // p q
            // p q  // even pillars normal, odd pillars reverse cols
            I = i;
            J = evenPillar ? j : jReverse;
          } else if (
            this.wallpaperacross == "repeat" &&
            this.wallpaperup == "mirror"
          ) {
            this.wallpaper = "pmh";
            // this.wallaperDescription = "repeat across, mirror up";
            // b b
            // p p  // even bands normal, odd bands reverse rows
            I = evenBand ? i : iReverse;
            J = j;
          } else if (
            this.wallpaperacross == "mirror" &&
            this.wallpaperup == "mirror"
          ) {
            this.wallpaper = "pmm";
            // this.wallaperDescription = "mirror across, mirror up";
            // b d
            // p q  // reverse rows in odd bands and reverse cols in odd pillars
            I = evenBand ? i : iReverse;
            J = evenPillar ? j : jReverse;
          } else if (
            this.wallpaperacross == "alternate" &&
            this.wallpaperup == "repeat"
          ) {
            this.wallpaper = "pgh";
            // this.wallaperDescription = "alternate across, repeat up";
            // p b
            // p b  // even pillars normal, odd pillars reverse rows
            I = evenPillar ? i : iReverse;
            J = j;
          } else if (
            this.wallpaperacross == "repeat" &&
            this.wallpaperup == "alternate"
          ) {
            this.wallpaper = "pgv";
            // this.wallaperDescription = "repeat across, alternate up";
            // q q
            // p p  // even bands normal, odd bands reverse cols
            I = i;
            J = evenBand ? j : jReverse;
          } else if (
            this.wallpaperacross == "alternate" &&
            this.wallpaperup == "alternate"
          ) {
            this.wallpaper = "pgg";
            // this.wallaperDescription = "alternate across, alternate up";
            // q d
            // p b  // reverse cols in odd bands and reverse rows in odd pillars
            I = evenPillar ? i : iReverse;
            J = evenBand ? j : jReverse;
          } else if (
            this.wallpaperacross == "rotate" &&
            this.wallpaperup == "repeat"
          ) {
            this.wallpaper = "p2v";
            // this.wallaperDescription = "rotate across, repeat up";
            // p d
            // p d  // rotate by reversing both rows and cols in odd pillars
            I = evenPillar ? i : iReverse;
            J = evenPillar ? j : jReverse;
          } else if (
            this.wallpaperacross == "repeat" &&
            this.wallpaperup == "rotate"
          ) {
            this.wallpaper = "p2h";
            // this.wallaperDescription = "repeat across, rotate up";
            // d d
            // p p  // rotate by reversing both rows and cols in odd bands
            I = evenBand ? i : iReverse;
            J = evenBand ? j : jReverse;
          } else if (
            this.wallpaperacross == "rotate" &&
            this.wallpaperup == "rotate"
          ) {
            this.wallpaper = "p2vh";
            // this.wallaperDescription = "rotate across, rotate up";
            // d p
            // p d  // rotate by reversing both rows and cols in checkerboard
            I = evenCheck ? i : iReverse;
            J = evenCheck ? j : jReverse;
          } else if (
            this.wallpaperacross == "mirror" &&
            this.wallpaperup == "alternate"
          ) {
            this.wallpaper = "cmv";
            // this.wallaperDescription = "mirror across, alternate up";
            // q p
            // p q  // reverse columns in odd checks
            I = i;
            J = evenCheck ? j : jReverse;
          } else if (
            this.wallpaperacross == "mirror" &&
            this.wallpaperup == "rotate"
          ) {
            this.wallpaper = "pmgvh";
            // this.wallaperDescription = "mirror across, rotate up";
            // d b
            // p q  // choose each quadrant accordingly
            I = southWest ? i : southEast ? i : northWest ? iReverse : iReverse;
            J = southWest ? j : southEast ? jReverse : northWest ? jReverse : j;
          } else if (
            this.wallpaperacross == "alternate" &&
            this.wallpaperup == "mirror"
          ) {
            this.wallpaper = "cmh";
            // this.wallaperDescription = "alternate across, mirror up";
            // b p
            // p b  // reverse rows in odd checks
            I = evenCheck ? i : iReverse;
            J = j;
          } else if (
            this.wallpaperacross == "alternate" &&
            this.wallpaperup == "rotate"
          ) {
            this.wallpaper = "pggB";
            // this.wallaperDescription = "alternate across, rotate up";
            // d q
            // p b  // choose each quadrant accordingly
            I = southWest ? i : southEast ? iReverse : northWest ? iReverse : i;
            J = southWest ? j : southEast ? j : northWest ? jReverse : jReverse;
          } else if (
            this.wallpaperacross == "rotate" &&
            this.wallpaperup == "mirror"
          ) {
            this.wallpaper = "pmghv";
            // this.wallaperDescription = "rotate across, mirror up";
            // b q
            // p d  // choose each quadrant accordingly
            I = southWest ? i : southEast ? iReverse : northWest ? iReverse : i;
            J = southWest ? j : southEast ? jReverse : northWest ? j : jReverse;
          } else if (
            this.wallpaperacross == "rotate" &&
            this.wallpaperup == "alternate"
          ) {
            this.wallpaper = "pggA";
            // this.wallaperDescription = "rotate across, alternate up";
            // q b
            // p d  // choose each quadrant accordingly
            I = southWest ? i : southEast ? iReverse : northWest ? i : iReverse;
            J = southWest ? j : southEast ? jReverse : northWest ? jReverse : j;
          }
          this.value[i][j] =
            pattern.value[mod(I, pattern.rows)][mod(J, pattern.cols)]; //{ value: pattern.value[mod(I, pattern.rows)][mod(J, pattern.cols)] };
        }
      }

      let newValue = createMatrix(this.maxRows, 24, 1);
      for (let i = 0; i < this.rows; i++) {
        for (let j = 0; j < this.cols; j++) {
          let band = floor(i / pattern.rows);
          let pillar = floor(j / pattern.cols);
          newValue[i][j] =
            this.value[mod(i + -this.yshift * pillar, punch.rows)][
            mod(j - this.xshift * band, punch.cols)
            ];
          // this.value[i][j] += this.value[mod(this.yshift * pillar, pattern.rows)][mod(0 - this.xshift * band, pattern.cols)]; //{ value: this.value[mod(i + this.yshift * pillar, pattern.rows)][mod(j - this.xshift * band, pattern.cols)] };
        }
      }
      this.value = newValue;

      // Warnings.
      if (
        (this.xshift * floor(punch.rows / pattern.rows)) %
        (2 * pattern.cols) !==
        0
      ) {
        addMessage(
          "shiftWarningHorizontal",
          "The horizontal shift is " +
          this.xshift +
          ". This is repeated " +
          floor(punch.rows / pattern.rows) +
          " times on the punch card, resulting in a total horizontal shift of " +
          this.xshift * floor(punch.rows / pattern.rows) +
          ". The effective pattern width is " +
          pattern.cols +
          " or " +
          2 * pattern.cols +
          ", which may not divide this total horizontal shift. This might cause unexpected wrapping behaviour when using wallpaper patterns."
        );
      } else {
        deleteMessage("shiftWarningHorizontal");
      }
      if (
        punch.cols % pattern.cols == 0 &&
        (this.yshift * floor(punch.cols / pattern.cols)) %
        (2 * pattern.rows) !==
        0
      ) {
        addMessage(
          "shiftWarningVertical",
          "The vertical shift is " +
          this.yshift +
          ". This is repeated " +
          floor(punch.cols / pattern.cols) +
          " times on the punch card, resulting in a total vertical shift of " +
          this.yshift * floor(punch.cols / pattern.cols) +
          ". The effective pattern height is " +
          pattern.rows +
          " or " +
          2 * pattern.rows +
          ", which does not divide this total vertical shift. This might cause unexpected wrapping behaviour when using wallpaper patterns."
        );
      } else {
        deleteMessage("shiftWarningVertical");
      }
    }

    // Set dimensions on page.
    // punchDimensionsSPAN.elt.innerHTML = this.rows + "×" + this.cols;

    // Find repeats.
    this.findRepeats();

    // Update strings.
    this.cardSizeString = this.cols + "×" + this.rows;
    select("#punchinfo").elt.innerHTML =
      "(" +
      this.cardSizeString +
      ", " +
      this.colRepeat +
      "×" +
      this.rowRepeat +
      " repeat)";
    this.shiftString = "x = " + this.xshift + ", y = " + this.yshift;

    // Shift warning.
    this.shiftWarning();

    // Show.
    this.show();

    // Update knit.
    knit.update();
  }

  nextWallpaper() {
    let acrossValues = Object.values(punch.wallpaperacrosstypes);
    let acrossIndex = acrossValues.indexOf(punch.wallpaperacross);
    let upValues = Object.values(punch.wallpaperuptypes);
    let upIndex = upValues.indexOf(punch.wallpaperup);

    let nextUpIndex = (upIndex + 1) % upValues.length;
    let nextAcrossIndex = acrossIndex;
    if (nextUpIndex == 0) {
      nextAcrossIndex = (nextAcrossIndex + 1) % acrossValues.length;
    }

    punch.wallpaperacross = acrossValues[nextAcrossIndex];
    punch.wallpaperup = upValues[nextUpIndex];
    this.update();
  }

  prevWallpaper() {
    let acrossValues = Object.values(punch.wallpaperacrosstypes);
    let acrossIndex = acrossValues.indexOf(punch.wallpaperacross);
    let upValues = Object.values(punch.wallpaperuptypes);
    let upIndex = upValues.indexOf(punch.wallpaperup);

    let nextUpIndex = (upIndex + upValues.length - 1) % upValues.length;
    let nextAcrossIndex = acrossIndex;
    if (nextUpIndex == upValues.length - 1) {
      nextAcrossIndex =
        (nextAcrossIndex + acrossValues.length - 1) % acrossValues.length;
    }

    punch.wallpaperacross = acrossValues[nextAcrossIndex];
    punch.wallpaperup = upValues[nextUpIndex];
    this.update();
  }

  randomWallpaper() {
    let acrossValues = Object.values(punch.wallpaperacrosstypes);
    let upValues = Object.values(punch.wallpaperuptypes);
    let newWallpaperacross = acrossValues[floor(random(acrossValues.length))];
    let newWallpaperup = upValues[floor(random(upValues.length))];
    while (
      newWallpaperacross == punch.wallpaperacross &&
      newWallpaperup == punch.wallpaperup
    ) {
      newWallpaperacross = acrossValues[floor(random(acrossValues.length))];
      newWallpaperup = upValues[floor(random(upValues.length))];
    }

    punch.wallpaperacross = newWallpaperacross;
    punch.wallpaperup = newWallpaperup;
    this.update();
  }

  resetWallpaper() {
    punch.wallpaperacross = this.wallpaperacrosstypes[0];
    punch.wallpaperup = this.wallpaperuptypes[0];
    pattern.update();
  }

  // show punch values in cells
  // put 0th list of array into the *bottom* row
  show() {
    this.graphics.show();
    this.graphics.push();
    this.graphics.clear();
    this.graphics.translate(this.paddingW, this.paddingH);

    if (debug) {
      this.graphics.rectMode(CORNER);
      this.graphics.strokeWeight(1);
      this.graphics.stroke(255, 0, 0);
      this.graphics.noFill();
      this.graphics.rect(0, 0, this.width, this.height);
    }

    // for (let i = 0; i <= this.maxRows; i++) {
    //   this.graphics.strokeWeight(i == 0 || i == this.maxRows ? 0.6 : 0.2);
    //   this.graphics.stroke(0, 0, 255);
    //   let y = (this.maxRows - i) * this.cellH;
    //   this.graphics.line(0, y, this.width, y);
    // }
    // for (let j = 0; j <= this.cols; j++) {
    //   this.graphics.strokeWeight(j == 0 || j == this.cols ? 0.6 : 0.2);
    //   this.graphics.stroke(0, 0, 255);
    //   let x = j * this.cellW;
    //   this.graphics.line(x, 0, x, this.height);
    // }

    for (let i = 0; i < this.maxRows; i++) {
      for (let j = 0; j < this.cols; j++) {
        let centerX = (j + 0.5) * this.cellW;
        let centerY = (this.maxRows - i - 0.5) * this.cellH;

        // draw all cell rectangles
        setStyle(1, myGray, 255, this.graphics);

        if (this.mode == "wallpaper" && i >= this.rows) {
          this.graphics.strokeWeight(1);
          this.graphics.stroke(myGray);
          this.graphics.fill(230, 230, 230);
        } else {
          this.graphics.strokeWeight(1);
          this.graphics.stroke(myGray);
          this.graphics.fill(255);
        }

        this.graphics.rectMode(CENTER);
        this.graphics.rect(centerX, centerY, this.cellW, this.cellH);

        if (this.value[i][j] == 0) {
          // draw punched cells
          setStyle(0, 0, 128, this.graphics);
          this.graphics.ellipseMode(CENTER);
          this.graphics.ellipse(centerX, centerY, 0.75 * this.cellH); // CHECK
        } else if (this.value[i][j] == -1) {
          // draw undetermined cells
          this.graphics.noStroke();
          this.graphics.fill(200, 0, 0, 100);
          this.graphics.rectMode(CENTER);
          this.graphics.rect(centerX, centerY, this.cellW, this.cellH);
        }
      }
    }

    // Show lines for row repeats and column repeats.
    if (this.showRepeatLines) {
      for (let i = 1; i < this.rows; i++) {
        if (i % this.rowRepeat == 0) {
          this.graphics.strokeWeight(2);
          this.graphics.stroke(255, 140, 0);
          let y = (this.maxRows - i) * this.cellH;
          this.graphics.line(0, y, this.width, y);
        }
      }

      for (let j = 1; j < this.cols; j++) {
        if (j % this.colRepeat == 0) {
          this.graphics.strokeWeight(2);
          this.graphics.stroke(255, 140, 0);
          let x = j * this.cellW;
          this.graphics.line(x, 0, x, this.height);
        }
      }
    }

    this.graphics.pop();
  }

  exportTXT() {
    let result =
      "[" +
      this.value
        .map((row) => "[" + row.join(",") + "]")
        .reverse()
        .join(",") +
      "]";
    saveStrings([result], getTimeString() + "-punch", "txt");
  }

  exportSVGwithDotsOnly() {
    this.exportSVG(false);
  }

  exportSVGwithCricutJoy() {
    this.exportSVG(true);
  }

  exportSVG(cutoff = true) {
    let punchDiameter = 3.75; // punch diameter
    let punchRadius = punchDiameter / 2; // punch radius
    let horiSep = 4.5; // horizontal distance between punch centers
    let vertSep = 5.01; // vertical distance between punch centers
    let C = 24; // number of columns
    let R = 60; // number of rows
    let cutOffAtTop = cutoff ? 0.238 : 0; // amount of edge circles to erase to stay in 11.75
    let totalWidth = horiSep * (C - 1) + punchDiameter; // total width
    let totalHeight =
      vertSep * (R - 1) + punchDiameter - cutOffAtTop * punchDiameter; // total height

    let strings = [];
    strings.push("<?xml version='1.0' standalone='no'?>");
    strings.push(
      "<!DOCTYPE svg PUBLIC '-//W3C//DTD SVG 1.1//EN' 'http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd'>"
    );
    strings.push(
      "<svg width='" +
      totalWidth +
      "mm' height='" +
      totalHeight +
      "mm' viewBox='0 0 " +
      totalWidth +
      " " +
      totalHeight +
      "' xmlns='http://www.w3.org/2000/svg' version='1.1'>"
    );

    let pathString = "";
    // "<path d='M " + xstart + " " + ystart + " A " + punchRadius + " " + punchRadius + " 0 1 0 " + xend + " " + yend + " z' stroke='black' stroke-width='0.1' fill='gray' />"
    pathString += "<path d='";

    if (cutoff) {
      let i = this.maxRows - 1;
      for (let j = 0; j < this.cols; j++) {
        let x = punchRadius + j * horiSep;
        let y =
          punchRadius +
          (this.maxRows - i - 1) * vertSep -
          cutOffAtTop * punchDiameter;
        // move X
        // X = +/- sqrt( (d/2)^2 - (d/2 - 0.238d)^2 )
        let xstart = x - 1.59636;
        let xend = x + 1.59636;
        // move Y
        // Y = d/2 - 0.238d
        let ystart = y - 0.9826;
        let yend = y - 0.9826;

        if (this.value[i][j] == 0) {
          // strings.push("<circle cx='" + x + "' cy='" + y + "' r='" + punchRadius + "' stroke='black' stroke-width='0.1' fill='gray'/>");
          pathString +=
            "M " +
            xstart +
            " " +
            ystart +
            " A " +
            punchRadius +
            " " +
            punchRadius +
            " 0 1 0 " +
            xend +
            " " +
            yend +
            " z ";
        }
      }
    }

    for (let i = 0; i < this.maxRows - (cutoff ? 1 : 0); i++) {
      for (let j = 0; j < this.cols; j++) {
        let x = punchRadius + j * horiSep;
        let y =
          punchRadius +
          (this.maxRows - i - 1) * vertSep -
          cutOffAtTop * punchDiameter;
        if (this.value[i][j] == 0) {
          pathString += "M " + (x - punchRadius) + " " + y + " ";
          pathString +=
            "a " +
            punchRadius +
            " " +
            punchRadius +
            " 0 1 0 " +
            punchDiameter +
            " 0 ";
          pathString +=
            "a " +
            punchRadius +
            " " +
            punchRadius +
            " 0 1 0 " +
            -punchDiameter +
            " 0 ";
          // strings.push("<circle cx='" + x + "' cy='" + y + "' r='" + punchRadius + "' stroke='black' stroke-width='0.1' fill='gray'/>");
        }
      }
    }
    pathString += "' stroke='black' stroke-width='0.1' fill='gray' />";

    strings.push(pathString);

    //
    //     for (let i = 0; i < this.maxRows - (cutoff ? 1 : 0); i++) {
    //       for (let j = 0; j < this.cols; j++) {
    //         let x = punchRadius + j * horiSep;
    //         let y = punchRadius + (this.maxRows - i - 1) * vertSep - cutOffAtTop * punchDiameter;
    //         if (this.value[i][j] == 0) {
    //           strings.push("<circle cx='" + x + "' cy='" + y + "' r='" + punchRadius + "' stroke='black' stroke-width='0.1' fill='gray'/>");
    //         }
    //       }
    //     }

    //     if (cutoff) {
    //       let i = this.maxRows - 1;
    //       for (let j = 0; j < this.cols; j++) {
    //         let x = punchRadius + j * horiSep;
    //         let y = punchRadius + (this.maxRows - i - 1) * vertSep - cutOffAtTop * punchDiameter;
    //         // move X
    //         // X = +/- sqrt( (d/2)^2 - (d/2 - 0.238d)^2 )
    //         let xstart = x - 1.59636;
    //         let xend = x + 1.59636;
    //         // move Y
    //         // Y = d/2 - 0.238d
    //         let ystart = y - 0.9826;
    //         let yend = y - 0.9826;
    //
    //         if (this.value[i][j] == 0) {
    //           // strings.push("<circle cx='" + x + "' cy='" + y + "' r='" + punchRadius + "' stroke='black' stroke-width='0.1' fill='gray'/>");
    //           strings.push("<path d='M " + xstart + " " + ystart + " A " + punchRadius + " " + punchRadius + " 0 1 0 " + xend + " " + yend + " z' stroke='black' stroke-width='0.1' fill='gray' />");
    //         }
    //       }
    //     }
    strings.push("</svg>");

    saveStrings(strings, getTimeString(), "svg");
  }

  exportPNG() {
    saveCanvas(punch.graphics, getTimeString() + "-punch.png");
  }

  // show attributes and locations
  debug() {
    // print attribute values to console
    if (verbose) console.log("punch.rows " + this.rows);
    if (verbose) console.log("punch.cols " + this.cols);
    if (verbose) console.log("punch.value[0] " + this.value[0]);
    if (verbose) console.log("punch.value[0][0] " + this.value[0][0]);

    // highlight corners of punch area
    push();
    setStyle(1, myWhite, myGreen);
    ellipseMode(CENTER);
    circle(0, 0, 20);
    circle(0, this.bottomY, 20);
    circle(0, this.bottomY, 20);
    circle(0, 0, 20);
    pop();

    // highlight corners of visible pattern
    push();
    setStyle(1, myBlue, myWhite);
    ellipseMode(CENTER);
    circle(0, this.rows * this.cellSize, 10); // NEW
    circle(0, 0, 10);
    circle(0, this.rows * this.cellSize, 10);
    circle(0, 0, 10);
    pop();
  }

  areRowsEqual(r1, r2) {
    for (let c = 0; c < this.cols; c++) {
      if (this.value[r1][c] != this.value[r2][c]) return false;
    }
    return true;
  }

  areColumnsEqual(c1, c2) {
    for (let r = 0; r < this.rows; r++) {
      if (this.value[r][c1] != this.value[r][c2]) return false;
    }
    return true;
  }

  getRowsWithSameValue() {
    return [
      ...this.getRowsWithSameGivenValue(0),
      ...this.getRowsWithSameGivenValue(1),
    ];
  }

  // Return all rows that have the same value for all cells in it.
  getRowsWithSameGivenValue(value) {
    let rows = [];
    for (let r = 0; r < this.rows; r++) {
      let allSame = true;
      for (let c = 0; c < this.cols; c++) {
        if (this.value[r][c] != value) {
          allSame = false;
          break;
        }
      }
      if (allSame) rows.push(r);
    }
    return rows;
  }

  isPatternRepeatedRowwiseByPeriod(period) {
    if (this.rows % period != 0) return false;
    for (let r1 = 0; r1 < this.rows; r1++) {
      for (let r2 = r1; r2 < this.rows; r2++) {
        if (r1 % period == r2 % period) {
          if (!this.areRowsEqual(r1, r2)) return false;
        }
      }
    }
    return true;
  }

  isPatternRepeatedColumnwiseByPeriod(period) {
    if (this.cols % period != 0) return false;
    for (let c1 = 0; c1 < this.cols; c1++) {
      for (let c2 = c1; c2 < this.cols; c2++) {
        if (c1 % period == c2 % period) {
          if (!this.areColumnsEqual(c1, c2)) return false;
        }
      }
    }
    return true;
  }

  findRepeats() {
    this.rowRepeat = this.rows;
    this.colRepeat = this.cols;
    // Find smallest rowwwise repeat.
    for (let period = 1; period < this.rows; period++) {
      if (this.isPatternRepeatedRowwiseByPeriod(period)) {
        this.rowRepeat = period;
        break;
      }
    }
    // Find smallest columnwise repeat.
    for (let period = 1; period < this.cols; period++) {
      if (this.isPatternRepeatedColumnwiseByPeriod(period)) {
        this.colRepeat = period;
        break;
      }
    }
  }
}
