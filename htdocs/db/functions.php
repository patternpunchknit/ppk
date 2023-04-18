<?php

// Log function.
function logit($str)
{
  $time = date('Y-m-d H:i:s', time());
  $logline = '[' . $time . '] ' . $str . "\n";
  file_put_contents("log.txt", $logline, FILE_APPEND);
}
