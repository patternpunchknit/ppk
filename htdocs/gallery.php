<?php

// Get URL parameters
$page = $_GET['page'] ?? '0';
$page = (int) $page;

// Get password parameter
$password = $_GET['password'] ?? '';

// Check if password is correct. If so, give superpowers.
$superpowers = ($password === 'superpowers');

$db = new SQLite3('db/database.db');
$query = $db->query("SELECT * FROM urls");
$rows = [];
while ($row = $query->fetchArray()) {
      // if (!preg_match('/&pattern=011111101101110101111001100011111111&mode=wallpaper&across=repeat&up=repeat&/', $row['longurl'])) {
      //   $rows[] = $row;
      // }
      $rows[] = $row;
}
$rows = array_reverse($rows);

// Designs per page
$per_page = 24;

// Total pages
$total_pages = ceil(count($rows) / $per_page);

// Limit to 20 per page
$rows = array_slice($rows, $page * $per_page, $per_page);
?>

<!DOCTYPE html>
<html>

<head>
      <meta charset="utf-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <meta name="author" content="Roger Antonsen and Laura Taalman">

      <meta property="og:title" content="Pattern Punch Knit" />
      <meta property="og:description" content="Pattern Punch Knit is an app for designing and previewing punch cards for knitting machines. Our algorithms use mathematics to generate 24-stitch punch cards from small patterns. You design the pattern and choose the settings, and the app creates a punch card and a knit preview of your design." />
      <meta property="og:type" content="website" />
      <meta property="og:image" content="ppk-1200x630.png" />

      <meta name="twitter:card" content="summary_large_image">
      <meta name="twitter:site" content="@rantonsebot">
      <meta name="twitter:creator" content="@rantonsebot">
      <meta name="twitter:title" content="Pattern Punch Knit">
      <meta name="twitter:description" content="Pattern Punch Knit is an app for designing and previewing punch cards for knitting machines. Our algorithms use mathematics to generate 24-stitch punch cards from small patterns. You design the pattern and choose the settings, and the app creates a punch card and a knit preview of your design.">
      <meta name="twitter:image" content="ppk-1200x630.png">

      <link rel="apple-touch-icon" sizes="180x180" href="favicon/apple-touch-icon.png">
      <link rel="icon" type="image/png" sizes="32x32" href="favicon/favicon-32x32.png">
      <link rel="icon" type="image/png" sizes="16x16" href="favicon/favicon-16x16.png">
      <link rel="manifest" href="favicon/site.webmanifest">
      <link rel="mask-icon" href="favicon/safari-pinned-tab.svg" color="#000000">
      <link rel="shortcut icon" href="favicon/favicon.ico">
      <meta name="msapplication-TileColor" content="#ffffff">
      <meta name="msapplication-config" content="favicon/browserconfig.xml">
      <meta name="theme-color" content="#ffffff">

      <link href="css/styles.css" rel="stylesheet" type="text/css">
</head>

<body class="flex flex-col w-screen bg-gray-100">

      <!-- Top bar -->
      <div class="flex overflow-visible relative flex-col gap-2 items-center p-4 h-32 md:flex-row md:p-8 nodebug">

            <!-- Title -->
            <div class="inline items-end nodebug">
                  <h1 class="text-xl font-black text-gray-600 whitespace-nowrap sm:text-2xl md:text-4xl xl:text-6xl font-fun">
                        <a href=".">Pattern Punch Knit <span class="text-red-800 font-fun">Gallery</span></a>
                  </h1>
            </div>

            <div class="mx-4 text-xs">This is a beta version of a public gallery of designs that users have created.</div>
      </div>

      <div class="flex flex-wrap gap-4 justify-center items-center w-full border">
            <?php if ($page > 0) : ?>
                  <a href="/gallery.php?page=<?= $page - 1 ?>">Previous</a>
            <?php else : ?>
                  <span class="p-2 font-bold text-slate-300">Previous</span>
            <?php endif; ?>

            <!-- Create a link per page -->
            <?php for ($i = 0; $i < $total_pages; $i++) : ?>
                  <!-- Highlight the current page -->
                  <?php if ($i == $page) : ?>
                        <span class="p-2 font-bold bg-slate-300"><?= $i ?></span>
                  <?php else : ?>
                        <a href="/gallery.php?page=<?= $i ?>"><?= $i ?></a>
                  <?php endif; ?>
            <?php endfor; ?>

            <?php if ($page > 0 && $page < $total_pages - 1) : ?>
                  <a href="/gallery.php?page=<?= $page + 1 ?>">Next</a>
            <?php else : ?>
                  <span class="p-2 font-bold text-slate-300">Next</span>
            <?php endif; ?>
      </div>

      <div class="grid grid-cols-2 gap-2 p-4 w-full h-full md:grid-cols-4" x-data="{ test: true }">
            <?php foreach ($rows as $row) : ?>
                  <div id="<?= $row['shorturl'] ?>" class="relative database-item">
                        <a class="" href="<?= $row['shorturl'] ?>"><img src="/dbimg/<?= $row['time'] ?>.g.png" alt=""></a>
                        <?php if ($superpowers) : ?>
                              <div @click="removeFromGallery" class="bg-white transform closeme hover:scale-105">
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="-6 -6 24 24" width="24" fill="currentColor">
                                          <path d="M7.314 5.9l3.535-3.536A1 1 0 1 0 9.435.95L5.899 4.485 2.364.95A1 1 0 1 0 .95 2.364l3.535 3.535L.95 9.435a1 1 0 1 0 1.414 1.414l3.535-3.535 3.536 3.535a1 1 0 1 0 1.414-1.414L7.314 5.899z"></path>
                                    </svg>
                              </div>
                        <?php endif; ?>
                  </div>
            <?php endforeach; ?>
      </div>

      <div class="flex flex-wrap gap-4 justify-center items-center mb-8 w-full border">
            <?php if ($page > 0) : ?>
                  <a href="/gallery.php?page=<?= $page - 1 ?>">Previous</a>
            <?php else : ?>
                  <span class="p-2 font-bold text-slate-300">Previous</span>
            <?php endif; ?>

            <!-- Create a link per page -->
            <?php for ($i = 0; $i < $total_pages; $i++) : ?>
                  <!-- Highlight the current page -->
                  <?php if ($i == $page) : ?>
                        <span class="p-2 font-bold bg-slate-300"><?= $i ?></span>
                  <?php else : ?>
                        <a href="/gallery.php?page=<?= $i ?>"><?= $i ?></a>
                  <?php endif; ?>
            <?php endfor; ?>

            <?php if ($page > 0 && $page < $total_pages - 1) : ?>
                  <a href="/gallery.php?page=<?= $page + 1 ?>">Next</a>
            <?php else : ?>
                  <span class="p-2 font-bold text-slate-300">Next</span>
            <?php endif; ?>
      </div>

</body>

</html>