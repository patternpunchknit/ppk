<?php

// Helper functions.
include 'functions.php';

$db = new SQLite3('database.db');

$json = file_get_contents("php://input");
$data = json_decode($json);
$shorturl = $data->shorturl;

$query = $db->query("SELECT * FROM urls WHERE shorturl = '$shorturl'");

// Return JSON.
header("Content-Type: application/json");

if ($row = $query->fetchArray()) {
  echo json_encode(['shorturl' => $row['shorturl'], 'longurl' => $row['longurl'], 'time' => $row['time']]);
}