<?php
// Prevent script timeout
set_time_limit(120);

function file_force_download($file)
{
    if (!file_exists($file)) {
        http_response_code(404);
        echo 'File not found';
        exit;
    }
    if (ob_get_level()) ob_end_clean();
    header('Content-Description: File Transfer');
    header('Content-Type: application/octet-stream');
    header('Content-Disposition: attachment; filename=' . basename($file));
    header('Content-Transfer-Encoding: binary');
    header('Expires: 0');
    header('Cache-Control: must-revalidate');
    header('Pragma: public');
    header('Content-Length: ' . filesize($file));
    readfile($file);
    exit;
}

function get_user_dir()
{
    return md5($_SERVER["REMOTE_ADDR"]);
}

function del_tree($dir)
{
    if (!file_exists($dir)) return;
    $it = new RecursiveDirectoryIterator($dir, RecursiveDirectoryIterator::SKIP_DOTS);
    $files = new RecursiveIteratorIterator($it, RecursiveIteratorIterator::CHILD_FIRST);
    foreach ($files as $f) {
        if ($f->isDir()) rmdir($f->getRealPath());
        else unlink($f->getRealPath());
    }
    rmdir($dir);
}