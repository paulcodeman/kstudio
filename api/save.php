<?php
$code = $_POST['CODE'] ?? '';
$name = $_POST['NAME'] ?? 'app';
if (!$code) {
    http_response_code(400);
    echo 'No code provided';
    exit;
}

$SRC_DIR = __DIR__ . '/../build/src';
if (!file_exists($SRC_DIR)) mkdir($SRC_DIR, 0777, true);

$file = $SRC_DIR . '/' . basename($name) . '.c';
file_put_contents($file, $code);
echo json_encode(['status' => 'ok', 'file' => $file]);