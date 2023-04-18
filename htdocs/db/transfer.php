<?php

// Get data via POST.
$data = json_decode(file_get_contents("php://input"));
$shorturl = $data->shorturl;
$longurl = $data->longurl;
$time = $data->time;
$imagedata = $data->imagedata;
$galleryimagedata = $data->galleryimagedata;

// Connect to database.
$db = new SQLite3($_SERVER['DOCUMENT_ROOT'] . '/db/database-new.db');

// Make sure urls table exists.
$db->query('CREATE TABLE IF NOT EXISTS "urls" (
  "id" INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
  "shorturl" TEXT,
  "longurl" TEXT,
  "time" DATETIME
)');

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
if (!file_exists($_SERVER['DOCUMENT_ROOT'] . "/dbimg-new")) {
  mkdir($_SERVER['DOCUMENT_ROOT'] . "/dbimg-new", 0777, true);
}

// Define image file name and save to server.
$imagefilename = $time . '.' . $imagedatatype;
$longimagefilename = $_SERVER['DOCUMENT_ROOT'] . "/dbimg-new/" . $imagefilename;
file_put_contents($longimagefilename, $imagedata);

// Create smaller image.
$smallerimagedata = imagecreatetruecolor(600, 450);
imagecopyresampled($smallerimagedata, imagecreatefrompng($longimagefilename), 0, 0, 0, 0, 600, 450, 1600, 1200);
imagepng($smallerimagedata,  $_SERVER['DOCUMENT_ROOT'] . "/dbimg-new/" . $time . '.t.png', 9);

// Define gallery image file name and save to server.
$galleryimagefilename = $time . '.g.' . $galleryimagedatatype;
$longgalleryimagefilename = $_SERVER['DOCUMENT_ROOT'] . "/dbimg-new/" . $galleryimagefilename;
file_put_contents($longgalleryimagefilename, $galleryimagedata);

// // Create smaller image.
// $smallergalleryimagedata = imagecreatetruecolor(600, 450);
// imagecopyresampled($smallergalleryimagedata, imagecreatefrompng($longgalleryimagefilename), 0, 0, 0, 0, 600, 450, 600, 450);
// imagepng($smallergalleryimagedata,  $_SERVER['DOCUMENT_ROOT'] . "/dbimg-new/" . $time . '.g.test.png', 9);

// Add row to database.
$db->query("INSERT INTO urls (shorturl, longurl, time) VALUES ('$shorturl', '$longurl', '$time');");

// Return JSON.
header("Content-Type: application/json");
echo json_encode(['shorturl' => $shorturl, 'longurl' => $longurl, 'time' => $time]);
