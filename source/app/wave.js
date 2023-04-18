"use strict";

class Wave {
  constructor() {
    this.resetSources();
    this.hasWildcards = !true; // for creating virtual sources; last color is wildcard value
    this.useSecondSource = !true; // Toggle whether second source is activated, which means that we are creating tiles from it.
    this.sourceWrapping = true;
    this.topDownGlitch = true;
    this.topDownGlitchRatioStart = 0;
    this.topDownGlitchRatioEnd = 0.8;
    this.tolerateErrors = false;
  }

  step() {
    this.grid.step();
  }

  run() {
    let stepCounter = 0;
    while (this.searching) {
      this.step();
      stepCounter++;
    }
    if (verbose) console.log("wave done after " + stepCounter + " steps");
  }

  initialize() {
    randomSeed(this.seed);
    if (verbose) console.log("Wave: initialize");
    this.errorCount = 0;
    if (this.useSecondSource) {
      // Because second argument is present, we are creating two sources.
      this.tileLibrary = new TileLibrary(this, this.sourceCells, this.sourceCellsSecond);
    } else {
      // Create tiles only from primary source.
      this.tileLibrary = new TileLibrary(this, this.sourceCells);
    }

    //this.tileLibrary.randomize(0.5);
    this.grid = new Grid(this, this.gridC, this.gridR);
    this.searching = true;
  }

  setGridSize(gridC, gridR) {
    this.gridC = gridC;
    this.gridR = gridR;
  }

  setSourceSize(sourceC, sourceR) {
    this.sourceC = sourceC;
    this.sourceR = sourceR;
  }

  setTileSize(tileC, tileR) {
    this.tileC = tileC;
    this.tileR = tileR;
  }

  setNumberOfColors(c) {
    this.noColors = c;
  }

  resetSources() {
    this.sourceCells = [];
    this.sourceCellsSecond = [];
    for (let c = 0; c < this.sourceC; c++) {
      for (let r = 0; r < this.sourceR; r++) {
        this.sourceCells[c + r * this.sourceC] = 0; // floor(random(2));
        this.sourceCellsSecond[c + r * this.sourceC] = 0; // floor(random(2));
      }
    }
  }

  setSourceCells(cells) {
    this.sourceCells = cells;
  }

  setSourceCellsSecond(cells) {
    this.sourceCellsSecond = cells;
  }

  setSourceCellsFromMatrix(M, sourceC, sourceR) {
    this.sourceC = sourceC;
    this.sourceR = sourceR;
    this.sourceCells = [];
    for (let r = this.sourceR - 1; r >= 0; r--) {
      for (let c = 0; c < this.sourceC; c++) {
        this.sourceCells.push(M[r][c]);
      }
    }
  }

  getGridMatrix() {
    let theMatrix = [];
    for (let i = 0; i < this.gridR; i++) {
      theMatrix[i] = [];
      for (let j = 0; j < this.gridC; j++) {
        let c = j;
        let r = this.gridR - i - 1;
        let x = r * this.gridC + c;
        theMatrix[i][j] = this.grid.cells[x].value;
      }
    }
    return theMatrix;
  }
}

class TileLibrary {
  constructor(wave, sourceCells, sourceCellsSecond) {
    this.wave = wave;
    this.tiles = new Map();
    this.neighborsN = new Map();
    this.neighborsE = new Map();
    this.neighborsS = new Map();
    this.neighborsW = new Map();

    if (this.wave.hasWildcards) {
      for (let virtualSource of expandArray(sourceCells, this.wave.noColors - 1, [...Array(this.wave.noColors - 1).keys()])) {
        this.createTilesFromSource(virtualSource);
      }
      if (sourceCellsSecond !== undefined) {
        for (let virtualSource of expandArray(sourceCellsSecond, this.wave.noColors - 1, [...Array(this.wave.noColors - 1).keys()])) {
          this.createTilesFromSource(virtualSource);
        }
      }
    } else {
      this.createTilesFromSource(sourceCells);
      if (sourceCellsSecond !== undefined) {
        this.createTilesFromSource(sourceCellsSecond);
      }
    }
    if (verbose) console.log("TileLibrary created");
  }

  tileIndices() {
    return Array.from(this.tiles, ([key, value]) => key);
  }

  createTilesFromSource(source) {
    for (let c = 0; c < this.wave.sourceC - (this.wave.sourceWrapping ? 0 : this.wave.tileC - 1); c++) {
      for (let r = 0; r < this.wave.sourceR - (this.wave.sourceWrapping ? 0 : this.wave.tileR - 1); r++) {
        let values = [];
        let valuesN = [];
        let valuesE = [];
        let valuesS = [];
        let valuesW = [];
        for (let i = 0; i < this.wave.tileC; i++) {
          for (let j = 0; j < this.wave.tileR; j++) {
            let currentC = (c + i) % this.wave.sourceC;
            let currentR = (r + j) % this.wave.sourceR;
            values[i + j * this.wave.tileC] = source[currentC + currentR * this.wave.sourceC];
            // North
            let northC = currentC;
            let northR = (currentR - 1 + this.wave.sourceR) % this.wave.sourceR;
            valuesN[i + j * this.wave.tileC] = source[northC + northR * this.wave.sourceC];
            // East
            let eastC = (currentC + 1) % this.wave.sourceC;
            let eastR = currentR % this.wave.sourceR;
            valuesE[i + j * this.wave.tileC] = source[eastC + eastR * this.wave.sourceC];
            // South
            let southC = currentC;
            let southR = (currentR + 1) % this.wave.sourceR;
            valuesS[i + j * this.wave.tileC] = source[southC + southR * this.wave.sourceC];
            // West
            let westC = (currentC - 1 + this.wave.sourceC) % this.wave.sourceC;
            let westR = currentR % this.wave.sourceR;
            valuesW[i + j * this.wave.tileC] = source[westC + westR * this.wave.sourceC];
          }
        }
        let tile = new Tile(this, values);
        let tileN = new Tile(this, valuesN);
        let tileE = new Tile(this, valuesE);
        let tileS = new Tile(this, valuesS);
        let tileW = new Tile(this, valuesW);
        let index = tile.index();
        let indexN = tileN.index();
        let indexE = tileE.index();
        let indexS = tileS.index();
        let indexW = tileW.index();
        if (!this.tiles.has(index)) {
          this.tiles.set(index, tile);
          this.neighborsN.set(index, [indexN]);
          this.neighborsE.set(index, [indexE]);
          this.neighborsS.set(index, [indexS]);
          this.neighborsW.set(index, [indexW]);
        } else {
          if (!this.neighborsN.get(index).includes(indexN)) this.neighborsN.get(index).push(indexN);
          if (!this.neighborsE.get(index).includes(indexE)) this.neighborsE.get(index).push(indexE);
          if (!this.neighborsS.get(index).includes(indexS)) this.neighborsS.get(index).push(indexS);
          if (!this.neighborsW.get(index).includes(indexW)) this.neighborsW.get(index).push(indexW);
        }
      }
    }
  }

  randomTileKey() {
    let allKeys = Array.from(this.tiles.keys());
    return allKeys[floor(random(allKeys.length))];
  }

  randomize(f) {
    let n = floor(f * this.tiles.size);
    let randomized = [];
    while (randomized.length < n) {
      let randomKey = this.randomTileKey();
      if (!randomized.includes(randomKey)) {
        this.neighborsN.set(randomKey, Array.from(this.tiles.keys()));
        this.neighborsE.set(randomKey, Array.from(this.tiles.keys()));
        this.neighborsS.set(randomKey, Array.from(this.tiles.keys()));
        this.neighborsW.set(randomKey, Array.from(this.tiles.keys()));
        randomized.push(randomKey);
      }
    }
    if (verbose) console.log("Done randomizing");
    if (verbose) console.log(randomized);
  }
}

class Tile {
  constructor(tileLibrary, values) {
    this.tileLibrary = tileLibrary;
    this.values = values == undefined ? [] : values;
  }

  get(c, r) {
    return this.values[c + r * this.tileLibrary.wave.tileC];
  }

  set(c, r, value) {
    this.values[c + r * this.tileLibrary.wave.tileC] = value;
  }

  value() {
    return this.values[0];
  }

  index() {
    let result = 0;
    let multiplier = 1;
    for (let i = this.values.length - 1; i >= 0; i--) {
      result += multiplier * this.values[i];
      multiplier *= this.tileLibrary.wave.noColors;
    }
    return result;
  }

  printToConsole() {
    let result = "";
    for (let j = 0; j < this.tileLibrary.wave.tileR; j++) {
      for (let i = 0; i < this.tileLibrary.wave.tileC; i++) {
        result += this.values[i + j * this.tileLibrary.wave.tileC];
      }
      result += "\n";
    }
    result += "\n";
    if (verbose) console.log(result);
  }
}

class Grid {
  constructor(wave, gridC, gridR) {
    this.wave = wave;
    this.gridC = gridC;
    this.gridR = gridR;
    this.cells = [];
    for (let c = 0; c < this.gridC; c++) {
      for (let r = 0; r < this.gridR; r++) {
        this.cells[c + r * this.gridC] = new Cell(this, c, r);
      }
    }
    for (let c = 0; c < this.gridC; c++) {
      for (let r = 0; r < this.gridR; r++) {
        let N = this.getCell(c, (r - 1 + this.gridR) % this.gridR);
        let E = this.getCell((c + 1) % this.gridC, r);
        let S = this.getCell(c, (r + 1) % this.gridR);
        let W = this.getCell((c - 1 + this.gridC) % this.gridC, r);
        this.cells[c + r * this.gridC].setNeighbors(N, E, S, W);
      }
    }
  }

  getCell(column, row) {
    return this.cells[column + row * this.gridC];
  }

  setCell(column, row, cell) {
    this.cells[column + row * this.gridC] = cell;
  }

  step() {
    for (let c = 0; c < this.gridC; c++) {
      for (let r = 0; r < this.gridR; r++) {
        this.cells[c + r * this.gridC].checked = false;
      }
    }

    let selectedCell = this.selectCell();

    if (selectedCell == false) {
      this.wave.searching = false;
      return;
    }

    let cellsToCheck = [];

    if (this.wave.searching) {
      selectedCell.chooseCandidateRandomly();
      cellsToCheck.push(selectedCell);
    }

    while (cellsToCheck.length > 0) {
      // if (debug) if (verbose) console.log("cellsToCheck = " + cellsToCheck.length);
      let cell = cellsToCheck.pop();
      cell.updateNeighbors(cellsToCheck);
    }
  }

  selectCell() {
    let bestCells = [];
    for (let c = 0; c < this.gridC; c++) {
      for (let r = 0; r < this.gridR; r++) {
        let nextCell = this.cells[c + r * this.gridC];
        if (nextCell.value == -1) {
          if (bestCells.length == 0 || nextCell.candidates.length < bestCells[0].candidates.length) {
            bestCells = [];
            bestCells.push(nextCell);
          } else if (nextCell.candidates.length == bestCells[0].candidates.length) {
            bestCells.push(nextCell);
          }
        }
      }
    }
    if (bestCells.length > 0) {
      // bestCells.sort((a, b) => {
      //   if (tileLibrary.tiles())
      // });
      return bestCells[floor(random(bestCells.length))];
    } else {
      return false;
    }
  }
}

class Cell {
  constructor(grid, c, r) {
    // Initially, all tiles are candidates.
    this.candidates = grid.wave.tileLibrary.tileIndices();
    this.value = -1;
    this.grid = grid;
    this.checked;
    this.column = c;
    this.row = r;
  }

  setNeighbors(N, E, S, W) {
    this.neighborN = N;
    this.neighborE = E;
    this.neighborS = S;
    this.neighborW = W;
  }

  chooseCandidateRandomly() {
    this.candidates = [this.candidates[floor(random(this.candidates.length))]];
    this.value = this.grid.wave.tileLibrary.tiles.get(this.candidates[0]).value();
  }

  updateNeighbors(cellsToCheck) {
    this.checked = true;

    if (this.neighborN.candidates.length !== 1) {
      let possibleCandidateForNeighborN = [];
      for (let candidate of this.candidates) {
        possibleCandidateForNeighborN.push(...this.grid.wave.tileLibrary.neighborsN.get(candidate));
      }
      let statusAfterUpdateN = this.neighborN.restrictCandidatesWith(possibleCandidateForNeighborN);
      if (statusAfterUpdateN == -1) {
        this.checked = true;
        this.grid.wave.searching = false;
        return;
      } else if (this.grid.wave.searching && statusAfterUpdateN == 1) {
        if (this.neighborN.candidates.length == 1) {
          this.neighborN.value = this.grid.wave.tileLibrary.tiles.get(this.neighborN.candidates[0]).value();
        }
        if (!cellsToCheck.includes(this.neighborN)) {
          cellsToCheck.push(this.neighborN);
        }
        // this.neighborN.updateNeighbors();
      }
    }

    if (this.neighborE.candidates.length !== 1) {
      let possibleCandidateForNeighborE = [];
      for (let candidate of this.candidates) {
        possibleCandidateForNeighborE.push(...this.grid.wave.tileLibrary.neighborsE.get(candidate));
      }
      let statusAfterUpdateE = this.neighborE.restrictCandidatesWith(possibleCandidateForNeighborE);
      if (statusAfterUpdateE == -1) {
        this.checked = true;
        this.grid.wave.searching = false;
        return;
      } else if (this.grid.wave.searching && statusAfterUpdateE == 1) {
        if (this.neighborE.candidates.length == 1) {
          this.neighborE.value = this.grid.wave.tileLibrary.tiles.get(this.neighborE.candidates[0]).value();
        }
        if (!cellsToCheck.includes(this.neighborE)) {
          cellsToCheck.push(this.neighborE);
        }
        // this.neighborE.updateNeighbors();
      }
    }

    if (this.neighborS.candidates.length !== 1) {
      let possibleCandidateForNeighborS = [];
      for (let candidate of this.candidates) {
        possibleCandidateForNeighborS.push(...this.grid.wave.tileLibrary.neighborsS.get(candidate));
      }
      let statusAfterUpdateS = this.neighborS.restrictCandidatesWith(possibleCandidateForNeighborS);
      if (statusAfterUpdateS == -1) {
        this.checked = true;
        this.grid.wave.searching = false;
        return;
      } else if (this.grid.wave.searching && statusAfterUpdateS == 1) {
        if (this.neighborS.candidates.length == 1) {
          this.neighborS.value = this.grid.wave.tileLibrary.tiles.get(this.neighborS.candidates[0]).value();
        }
        if (!cellsToCheck.includes(this.neighborS)) {
          cellsToCheck.push(this.neighborS);
        }
        // this.neighborS.updateNeighbors();
      }
    }
    if (this.neighborW.candidates.length !== 1) {
      let possibleCandidateForNeighborW = [];
      for (let candidate of this.candidates) {
        possibleCandidateForNeighborW.push(...this.grid.wave.tileLibrary.neighborsW.get(candidate));
      }
      let statusAfterUpdateW = this.neighborW.restrictCandidatesWith(possibleCandidateForNeighborW);
      if (statusAfterUpdateW == -1) {
        this.grid.wave.searching = false;
        this.checked = true;
        return;
      } else if (this.grid.wave.searching && statusAfterUpdateW == 1) {
        if (this.neighborW.candidates.length == 1) {
          this.neighborW.value = this.grid.wave.tileLibrary.tiles.get(this.neighborW.candidates[0]).value();
        }
        if (!cellsToCheck.includes(this.neighborW)) {
          cellsToCheck.push(this.neighborW);
        }
        // this.neighborW.updateNeighbors();
      }
    }
  }

  restrictCandidatesWith(candidateList) {
    let newCandidates;
    if (this.topDownGlitch) {
      let r = random(1);
      let p = this.row / this.grid.gridR;
      newCandidates = r > this.topDownGlitchRatioStart * p && r < this.topDownGlitchRatioEnd * p ? this.candidates : this.candidates.filter((x) => candidateList.includes(x));
    } else if (this.glitch) {
      newCandidates = random(1.0) < this.glitchRatio ? this.candidates : this.candidates.filter((x) => candidateList.includes(x));
    } else {
      newCandidates = this.candidates.filter((x) => candidateList.includes(x));
    }
    // Status reflect what happened to the list of candidates.
    // -1 = The list is empty.
    // 0 = No change. Therefore no need to update anything.
    // 1 = The list is shorter, but not empty.
    let status = 0;
    if (newCandidates.length == 0) {
      if (this.tolerateErrors) {
        if (debug) {
          errorCount++;
          if (verbose) console.log("tolerating error " + errorCount);
        }
        // This keeps the list of candidates intact and returns 0 (which means no change).
        return 0;
      } else {
        this.candidates = newCandidates;
        status = -1;
      }
    } else if (newCandidates.length < this.candidates.length) {
      status = 1;
      this.candidates = newCandidates;
    }
    return status;
  }

  printCandidatesToConsole() {
    for (let candidate of this.candidates) {
      tileLibrary.tiles.get(candidate).printToConsole();
    }
  }
}

function expandArray(source, wildcard, expandsTo) {
  let result = [[]];
  for (let element of source) {
    if (element == wildcard) {
      // [[0],[1],[2],[3]].flatMap(l => [[...l,99],[...l, 98]])
      // [[0,99],[0,98],...]
      // If expandsTo = [0,1], we have:
      // result = result.flatMap((l) => [
      //   [...l, 0],
      //   [...l, 1],
      // ]);
      // This generalizes to:
      result = result.flatMap((l) => expandsTo.map((x) => [...l, x]));
      // expandArray([3,3], 3, [0,1,2])
      // gives: [[0,0],[0,1],[0,2],[1,0],...]
    } else {
      for (let array of result) {
        array.push(element);
      }
    }
  }
  return result;
}
