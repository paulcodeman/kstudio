<?php
if (!file_exists('setting')) exit;
$user = file_get_contents('setting');
$file = $user . '/example.c';
if (file_exists($file)) {
    readfile($file);
    unlink($file);
    unlink('setting');
}