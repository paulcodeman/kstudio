<?php
	function file_force_download($file)
	{
		if (ob_get_level()) {
		  ob_end_clean();
		}
		// заставляем браузер показать окно сохранения файла
		header('Content-Description: File Transfer');
		header('Content-Type: application/octet-stream');
		header('Content-Disposition: attachment; filename=' . basename($file));
		header('Content-Transfer-Encoding: binary');
		header('Expires: 0');
		header('Cache-Control: must-revalidate');
		header('Pragma: public');
		header('Content-Length: ' . filesize($file));
		// читаем файл и отправляем его пользователю
		readfile($file);
		unlink($file);
		exit;
	}
	$user = md5($_SERVER["REMOTE_ADDR"]);
	if(file_exists($user.'/example'))unlink($user.'/example');
	file_put_contents('setting',$user);
	while(true)
	{
		usleep(1000);
		if(file_exists($user.'/example'))break;
	}
	file_force_download($user.'/example');
?>