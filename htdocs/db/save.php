<?php


// Helper functions.
include 'functions.php';

// Generate Random String.
function generateRandomString($length = 6)
{
  // 62^6 = 56 800 235 584 // 62^8 = 218 340 105 584 896
  $characters = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
  $charactersLength = strlen($characters);
  $randomString = '';
  for ($i = 0; $i < $length; $i++) {
    $randomString .= $characters[rand(0, $charactersLength - 1)];
  }
  return $randomString;
}

// Get data via POST.
$data = json_decode(file_get_contents("php://input"));
$imagedata = $data->imagedata;
$galleryimagedata = $data->galleryimagedata;
$shorturl = generateRandomString();
$longurl = $data->longurl;
$longurlreduced = preg_replace('/&gui=[01]{3}/i', '', $longurl);

$time =  microtime(true) * 10000;

// Connect to database.
$db = new SQLite3($_SERVER['DOCUMENT_ROOT'] . '/db/database.db');

// Make sure urls table exists.
$db->query('CREATE TABLE IF NOT EXISTS "urls" (
  "id" INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
  "shorturl" TEXT,
  "longurl" TEXT,
  "time" DATETIME
)');

// Check if we already have done this pattern.
if ($row = $db->query("SELECT * FROM urls WHERE longurl LIKE '$longurlreduced%'")->fetchArray()) {
  echo json_encode(['shorturl' => $row['shorturl'], 'longurl' => $row['longurl'], 'time' => $row['time']]);
  return;
}

// Get the image data.
if (preg_match('/^data:image\/(\w+);base64,/', $imagedata, $imagedatatype)) {
  $imagedata = substr($imagedata, strpos($imagedata, ',') + 1);
  $imagedatatype = strtolower($imagedatatype[1]);
  if (!in_array($imagedatatype, ['jpg', 'jpeg', 'gif', 'png'])) {
    throw new \Exception('invalid image type');
  }
  $imagedata = str_replace(' ', '+', $imagedata);
  $imagedata = base64_decode($imagedata);
  if ($imagedata === false) {
    throw new \Exception('base64_decode failed');
  }
} else {
  throw new \Exception('did not match image URI with image');
}

// Get the gallery image data.
if (preg_match('/^data:image\/(\w+);base64,/', $galleryimagedata, $galleryimagedatatype)) {
  $galleryimagedata = substr($galleryimagedata, strpos($galleryimagedata, ',') + 1);
  $galleryimagedatatype = strtolower($galleryimagedatatype[1]);
  if (!in_array($galleryimagedatatype, ['jpg', 'jpeg', 'gif', 'png'])) {
    throw new \Exception('invalid image type');
  }
  $galleryimagedata = str_replace(' ', '+', $galleryimagedata);
  $galleryimagedata = base64_decode($galleryimagedata);
  if ($galleryimagedata === false) {
    throw new \Exception('base64_decode failed');
  }
} else {
  throw new \Exception('did not match image URI with image');
}

// Check if image folder exists.
if (!file_exists($_SERVER['DOCUMENT_ROOT'] . "/dbimg")) {
  mkdir($_SERVER['DOCUMENT_ROOT'] . "/dbimg", 0777, true);
}

// Define image file name and save to server.
$imagefilename = $time . '.' . $imagedatatype;
$longimagefilename = $_SERVER['DOCUMENT_ROOT'] . "/dbimg/" . $imagefilename;
file_put_contents($longimagefilename, $imagedata);

// Create smaller image.
$smallerimagedata = imagecreatetruecolor(600, 450);
imagecopyresampled($smallerimagedata, imagecreatefrompng($longimagefilename), 0, 0, 0, 0, 600, 450, 1600, 1200);
imagepng($smallerimagedata,  $_SERVER['DOCUMENT_ROOT'] . "/dbimg/" . $time . '.t.png', 9);

// Define gallery image file name and save to server.
$galleryimagefilename = $time . '.g.' . $galleryimagedatatype;
$longgalleryimagefilename = $_SERVER['DOCUMENT_ROOT'] . "/dbimg/" . $galleryimagefilename;
file_put_contents($longgalleryimagefilename, $galleryimagedata);

// // Create smaller image.
// $smallergalleryimagedata = imagecreatetruecolor(600, 450);
// imagecopyresampled($smallergalleryimagedata, imagecreatefrompng($longgalleryimagefilename), 0, 0, 0, 0, 600, 450, 600, 450);
// imagepng($smallergalleryimagedata,  $_SERVER['DOCUMENT_ROOT'] . "/dbimg/" . $time . '.g.test.png', 9);

// Add row to database.
$db->query("INSERT INTO urls (shorturl, longurl, time) VALUES ('$shorturl', '$longurl', '$time');");

// Return JSON.
header("Content-Type: application/json");
echo json_encode(['shorturl' => $shorturl, 'longurl' => $longurl, 'time' =>  strval($time)]);
