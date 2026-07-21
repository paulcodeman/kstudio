<?php
$user = $_GET['usr'] ?? '';
if (!$user) {
    http_response_code(400);
    exit;
}

$input = file_get_contents('php://input');
if ($input === false || $input === '') {
    http_response_code(400);
    exit;
}

file_put_contents($user . '/example', $input);
echo 'ok';