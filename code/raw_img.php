<?php


function open_image ($file)
{
    $size=getimagesize($file);
    switch($size["mime"])
	{
        case "image/jpeg":
            return imagecreatefromjpeg($file); //jpeg file
        case "image/gif":
			return imagecreatefromgif($file); //gif file
		case "image/png":
			return imagecreatefrompng($file); //png file
	}
    return false;
}

function getArrayOfPixelsFromFile($source)
{
	$image = open_image($source);

	$width = imagesx($image);
	$height = imagesy($image);

	$images_rgb = array($width,$height);
	$img_count_dword = 1;
	for ($y = 0; $y < $height; $y++)
	{
		$y_array = array();
		for ($x = 0; $x < $width; $x++)
		{
			$rgb = imagecolorat($image, $x, $y);
			$images_rgb[++$img_count_dword] = $rgb;
		}
	}
	return '{'.implode($images_rgb,',').'}';
}
print_r(getArrayOfPixelsFromFile('test.png'));
?>