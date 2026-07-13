<?php
$code = $_POST['CODE'] ?? '';
if (!$code) { http_response_code(400); echo 'No code provided'; exit; }

$source_path = md5($_SERVER["REMOTE_ADDR"]);
if (!file_exists($source_path)) mkdir($source_path, 0777, true);

file_put_contents($source_path . '/example.c', $code);
echo 'ok';
