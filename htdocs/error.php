<!DOCTYPE html>

<html lang="en">

<head>
  <meta charset="utf-8" />
  <style>
  * {
    box-sizing: border-box;
  }

  html,
  body {
    background-color: white;
    padding: 0;
    margin: 0;
    width: 100%;
    height: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
  }

  .title {
    text-align: center;
    display: block;
    color: black;
    font-size: xx-large;
    font-family: "Courier New", Courier, monospace;
  }

  a {
    color: black;
  }
  </style>
</head>

<body>
  <div class="title">
    <?php $url = (isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] === 'on' ? "https" : "http") . "://" . $_SERVER['HTTP_HOST']; ?>

    <div><a href="<?= $url ?>"><?= $url ?></a></div>
  </div>
</body>

</html>