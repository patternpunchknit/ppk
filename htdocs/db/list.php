<?php

$db = new SQLite3('database.db');
$query = $db->query("SELECT * FROM urls");
$rows = [];
while ($row = $query->fetchArray()) {
  if (true || !preg_match('/&pattern=011111101101110101111001100011111111&mode=wallpaper&across=repeat&up=repeat&/', $row['longurl'])) {
    $rows[] = ['shorturl' => $row['shorturl'], 'longurl' => $row['longurl'], 'time' => $row['time']];
  }
}

// Return JSON.
header("Content-Type: application/json");
echo json_encode($rows);
