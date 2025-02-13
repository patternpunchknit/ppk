<?php

// Get string.
$str = $_SERVER['REQUEST_URI'];

// Check if the string is "callback".
if (preg_match('/^\/callback/', $str)) {
  // // Redirect to the callback page.
  $callbacktag = "callback";
} else {
  $callbacktag = "";
}

// Default OG image.
$ogimage = (isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] === 'on' ? "https" : "http") . "://$_SERVER[HTTP_HOST]" . "/" . "ppk-1200x630.png";

// Check the string. Change $ogimage if there is a database hit.
//if (preg_match('/^\/[a-zA-Z0-9]{6}/', $str)) {
//  $shorturl = substr($str, 1, 6);
//  $db = new SQLite3('db/database.db');
//  $query = $db->query("SELECT * FROM urls WHERE shorturl = '$shorturl'");;
//  if ($row = $query->fetchArray()) {
//    $ogimage = (isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] === 'on' ? "https" : "http") . "://$_SERVER[HTTP_HOST]" . "/dbimg/" . $row['time'] . ".png";
//  }
//} else if (preg_match('/^\/?/', $str)) {
//  $longurl = substr($str, 2);
//  $db = new SQLite3('db/database.db');
//  $query = $db->query("SELECT * FROM urls WHERE longurl = '$longurl'");;
//  if ($row = $query->fetchArray()) {
//    $ogimage = (isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] === 'on' ? "https" : "http") . "://$_SERVER[HTTP_HOST]" . "/dbimg/" . $row['time'] . ".png";
//  }
//}
?>

<!DOCTYPE html>
<html class="<?= $callbacktag ?>">

<head>
  <!-- Basics -->
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1">

  <!-- Author and title -->
  <meta name="author" content="Roger Antonsen and Laura Taalman">
  <title>Pattern Punch Knit</title>

  <!-- Open graph properties -->
  <meta property="og:title" content="Pattern Punch Knit" />
  <meta property="og:description" content="Pattern Punch Knit is an app for designing and previewing punch cards for knitting machines. Our algorithms use mathematics to generate 24-stitch punch cards from small patterns. You design the pattern and choose the settings, and the app creates a punch card and a knit preview of your design." />
  <meta property="og:type" content="website" />
  <meta property="og:image" content="<?= $ogimage ?>" />
  <meta property="og:url" content="<?= $ogurl ?>" />

  <!-- Twitter card -->
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:site" content="@rantonsebot">
  <meta name="twitter:creator" content="@rantonsebot">
  <meta name="twitter:title" content="Pattern Punch Knit">
  <meta name="twitter:description" content="Pattern Punch Knit is an app for designing and previewing punch cards for knitting machines. Our algorithms use mathematics to generate 24-stitch punch cards from small patterns. You design the pattern and choose the settings, and the app creates a punch card and a knit preview of your design.">
  <meta name="twitter:image" content="<?= $ogimage ?>">

  <!-- Favicon -->
  <link rel="apple-touch-icon" sizes="180x180" href="favicon/apple-touch-icon.png">
  <link rel="icon" type="image/png" sizes="32x32" href="favicon/favicon-32x32.png">
  <link rel="icon" type="image/png" sizes="16x16" href="favicon/favicon-16x16.png">
  <link rel="manifest" href="favicon/site.webmanifest">
  <link rel="mask-icon" href="favicon/safari-pinned-tab.svg" color="#000000">
  <link rel="shortcut icon" href="favicon/favicon.ico">
  <meta name="msapplication-TileColor" content="#ffffff">
  <meta name="msapplication-config" content="favicon/browserconfig.xml">
  <meta name="theme-color" content="#ffffff">

  <!-- JS -->
  <script defer src="js/p5.js"></script>
  <script defer src="js/alpine.js"></script>
  <script defer src="js/lilgui.js"></script>
  <script defer src="js/clipboard.js"></script>
  <script defer src="js/app.js?t=20230418"></script>

  <!-- CSS -->
  <link href="css/styles.css?t=20230418" rel="stylesheet" type="text/css">
</head>


<body class="flex flex-col bg-gray-100 w-screen h-[var(--maxvh)] overflow-hidden" x-data="{ isInfoBoxOpen: !true, isSharingBoxOpen: !true, isMenuShowing: !true, isLoginBoxOpen: !true, tab: 'knit', isTooNarrow: window.innerWidth < 1024 }" x-on:resize.window="isTooNarrow = window.innerWidth < 1024" @keydown.escape="isInfoBoxOpen = false; isSharingBoxOpen = false, isLoginBoxOpen = false">

  <!-- Top bar -->
  <div class="flex overflow-visible relative flex-col gap-2 justify-between items-center p-4 h-32 md:flex-row md:p-8">

    <!-- Title -->
    <div class="inline gap-6 items-end n">
      <h1 class="text-4xl font-black text-gray-600 whitespace-nowrap md:text-4xl lg:text-6xl font-fun">
        <a class="maintitle" href=".">Pattern Punch Knit</a>
      </h1>
    </div>

    <!-- Buttons -->
    <div :class="{ '' : isTooNarrow }" class="flex overflow-visible flex-row gap-2 scale-75 md:transform-none lg:gap-4">

      <!-- feelingLucky -->

      <button @click="knit.feelingLucky();" title="I’m feeling lucky!" class="our-round-button">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="-5 -2 24 24" width="24" fill="currentColor">
          <path d="M6 2v5.938l-1.142.542a5 5 0 1 0 4.284 0L8 7.938V2H6zM4 6.674V0h6v6.674a7 7 0 1 1-6 0zM3.535 11h6.93a4 4 0 1 1-6.93 0zM4 0h6a1 1 0 0 1 0 2H4a1 1 0 1 1 0-2z"></path>
        </svg>
      </button>

      <!-- feelingSpicy -->

      <button @click="knit.feelingSpicy();" title="I’m feeling spicy!" class="our-round-button">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="-2 -2 24 24" width="24" fill="currentColor">
          <path d="M16,0 C18.209139,0 20,1.790861 20,4 L20,16 C20,18.209139 18.209139,20 16,20 L4,20 C1.790861,20 0,18.209139 0,16 L0,4 C0,1.790861 1.790861,0 4,0 L16,0 Z M16,2 L4,2 C2.9456382,2 2.08183488,2.81587779 2.00548574,3.85073766 L2,4 L2,16 C2,17.0543618 2.81587779,17.9181651 3.85073766,17.9945143 L4,18 L16,18 C17.0543618,18 17.9181651,17.1841222 17.9945143,16.1492623 L18,16 L18,4 C18,2.9456382 17.1841222,2.08183488 16.1492623,2.00548574 L16,2 Z M15,13 C16.1045695,13 17,13.8954305 17,15 C17,16.1045695 16.1045695,17 15,17 C13.8954305,17 13,16.1045695 13,15 C13,13.8954305 13.8954305,13 15,13 Z M10,8 C11.1045695,8 12,8.8954305 12,10 C12,11.1045695 11.1045695,12 10,12 C8.8954305,12 8,11.1045695 8,10 C8,8.8954305 8.8954305,8 10,8 Z M5,3 C6.1045695,3 7,3.8954305 7,5 C7,6.1045695 6.1045695,7 5,7 C3.8954305,7 3,6.1045695 3,5 C3,3.8954305 3.8954305,3 5,3 Z"></path>
        </svg>
      </button>

      <!-- Sharing -->

      <button id="sharingbutton" title="Download or Share your Pattern" @click="isSharingBoxOpen = !isSharingBoxOpen; share();" class="our-round-button">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="-2 -2 24 24" width="24" fill="currentColor">
          <path d="M16 6a2 2 0 1 0 0-4 2 2 0 0 0 0 4zM7.928 9.24a4.02 4.02 0 0 1-.026 1.644l5.04 2.537a4 4 0 1 1-.867 1.803l-5.09-2.562a4 4 0 1 1 .083-5.228l5.036-2.522a4 4 0 1 1 .929 1.772L7.928 9.24zM4 12a2 2 0 1 0 0-4 2 2 0 0 0 0 4zm12 6a2 2 0 1 0 0-4 2 2 0 0 0 0 4z"></path>
        </svg>
      </button>

      <!-- Gallery -->

      <a title="Gallery" href="gallery.php" class="our-round-button">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="-2 -2 24 24" width="24" fill="currentColor">
          <path d="M2 2v4h4V2H2zm0-2h4a2 2 0 0 1 2 2v4a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V2a2 2 0 0 1 2-2zm12 0h4a2 2 0 0 1 2 2v4a2 2 0 0 1-2 2h-4a2 2 0 0 1-2-2V2a2 2 0 0 1 2-2zm0 2v4h4V2h-4zm0 10h4a2 2 0 0 1 2 2v4a2 2 0 0 1-2 2h-4a2 2 0 0 1-2-2v-4a2 2 0 0 1 2-2zm0 2v4h4v-4h-4zM2 12h4a2 2 0 0 1 2 2v4a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2v-4a2 2 0 0 1 2-2zm0 2v4h4v-4H2z"></path>
        </svg>
      </a>

      <!-- Info -->

      <button title="About Pattern Punch Knit" id="infobutton" @click="isInfoBoxOpen = !isInfoBoxOpen" class="our-round-button lg:text-xl">i</button>

    </div>
  </div>

  <!-- Tabs. Show on mobile. -->
  <nav x-show="isTooNarrow" class="px-8 ourtabs">
    <button :class="{ 'activetab': isMenuShowing }" @click.prevent="isMenuShowing = !isMenuShowing;" class="">Menu</button> <!-- window.location.hash = 'menu' -->
    <button :class="{ 'activetab': tab === 'pattern' }" @click.prevent="tab = 'pattern'; $nextTick(() => { pattern.update(); });" class="">Pattern</button> <!-- window.location.hash = 'pattern' -->
    <button :class="{ 'activetab': tab === 'punch' }" @click.prevent="tab = 'punch'; $nextTick(() => { punch.update(); });" class="">Punch</button> <!-- window.location.hash = 'punch' -->
    <button :class="{ 'activetab': tab === 'knit' }" @click.prevent="tab = 'knit'; $nextTick(() => { knit.update(); });" class="">Knit</button> <!-- window.location.hash = 'knit' -->
  </nav>

  <!-- Everything below top bar -->
  <div class="flex overflow-hidden relative flex-row p-8 h-full sm:px-8 lg:gap-6">

    <!-- GUIs -->
    <div x-cloak :class="isTooNarrow ? 'absolute' : 'relative'" x-show="!isTooNarrow || tab === 'menu' || isMenuShowing" class="overflow-y-auto z-20 flex-shrink-0 no-scrollbar sm:ml-0 lg:relative">
      <div class="">
        <div class="hidden absolute left-0 -top-6 font-mono text-xs text-gray-400 lg:block">Menu</div>
        <div :class="isTooNarrow ? '' : ''" class="flex relative flex-col flex-shrink-0 gap-8 h-full">
          <div id="lilgui-top" class="border-black shadow-lg border-1 shadow-gray-700"></div>
          <div id="lilgui-pattern" class="border-black shadow-lg border-1 shadow-gray-700"></div>
          <div id="lilgui-punch" class="border-black shadow-lg border-1 shadow-gray-700"></div>
          <div id="lilgui-knit" class="border-black shadow-lg border-1 shadow-gray-700"></div>
        </div>
      </div>
    </div>

    <!-- Pattern -->
    <div x-show="tab === 'pattern' " :class="{ 'flex flex-col': tab === 'pattern' || !isTooNarrow }" class="w-full lg:max-w-[270px] lg:min-h-[270px] flex-shrink-0 overflow-visible relative">
      <div class="hidden absolute left-0 -top-6 font-mono text-xs text-gray-400 lg:block">Pattern <span id="patterninfo"></span></div>
      <div class="flex overflow-hidden flex-grow justify-center">
        <div id="pattern" class="flex overflow-hidden flex-grow justify-center"></div>
      </div>
    </div>

    <!-- Punch -->
    <div x-show="tab === 'punch' " :class="{ 'flex flex-col': tab === 'punch' || !isTooNarrow }" class="flex overflow-y-visible relative flex-shrink-0 justify-start items-center w-full lg:w-auto n">
      <div class="hidden absolute left-0 -top-6 font-mono text-xs text-gray-400 lg:block">Punch <span id="punchinfo"></span></div>
      <div class="overflow-y-auto no-scrollbar">
        <div class="scale-75 punchsize:transform-none relative w-[350px] h-[803.333px]">
          <img class="w-[350px] absolute top-0" src="svg/card.svg" alt="">
          <div id="punch" class="absolute top-[28px] left-[40px] w-[269px] overflow-hidden"></div>
        </div>
      </div>
    </div>

    <!-- Knit -->
    <div x-show="tab === 'knit' " :class="{ 'flex flex-col': tab === 'knit' || !isTooNarrow }" class="w-full lg:w-[270px] min-h-[270px] relative flex-grow overflow-visible n">
      <div class="hidden absolute left-0 -top-6 font-mono text-xs text-gray-400 lg:block">Knit <span id="knitinfo"></span></div>
      <div id="knit" class="overflow-hidden flex-grow"></div>
    </div>

    <!-- Message box -->
    <div :class="isTooNarrow ? 'hidden' : 'bottom-4'" id="messagebox" style="display: none;" class="absolute sm:max-w-sm p-4 bg-white border-2 border-gray-500 shadow-lg shadow-gray-700 max-w-[calc(100vw-32px)] right-4">
      <div id="togglemessages" class="closeme">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="-6 -6 24 24" width="24" fill="currentColor">
          <path d="M7.314 5.9l3.535-3.536A1 1 0 1 0 9.435.95L5.899 4.485 2.364.95A1 1 0 1 0 .95 2.364l3.535 3.535L.95 9.435a1 1 0 1 0 1.414 1.414l3.535-3.535 3.536 3.535a1 1 0 1 0 1.414-1.414L7.314 5.899z"></path>
        </svg>
      </div>
      <div id="messagelist" class="text-sm md:text-base"></div>
    </div>

    <!-- Info Box -->
    <div x-show="isInfoBoxOpen" x-cloak>
      <div class="flex fixed top-0 left-0 z-40 justify-center items-center pb-8 w-screen h-screen bg-white bg-opacity-80 md:pb-32 md:p-8 flex-rows lg:pb-8">
        <div @click.outside="isInfoBoxOpen = false" class="text-sm md:text-lg z-50 relative max-w-screen-lg max-h-[80vh] p-4 m-4 md:m-4 overflow-y-auto no-scrollbar prose bg-white border-2 border-black">

          <div @click="isInfoBoxOpen = false" class="closeme">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="-6 -6 24 24" width="24" fill="currentColor">
              <path d="M7.314 5.9l3.535-3.536A1 1 0 1 0 9.435.95L5.899 4.485 2.364.95A1 1 0 1 0 .95 2.364l3.535 3.535L.95 9.435a1 1 0 1 0 1.414 1.414l3.535-3.535 3.536 3.535a1 1 0 1 0 1.414-1.414L7.314 5.899z"></path>
            </svg>
          </div>

          <div class="m-2 w-full text-lg italic text-center md:text-xl">Welcome to</div>
          <div class="m-2 w-full text-2xl font-black text-center maintitle md:text-4xl font-fun">Pattern Punch Knit</div>
          <div class="m-4">
            <p><span class="font-extrabold font-fun">Pattern Punch Knit</span> is an app for designing and previewing punch cards for knitting machines. Our algorithms use mathematics to generate 24-stitch punch cards from small patterns. You design the pattern and choose the settings, and the app creates a punch card and a knit preview of your design.
            </p>
          </div>

          <div class="m-4">
            <div class="w-full text-xl font-extrabold text-left font-fun">Instructions</div>
            <ol class="list-decimal list-inside">
              <li class="m-2">Create a <span class="font-extrabold font-fun">Pattern</span> by clicking in the grid on the left. Use the Pattern dropdown menu to set the size of the Pattern box or to modify the Pattern in various ways. </li>
              <li class="m-2">A 24-stitch <span class="font-extrabold font-fun">Punch</span> card will be generated from your starting Pattern, using either <a href="https://en.wikipedia.org/wiki/Wallpaper_group" target="_blank">wallpaper symmetries</a> or a <a target="_blank" href=" https://en.wikipedia.org/wiki/Wave_function_collapse">wave function collapse algorithm</a>. Use the Punch dropdown menu to choose the mode and options.</li>
              <li class="m-2">A <span class="font-extrabold font-fun">Knit</span> preview will be generated based on the Punch card. Use the Knit dropdown menu to change the style and colors so that you can preview what the resulting knit fabric would look like for different yarns.</li>
            </ol>
          </div>

          <div class="m-4">
            <div class="w-full text-xl font-extrabold text-left font-fun">Keyboard shortcuts</div>
            <ul class="list-disc list-inside">
              <li class="m-2"> <kbd>↑</kbd> <kbd>↓</kbd> <kbd>←</kbd> <kbd>→</kbd> moves the pattern around.
              </li>
              <li class="m-2"> <kbd>SHIFT</kbd> + <kbd>↑</kbd> <kbd>↓</kbd> <kbd>←</kbd> <kbd>→</kbd> shifts the punch card.
              </li>
              <li class="m-2"> <kbd>o</kbd> toggles the dropdown menus.
              <li class="m-2"> <kbd>b</kbd> toggles box view.
              <li class="m-2"> <kbd>n</kbd> <kbd>N</kbd> <kbd>m</kbd> next/previous/random wallpaper pattern.
            </ul>
          </div>

          <div class="m-4">
            <div class="w-full text-xl font-extrabold text-left font-fun">Feedback</div>
            <p>We would love to hear how you use Pattern Punch Knit and are interested in learning from your feedback and suggestions. Let us know using our <a target="_blank" href="https://forms.gle/d966o1UoBXy74Prc6">feedback form</a>.</p>
          </div>

          <div class="m-4">
            <div class="w-full text-xl font-extrabold text-left font-fun">About the math</div>
            <p>
              The “wallpaper” mode takes your Pattern as a starting tile and copies it around the Punch card in different orientations according to rules based on mathematical <a href="https://en.wikipedia.org/wiki/Wallpaper_group">wallpaper patterns</a>. You can experiment with wallpaper patterns at <a target="_blank" href="https://integral-domain.org/lwilliams/WallpaperGroups/p1.php">Lauren K. Williams’ page</a>, and read more about creating wallpaper patterns from tiles in paper on wallpaper patterns for lattice designs in the paper <a target="_blank" href="https://archive.bridgesmathart.org/2020/bridges2020-223.pdf">Wallpaper Patterns for Lattice Designs (PDF)</a>, a collaboration with <a target="_blank" href="https://en.wikipedia.org/wiki/Carolyn_Yackel">Carolyn Yackel</a>.
            </p>
            <p>
              The “wave” mode creates a library of smaller tiles from your Pattern and uses a so-called <a target="_blank" href="https://github.com/mxgmn/WaveFunctionCollapse">wave function collapse algorithm</a> to generates a 24-stich Punch card, which locally resembles parts of your Pattern. You can watch the video <a target="_blank" href="https://www.youtube.com/watch?v=2SuvO4Gi7uY">Superpositions, Sudoku, the Wave Function Collapse algorithm</a> on YouTube explaining how wave function collapse algorithms, or try it yourself in the <a target="_blank" href="https://oskarstalberg.com/game/wave/wave.html">demo by Oskar Stalberg</a>.

            </p>
          </div>

          <div class="m-4">
            <div class="w-full text-xl font-extrabold text-left font-fun">Contact</div>
            <p>This app was made by <a target="_blank" href="https://rantonse.org/">Roger Antonsen</a> (<a href="mailto:rantonse@ifi.uio.no">rantonse@ifi.uio.no</a>) and <a target="_blank" href="https://mathgrrl.com/">Laura Taalman / mathgrrl</a> (<a href="mailto:laurataalman@gmail.com">laurataalman@gmail.com</a>). The app uses the following libraries and tools: P5js, Tailwind CSS, Alpine.js, and lilGUI.
            </p>
          </div>

        </div>
      </div>
    </div>

    <!-- Sharing Box -->

    <div x-show="isSharingBoxOpen" x-cloak>
      <div class="flex fixed top-0 left-0 z-40 justify-center items-center p-8 pb-32 w-screen h-screen bg-white bg-opacity-80 flex-rows lg:pb-8">
        <div @click.outside="isSharingBoxOpen = false" class="z-50 no-scrollbar relative max-w-screen-lg max-h-[80vh] p-4 m-4 overflow-y-auto prose bg-white border-2 border-black">

          <!-- Close me -->

          <div @click="isSharingBoxOpen = false" class="closeme">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="-6 -6 24 24" width="24" fill="currentColor">
              <path d="M7.314 5.9l3.535-3.536A1 1 0 1 0 9.435.95L5.899 4.485 2.364.95A1 1 0 1 0 .95 2.364l3.535 3.535L.95 9.435a1 1 0 1 0 1.414 1.414l3.535-3.535 3.536 3.535a1 1 0 1 0 1.414-1.414L7.314 5.899z"></path>
            </svg>
          </div>

          <!-- Space around -->
          <div class="m-4">

            <!-- Title -->
            <div class="p-4 mb-4 w-full text-2xl font-extrabold text-center font-fun">Download or Share your Pattern</div>

            <!-- Row of to boxes -->
            <div class="flex flex-col gap-8 justify-center w-full bg-white lg:flex-row items-top">

              <!-- Left side -->
              <div class="flex flex-col justify-center items-center lg:w-1/2">
                <div class="">
                  This is an automatically generated 1024×768 image from your knit pattern. It is now in the <a target="_blank" class="external" href="/gallery.php">gallery</a>. You can download the file by clicking on the button below, and share your pattern in social media by using the links to the right.
                </div>
                <img id="sharingimage" class="" src="/svg/grid.svg" alt="">
                <a id="downloadimage" download class="ourbutton group">
                  <div class="px-4">Download this image</div>
                  <div class="ourbutton-rightside"><svg xmlns="http://www.w3.org/2000/svg" viewBox="-5 -5 24 24" width="24" fill="currentColor">
                      <path d="M8 6.641l1.121-1.12a1 1 0 0 1 1.415 1.413L7.707 9.763a.997.997 0 0 1-1.414 0L3.464 6.934A1 1 0 1 1 4.88 5.52L6 6.641V1a1 1 0 1 1 2 0v5.641zM1 12h12a1 1 0 0 1 0 2H1a1 1 0 0 1 0-2z"></path>
                    </svg>
                  </div>
                </a>
              </div>

              <!-- Right side -->
              <div class="flex flex-col gap-4 lg:w-1/2 justify-top">

                <!-- Direct URL to your pattern -->
                <div class="text-xl text-center">Short URL to your pattern</div>

                <button class="ourbutton group clipboard" data-clipboard-target="#shareurl">

                  <!-- Input -->

                  <input id="shareurl" class="p-2 m-2 w-full font-mono text-blue-800 rounded-md outline-none selection:bg-none hover:bg-white inner-shadow stroke-none" value="<?= $_SERVER['HTTP_HOST'] ?>">

                  <div class="relative ourbutton-rightside">

                    <!-- Icon -->

                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="-5 -2 24 24" width="24" fill="currentColor">
                      <path d="M5 2v2h4V2H5zm6 0h1a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h1a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2zm0 2a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2H2v14h10V4h-1zM4 8h6a1 1 0 0 1 0 2H4a1 1 0 1 1 0-2zm0 5h6a1 1 0 0 1 0 2H4a1 1 0 0 1 0-2z"></path>
                    </svg>

                    <!-- Tooltip -->

                    <div class="ourtooltip">
                      <span>Copied!</span>
                      <svg class="absolute left-0 top-full w-full h-2 text-black" x="0px" y="0px" viewBox="0 0 255 255" xml:space="preserve">
                        <polygon class="fill-current" points="0,0 127.5,127.5 255,0" />
                      </svg>
                    </div>
                  </div>
                </button>

                <!-- Social Media -->

                <div class="text-xl text-center">Social Media Sharing Links</div>

                <!-- Facebook -->
                <script TYtypePE="text/javascript">
                  function popup(mylink, windowname) {
                    if (!window.focus) return true;
                    var href;
                    if (typeof(mylink) == 'string') href = mylink;
                    else href = mylink.href;
                    window.open(href, windowname, 'width=400,height=200,scrollbars=yes');
                    return false;
                  }
                </script>

                <a @click.prevent="window.open($event.target.closest('a').getAttribute('href'), 'Share this on Facebook', 'width=400,height=400,scrollbars=yes')" href id="sharefacebook" draggable="false" aria-label="Share this on Facebook" title="Share this on Facebook" target="_blank" rel="noopener" class="ourbutton group">
                  <span class="p-2 m-2 icon-facebook">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="-7 -2 24 24" width="24" fill="currentColor">
                      <path d="M2.046 3.865v2.748H.032v3.36h2.014v9.986H6.18V9.974h2.775s.26-1.611.386-3.373H6.197V4.303c0-.343.45-.805.896-.805h2.254V0H6.283c-4.34 0-4.237 3.363-4.237 3.865z"></path>
                    </svg>
                  </span>
                  <div class="">Share to Facebook</div>
                  <div class="ourbutton-rightside">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="-5 -5 24 24" width="24" fill="currentColor">
                      <path d="M8 3.414v5.642a1 1 0 1 1-2 0V3.414L4.879 4.536A1 1 0 0 1 3.464 3.12L6.293.293a.997.997 0 0 1 1.414 0l2.829 2.828A1 1 0 1 1 9.12 4.536L8 3.414zM3 6a1 1 0 1 1 0 2H2v4h10V8h-1a1 1 0 0 1 0-2h1a2 2 0 0 1 2 2v4a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h1z"></path>
                    </svg>
                  </div>
                </a>

                <!-- Twitter -->

                <a href class="ourbutton group" id="sharetwitter" draggable="false" aria-label="Tweet this" title="Tweet this" target="_blank" rel="noopener">
                  <span class="p-2 m-2 icon-twitter">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="-2 -4 24 24" width="24" fill="currentColor">
                      <path d="M20 1.907a8.292 8.292 0 0 1-2.356.637A4.07 4.07 0 0 0 19.448.31a8.349 8.349 0 0 1-2.607.98A4.12 4.12 0 0 0 13.846.015c-2.266 0-4.103 1.81-4.103 4.04 0 .316.036.625.106.92A11.708 11.708 0 0 1 1.393.754a3.964 3.964 0 0 0-.554 2.03c0 1.403.724 2.64 1.824 3.363A4.151 4.151 0 0 1 .805 5.64v.05c0 1.958 1.415 3.591 3.29 3.963a4.216 4.216 0 0 1-1.08.141c-.265 0-.522-.025-.773-.075a4.098 4.098 0 0 0 3.832 2.807 8.312 8.312 0 0 1-5.095 1.727c-.332 0-.658-.02-.979-.056a11.727 11.727 0 0 0 6.289 1.818c7.547 0 11.673-6.157 11.673-11.496l-.014-.523A8.126 8.126 0 0 0 20 1.907z"></path>
                    </svg></span>
                  Share to Twitter
                  <div class="ourbutton-rightside">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="-5 -5 24 24" width="24" fill="currentColor">
                      <path d="M8 3.414v5.642a1 1 0 1 1-2 0V3.414L4.879 4.536A1 1 0 0 1 3.464 3.12L6.293.293a.997.997 0 0 1 1.414 0l2.829 2.828A1 1 0 1 1 9.12 4.536L8 3.414zM3 6a1 1 0 1 1 0 2H2v4h10V8h-1a1 1 0 0 1 0-2h1a2 2 0 0 1 2 2v4a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h1z"></path>
                    </svg>
                  </div>
                </a>

              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Login Box -->

    <div x-show="isLoginBoxOpen" x-cloak>

      <div class="flex fixed top-0 left-0 z-40 justify-center items-center pb-8 w-screen h-screen bg-white bg-opacity-80 md:pb-32 md:p-8 flex-rows lg:pb-8">
        <div @click.outside="isLoginBoxOpen = false" class="relative z-50 p-4 m-4 w-3/4 max-w-none h-3/4 text-sm bg-white border-2 border-black md:text-lg md:m-4 no-scrollbar">

          <div @click="isLoginBoxOpen = false" class="closeme">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="-6 -6 24 24" width="24" fill="currentColor">
              <path d="M7.314 5.9l3.535-3.536A1 1 0 1 0 9.435.95L5.899 4.485 2.364.95A1 1 0 1 0 .95 2.364l3.535 3.535L.95 9.435a1 1 0 1 0 1.414 1.414l3.535-3.535 3.536 3.535a1 1 0 1 0 1.414-1.414L7.314 5.899z"></path>
            </svg>
          </div>

          <div id="notloggedin">
            <div class="flex flex-col gap-8 justify-center items-center w-full h-full">
              <h2 class="text-2xl font-fun">Login</h2>
              <p class="max-w-lg text-center">
                You may log in here. Be warned: This is a demo, and your
                data may be deleted after a while.
              </p>
              <button class="button" id="login" disabled="true">Log in</button>
            </div>
          </div>

          <div id="loggedin" class="h-full" style="display: none;">

            <!-- Content -->

            <div class="flex flex-col gap-4 p-4 h-full not-prose">

              <!-- Profile -->

              <div class="flex flex-row flex-shrink-0 gap-4 items-center pb-2 h-12 border-b border-gray-500">
                <img id="picture" class="overflow-hidden w-8 h-8 rounded-full">
                <div class="">
                  Email: <span id="email">Email</span>
                </div>
              </div>

              <!-- Heading -->
              <h2 class="text-2xl text-center">Designs</h2>

              <div class="overflow-y-scroll flex-grow">

                <!-- Designs -->
                <div id="designs" class="flex overflow-y-hidden flex-col gap-4">
                </div>
              </div>

              <!-- Buttons -->

              <div class="flex flex-row flex-grow-0 flex-shrink-0 gap-4 justify-end h-12">
                <button class="button" id="savepattern">Save this pattern</button>
                <button class="button" id="logout" disabled="true">Log out</button>
              </div>
            </div>
          </div>

        </div>
      </div>

    </div>

  </div>
</body>

</html>
