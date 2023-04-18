<?php

// Helper functions.
include 'functions.php';

// Get data via POST.
$data = json_decode(file_get_contents("php://input"));
$shorturl = $data->shorturl;

// Connect to database.
$db = new SQLite3($_SERVER['DOCUMENT_ROOT'] . '/db/database.db');

// Check if short url is in database. If so, delete row.
if ($row = $db->query("SELECT * FROM urls WHERE shorturl LIKE '$shorturl'")->fetchArray()) {
  $timestamp = $row['time'];
  $longurl = $row['longurl'];
  logit("delete: " . $longurl);
  try {
    $result = $db->query("DELETE FROM urls WHERE shorturl LIKE '$shorturl';");
  } catch (Exception $e) {
    logit("  error: " . $e->getMessage());
  }

  // Delete files.
  unlink($_SERVER['DOCUMENT_ROOT'] . "/dbimg/" . $timestamp . ".png");
  unlink($_SERVER['DOCUMENT_ROOT'] . "/dbimg/" . $timestamp . ".t.png");
  unlink($_SERVER['DOCUMENT_ROOT'] . "/dbimg/" . $timestamp . ".g.png");

  // Return JSON.
  header("Content-Type: application/json");
  echo json_encode(['success' => true]);
} else {
  // Return JSON.
  header("Content-Type: application/json");
  echo json_encode(['success' => false]);
}
