window.addEventListener("popstate", popFunction, false);

function popFunction(e) {
  if (verbose) console.log(" ---------------------------- popFunction");
  if (verbose) console.log(e);
  if (e.state !== null && e.state.path !== null) {
    if (verbose) console.log(" state and path is OK");
    if (verbose)
      console.log(" setting needsUpdateURL = false and calling init()");
    needsUpdateURL = false;
    init();
  }
}

async function initAndTransfer(item) {
  parametersFromURL = getParametersFromString(item.longurl);
  await init(false);
  await transfer(item);
  return "done";
}

async function initAndTransferAll(items) {
  for await (let item of items) {
    if (verbose) console.log("processing item");
    if (verbose) console.log(item);
    initAndTransfer(item);
  }
}

function transferAll() {
  if (verbose) console.log("transferAll");
  fetch("db/list.php", {
    method: "GET",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
  })
    .then((response) => {
      return response.json();
    })
    .then((result) => {
      initAndTransferAll(result);
    })
    .catch((error) => {
      if (verbose) console.log(error);
    });
  return true;
}

async function transfer(item) {
  if (verbose) console.log("transfer " + item);
  knit.shape = "stitch";
  let imagedata = knit.update(1600 / 2, 1200 / 2, true);
  let activeCellSize = knit.cellSize;
  knit.cellSize = 5;
  let galleryimagedata = knit.update(600 / 2, 450 / 2, true);
  knit.cellSize = activeCellSize;
  knit.update();
  let longurl = item.longurl.replace("shape=box", "shape=stitch");

  fetch("db/transfer.php", {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({
      shorturl: item.shorturl,
      longurl: longurl,
      time: item.time,
      imagedata: imagedata,
      galleryimagedata: galleryimagedata,
    }),
  })
    .then((response) => {
      return response.json();
    })
    .then((result) => { })
    .catch((error) => {
      if (verbose) console.log(error);
    });
}

function share() {
  // Create image as is.
  let imagedata = knit.update(1600 / 2, 1200 / 2, true);

  // Save stuff.
  let activeCellSize = knit.cellSize;

  // Set parameters.
  knit.cellSize = 5; // ((600 / 2) / (24 * 2)) / 1,25

  // Create thumbmail version.
  let galleryimagedata = knit.update(600 / 2, 450 / 2, true);

  // Reset parameters.
  knit.cellSize = activeCellSize;

  // Update.
  knit.update();

  fetch("db/save.php", {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({
      imagedata: imagedata,
      galleryimagedata: galleryimagedata,
      longurl: getStringDescription(),
    }),
  })
    .then((response) => {
      return response.json();
    })
    .then((result) => {
      if (result !== undefined) {
        let patternurl =
          window.location.protocol +
          "//" +
          window.location.host +
          "/" +
          result.shorturl;
        let imageurl =
          window.location.protocol +
          "//" +
          window.location.host +
          "/dbimg/" +
          result.time +
          ".png";

        let sharingimage = select("#sharingimage").elt;
        sharingimage.setAttribute("src", imageurl);

        let downloadimage = select("#downloadimage").elt;
        downloadimage.setAttribute("href", imageurl);

        let shareurl = select("#shareurl").elt;
        shareurl.value = patternurl;

        let shareFacebook = select("#sharefacebook").elt;
        let facebookURL =
          "https://www.facebook.com/sharer.php?u=" +
          encodeURIComponent(patternurl) +
          "&text=" +
          encodeURIComponent("See the pattern I made with Pattern Punch Knit!");
        shareFacebook.setAttribute("href", facebookURL);

        let sharetwitter = select("#sharetwitter").elt;
        let twitterURL =
          "https://twitter.com/intent/tweet?url=" +
          encodeURIComponent(patternurl) +
          "&text=" +
          encodeURIComponent("See the pattern I made with Pattern Punch Knit!");
        sharetwitter.setAttribute("href", twitterURL);
      }
    })
    .catch((error) => {
      if (verbose) console.log(error);
    });
}

function setUpViewportFix() {
  // https://aryedoveidelman.com/fixing_vh_units_on_mobile_once_and_for_all
  function updateRealViewportDimensions() {
    document.documentElement.style.setProperty(
      "--maxvh",
      window.innerHeight + "px"
    );
  }
  updateRealViewportDimensions();
  const eventTypes = [
    "scroll",
    "resize",
    "fullscreenchange",
    "fullscreenerror",
    "touchcancel",
    "touchend",
    "touchmove",
    "touchstart",
    "mozbrowserscroll",
    "mozbrowserscrollareachanged",
    "mozbrowserscrollviewchange",
    "mozbrowserresize",
    "MozScrolledAreaChanged",
    "mozbrowserresize",
    "orientationchange",
  ];
  eventTypes.forEach(function (type) {
    window.addEventListener(type, (event) => updateRealViewportDimensions());
  });
}

function downloadSVGAsText() {
  const svg = document.querySelector("#svg").querySelector("svg");
  if (verbose) console.log(svg);
  const base64doc = btoa(unescape(encodeURIComponent(svg.outerHTML)));
  if (verbose) console.log(base64doc);
  const a = document.createElement("a");
  const e = new MouseEvent("click");
  a.download = "download.svg";
  a.href = "data:image/svg+xml;base64," + base64doc;
  a.dispatchEvent(e);
}
