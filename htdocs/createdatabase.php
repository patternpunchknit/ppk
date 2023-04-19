<?php

// Connect to database.
$db = new SQLite3($_SERVER['DOCUMENT_ROOT'] . '/db/database.db');

// Make sure urls table exists.
$db->query('CREATE TABLE IF NOT EXISTS "urls" (
  "id" INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
  "shorturl" TEXT,
  "longurl" TEXT,
  "time" DATETIME
)');

?>

<p>Done.</p>