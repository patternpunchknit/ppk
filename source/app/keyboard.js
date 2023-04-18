let keyboardPresses = {};

function pressedKey(key) {
  return keyboardPresses[key];
}

function keyReleased() {
  keyboardPresses[keyCode] = false;

  // Don’t show the boxes anymore.
  if (key == "b") {
    knit.show();
  }
}

function keyPressed(e) {
  if (verbose) print("keyPressed: keyCode = " + keyCode + " / key = " + key + " / key.charCodeAt(0) = " + key.charCodeAt(0));

  keyboardPresses[keyCode] = true;

  if (pressedKey(SHIFT)) {
    if (key == "ArrowLeft") {
      punch.shiftLeft();
      shiftGUI.open();
    } else if (key == "ArrowRight") {
      punch.shiftRight();
      shiftGUI.open();
    } else if (key == "ArrowUp") {
      punch.shiftUp();
      shiftGUI.open();
    } else if (key == "ArrowDown") {
      punch.shiftDown();
      shiftGUI.open();
    }
  } else {
    if (key == "ArrowLeft") pattern.shiftLeft();
    else if (key == "ArrowRight") pattern.shiftRight();
    else if (key == "ArrowUp") pattern.shiftUp();
    else if (key == "ArrowDown") pattern.shiftDown();
  }

  if (punch.mode == "wallpaper") {
    if (key == "n") punch.nextWallpaper();
    else if (key == "N") punch.prevWallpaper();
    else if (key == "m") punch.randomWallpaper();
  }

  if (key == "q") {
    debug = !debug;
  } else if (key == "s") {
    screenshot();
  }

  // Show boxes instead of stiches. This happens in knit.show(), where we check for pressedKey(66).
  if (key == "b") {
    knit.show();
  }

  if (key == " ") {
    if (pressedKey(SHIFT)) {
      knit.feelingSpicy();
    } else {
      knit.feelingLucky();
    }
  }

  if (key == "o") {
    if (GUIS.every((x) => x._closed)) {
      GUIS.forEach((x) => {
        x.open();
      });
    } else {
      GUIS.forEach((x) => {
        x.close();
      });
    }
    updateURL();
  }
}
