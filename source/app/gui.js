// ------------------------------------------------
// INITIAL VALUES
let patternWidth = 250;
let patternHeight = 750;
let wave = ["[off]", "plain"];

// ------------------------------------------------
// CREATE GUIS

function initGUI() {
  // Reset element.
  document.getElementById("lilgui-top").innerHTML = "";
  document.getElementById("lilgui-pattern").innerHTML = "";
  document.getElementById("lilgui-punch").innerHTML = "";
  document.getElementById("lilgui-knit").innerHTML = "";

  // TOP GUI
  // ------------------------------------------------

  topGUI = new lil.GUI({
    container: document.getElementById("lilgui-top"),
    title: "Reset",
  });
  topGUI.add({ clearAll: () => clearAll() }, "clearAll").name("Start fresh");

  // PATTERN
  // ------------------------------------------------

  patternGUI = new lil.GUI({
    container: document.getElementById("lilgui-pattern"),
    title: "Pattern",
    // width: 300,
  });
  patternGUI
    .add(pattern, "rows", 1, pattern.maxRows, 1)
    .listen()
    .name("Rows")
    .onChange(() => {
      pattern.update();
    });
  patternGUI
    .add(pattern, "cols", 1, 24, 1)
    .listen()
    .name("Columns")
    .onChange(() => {
      pattern.update();
    });
  let templateGUI = patternGUI.addFolder("Templates").close();
  templateGUI.add(pattern, "letterP").name("Letter P (for wallpaper)");
  templateGUI.add(pattern, "JForWave").name("Letter J (for wave)");
  templateGUI.add(pattern, "comma").name("Comma");
  templateGUI.add(pattern, "pirate").name("Pirate");
  templateGUI.add(pattern, "EESTI").name("Eesti");
  templateGUI.add(pattern, "checkerBoard").name("Checkerboard");

  let randomGUI = patternGUI.addFolder("Randomize").close();
  randomGUI.add(pattern, "random").name("Random");

  randomGUI
    .add(pattern, "randomdensity", pattern.randomdensitytypes)
    .listen()
    .name("Density")
    .onChange(() => {
      pattern.random();
    });
  randomGUI
    .add(pattern, "randomattraction", pattern.randomattractiontypes)
    .listen()
    .name("Spread")
    .onChange(() => {
      pattern.random();
    });

  shiftGUI = patternGUI.addFolder("Shift pattern").close();
  shiftGUI.add(pattern, "shiftRight").name("Shift right");
  shiftGUI.add(pattern, "shiftLeft").name("Shift left");
  shiftGUI.add(pattern, "shiftUp").name("Shift up");
  shiftGUI.add(pattern, "shiftDown").name("Shift down");

  let modifyGUI = patternGUI.addFolder("Modify pattern").close();
  modifyGUI.add(pattern, "inverse").name("Inverse");
  modifyGUI.add(pattern, "flipHorizontal").name("Flip horizontal");
  modifyGUI.add(pattern, "flipVertical").name("Flip vertical");
  modifyGUI.add(pattern, "rotate").name("Rotate");

  patternGUI.add(pattern, "clearPattern").name("Clear pattern");

  // PUNCH
  // ------------------------------------------------

  punchGUI = new lil.GUI({
    container: document.getElementById("lilgui-punch"),
    title: "Punch",
    // width: 300,
  });

  punchGUI
    .add(punch, "mode", ["wallpaper", "wave"])
    .name("Mode")
    .listen()
    .onChange(() => {
      switch (punch.mode) {
        case "wallpaper": {
          wallpaperGUI.show();
          waveGUI.hide();
          pattern.update();
          break;
        }
        case "wave": {
          waveGUI.show();
          wallpaperGUI.hide();
          pattern.update();
          break;
        }
      }
    });

  // PUNCH: Wallpaper
  // ------------------------------------------------

  wallpaperGUI = punchGUI.addFolder("Wallpaper options");

  wallpaperGUI.add(punch, "nextWallpaper").name("Next");
  wallpaperGUI.add(punch, "prevWallpaper").name("Previous");
  wallpaperGUI.add(punch, "randomWallpaper").name("Random");
  wallpaperGUI.add(punch, "resetWallpaper").name("Reset");

  wallpaperGUI
    .add(punch, "wallpaperacross", punch.wallpaperacrosstypes)
    .name("Across")
    .listen()
    .onChange(() => {
      pattern.update();
      punch.update();
      knit.update();
    });

  wallpaperGUI
    .add(punch, "wallpaperup", punch.wallpaperuptypes)
    .name("Up")
    .listen()
    .onChange(() => {
      pattern.update();
      punch.update();
      knit.update();
    });
  wallpaperGUI
    .add(punch, "wallpaper")
    .name("Wallpaper group")
    .listen()
    .disable();

  // PUNCH: Shift
  // ------------------------------------------------

  shiftGUI = wallpaperGUI.addFolder("Shift punch").close();
  shiftGUI.add(punch, "shiftRight").name("Shift right");
  shiftGUI.add(punch, "shiftLeft").name("Shift left");
  shiftGUI.add(punch, "shiftUp").name("Shift up");
  shiftGUI.add(punch, "shiftDown").name("Shift down");
  shiftGUI.add(punch, "shiftReset").name("Reset shifts");
  shiftGUI.add(punch, "shiftString").name("Shift status").listen().disable();

  // PUNCH: Wave
  // ------------------------------------------------

  waveGUI = punchGUI.addFolder("Wave options");
  waveGUI.add(punch, "update").name("New wave");

  waveGUI
    .add(punch, "wavestrictness", punch.wavestrictnesstypes)
    .name("Strictness")
    .onChange(() => {
      switch (punch.wavestrictness) {
        case "loose": {
          punch.update();
          break;
        }
        case "normal": {
          punch.update();
          break;
        }
        case "strict": {
          punch.update();
          break;
        }
      }
    });

  // PUNCH: Export
  // ------------------------------------------------

  let punchExportGUI = punchGUI.addFolder("Export").close();
  punchExportGUI.add(punch, "exportTXT").name("Export txt");
  punchExportGUI
    .add(punch, "exportSVGwithDotsOnly")
    .name("Export svg (dots only)");
  punchExportGUI
    .add(punch, "exportSVGwithCricutJoy")
    .name("Export svg (Cricut Joy)");
  // punchExportGUI.add(punch, "exportPNG").name("Export png");

  // PUNCH: Other
  // ------------------------------------------------

  if (punch.mode == "wave") {
    wallpaperGUI.hide();
  } else if (punch.mode == "wallpaper") {
    waveGUI.hide();
  }

  punchGUI
    .add(punch, "showRepeatLines")
    .name("Show repeats")
    .onChange(() => {
      punch.update();
    });

  // KNIT
  // ------------------------------------------------

  knitGUI = new lil.GUI({
    container: document.getElementById("lilgui-knit"),
    title: "Knit",
  });


  knitGUI
    .add(knit, "cellSize", 5, 50, 1)
    .name("Zoom level")
    .listen()
    .onChange(() => {
      // draw();
      knit.update();
    });

  let colorGUI = knitGUI.addFolder("Color options").close();

  colorGUI
    .addColor(parameters, "knitMainColor")
    .name("Main")
    .onChange(() => {
      pattern.update();
    })
    .listen();
  colorGUI
    .addColor(parameters, "knitBackColor")
    .name("Second")
    .onChange(() => {
      pattern.update();
    })
    .listen();

  colorGUI.add(knit, "swapColors").name("Swap colors");
  colorGUI.add(knit, "randomNiceColors").name("Random nice colors");
  colorGUI.add(knit, "brightenBackground").name("Brighten background");
  colorGUI.add(knit, "darkenBackground").name("Darken background");

  knitGUI.add(knit, "feelingLucky").name("I’m feeling lucky!");

  knitGUI.add(knit, "floatString").name("Largest float: ").listen().disable();

  // Messages.
  // ------------------------------------------------

  messageBoxDIV = select("#messagebox");
  messageListDIV = select("#messagelist");

  // GENERAL
  // ------------------------------------------------

  GUIS = [patternGUI, punchGUI, knitGUI];

  // Add EventListener to titles for updating URL.
  document.querySelectorAll(".lil-gui.root > .title").forEach((el) =>
    el.addEventListener("click", (e) => {
      updateURL();
    })
  );

  select("#togglemessages").elt.addEventListener("click", (e) => {
    messageBoxDIV.hide();
  });
  if (
    parametersFromURL.gui !== undefined &&
    parametersFromURL.gui.length === 3
  ) {
    parametersFromURL.gui
      .split("")
      .forEach((character, index) =>
        character == 0 ? GUIS[index].close() : GUIS[index].open()
      );
  }

  // Listen.

  GUIS.forEach((G) => {
    if (verbose) console.log(G);
    G.domElement.addEventListener("keydown", (e) => {
      if (e.target.type !== "number") keyPressed();
    });
  });

  let clipboard = new ClipboardJS(".clipboard");

  clipboard.on("success", function (e) {
    if (verbose) console.info("Action:", e.action);
    if (verbose) console.info("Text:", e.text);
    if (verbose) console.info("Trigger:", e.trigger);
    let tooltip = e.trigger.querySelector(".ourtooltip");
    tooltip.classList.add("opacity-100");
    setTimeout(() => tooltip.classList.remove("opacity-100"), 5000);
  });
}

function addMessage(id, str) {
  messages[id] = str;
}

function deleteMessage(id) {
  delete messages[id];
}

function showMessages() {
  messageListDIV.elt.innerHTML = "";
  let ids = Object.keys(messages);
  if (ids.length > 0) {
    messageBoxDIV.show();
    ids.forEach((id) => {
      messageListDIV.elt.innerHTML +=
        "<div class='message'>" + messages[id] + "</div>";
    });
  } else {
    messageBoxDIV.hide();
  }
}
