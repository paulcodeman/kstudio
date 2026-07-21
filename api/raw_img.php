<?php
function open_image($file)
{
    $size = getimagesize($file);
    if (!$size) return false;
    switch ($size["mime"]) {
        case "image/jpeg":
            return imagecreatefromjpeg($file);
        case "image/gif":
            return imagecreatefromgif($file);
        case "image/png":
            return imagecreatefrompng($file);
    }
    return false;
}

function getArrayOfPixelsFromFile($source)
{
    $image = open_image($source);
    if (!$image) {
        echo '{}';
        exit;
    }

    $width = imagesx($image);
    $height = imagesy($image);

    $images_rgb = [$width, $height];
    $img_count_dword = 1;
    for ($y = 0; $y < $height; $y++) {
        for ($x = 0; $x < $width; $x++) {
            $rgb = imagecolorat($image, $x, $y);
            $images_rgb[++$img_count_dword] = $rgb;
        }
    }
    echo '{' . implode($images_rgb, ',') . '}';
}

$test_file = 'test.png';
if (file_exists($test_file)) {
    getArrayOfPixelsFromFile($test_file);
} else {
    echo '{}';
}