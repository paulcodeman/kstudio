<?php
require_once 'init.php';
$user = get_user_dir();
$file = $user . '/example';
if (file_exists($file)) {
    file_force_download($file);
} else {
    http_response_code(404);
    echo 'File not found';
}