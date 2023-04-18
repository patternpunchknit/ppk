function updateURL() {
  if (verbose) console.log("updateURL");
  if (history.pushState) {
    let url;
    url = window.location.protocol + "//" + window.location.host; //  window.location.pathname
    url += "?";
    url += getStringDescription();
    url += window.location.hash;
    if (verbose) console.log(url);

    window.history.pushState(
      {
        path: url,
      },
      "",
      url
    );
  }
}

function getStringDescription() {
  // Define result.
  let result = "";

  // Pattern.
  result += "rows=" + pattern.rows;
  result += "&cols=" + pattern.cols;
  result += "&pattern=" + pattern.toString();

  // Punch.
  result += "&mode=" + punch.mode;
  if (punch.mode == "wallpaper") {
    result += "&across=" + punch.wallpaperacross;
    result += "&up=" + punch.wallpaperup;
  }
  if (punch.mode == "wave") {
    result += "&seed=" + punch.wave.seed;
    result += "&strictness=" + punch.wavestrictness;
  }
  if (punch.xshift !== 0) {
    result += "&x=" + punch.xshift;
  }
  if (punch.yshift !== 0) {
    result += "&y=" + punch.yshift;
  }

  // Knit.
  // result += "&shape=" + knit.shape;
  result += "&main=" + parameters.knitMainColor.replace("#", "");
  result += "&back=" + parameters.knitBackColor.replace("#", "");
  result += "&zoom=" + knit.cellSize;

  // GUI.
  result += "&gui=" + GUIS.map((g) => (g._closed ? 0 : 1)).join("");

  // Return result.
  return result;
}

async function setParametersFromURL(urlString = location.href) {
  if (verbose) console.log("setParametersFromURL():");
  let url = decodeURI(urlString);
  if (verbose) console.log("url = " + url);
  let parts = split(url, "?");
  let code = parts[0].split("/").pop();

  // Reset parametersFromURL.
  parametersFromURL = undefined;

  // Check if short url is in database. If so, go with long URL found.
  if (code != "") {
    if (verbose) console.log(" we have a code. checking with db.");
    await fetch("db/load.php", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({ shorturl: code }),
    })
      .then((response) => {
        return response.json();
      })
      .then((result) => {
        if (result !== undefined) {
          parametersFromURL = getParametersFromString(result.longurl);
        } else {
          throw new Error("Meh.");
        }
      })
      .catch((error) => {
        if (verbose) console.log(error);
      });
  }

  // If we are here and parametersFromURL is not set, find other options.
  if (parametersFromURL == undefined) {
    if (verbose) console.log(" parametersFromURL == undefined, so setting it");
    if (parts.length > 1) {
      parametersFromURL = getParametersFromString(parts[1]);
      if (verbose) console.log(parametersFromURL);
    } else {
      parametersFromURL = getParametersFromString("");
      if (verbose) console.log(parametersFromURL);
    }
  }
}

function getParametersFromString(inputString) {
  if (verbose) console.log("getParametersFromString: " + inputString);
  // Define parameters.
  let parameters = {};

  // Split up parts of URL.
  for (let p of split(inputString, "&")) {
    // Define left and right side of =.
    let parts = split(p, "=");
    parameters[parts[0]] = parts[1];
  }

  // Pattern dimensions. For backwards compatibility.
  if (parameters["dims"] !== undefined) {
    let parts = split(parameters["dims"], "x");
    if (parts.length == 2) {
      parameters["rows"] = parts[0];
      parameters["cols"] = parts[1];
    }
  }

  // Return.
  return parameters;
}

function getStringFromParameters(name, defaultValue, allowedValues) {
  if (parametersFromURL[name] == undefined) return defaultValue;
  if (
    allowedValues instanceof RegExp &&
    allowedValues.test(parametersFromURL[name])
  )
    return parametersFromURL[name];
  if (
    Array.isArray(allowedValues) &&
    allowedValues.includes(parametersFromURL[name])
  )
    return parametersFromURL[name];
  return defaultValue;
}

function getIntFromParameters(name, defaultValue, minimumValue, maximumValue) {
  if (parametersFromURL[name] == undefined) return defaultValue;
  let parsedValue = int(parametersFromURL[name]);
  if (typeof parsedValue !== "number") return defaultValue;
  if (minimumValue !== undefined) parsedValue = max(parsedValue, minimumValue);
  if (maximumValue !== undefined) parsedValue = min(parsedValue, maximumValue);
  return parsedValue;
}
