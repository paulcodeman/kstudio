<?php
function file_force_download($file)
{
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
