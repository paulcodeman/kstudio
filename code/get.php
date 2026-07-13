<?php
	
	function file_force_download($file)
	{
		readfile($file);
		unlink($file);
		unlink('setting');
		exit;
	}
	if(!file_exists('setting'))exit;
	file_force_download(file_get_contents('setting').'/example.c');
	

	