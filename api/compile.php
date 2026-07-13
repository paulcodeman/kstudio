<?php
require_once 'init.php';
$user = get_user_dir();
if (file_exists($user . '/example')) unlink($user . '/example');
file_put_contents('setting', $user);

$max_wait = 30;
$waited = 0;
while ($waited < $max_wait) {
	usleep(100000);
	$waited += 0.1;
	if (file_exists($user . '/example')) break;
}

if (!file_exists($user . '/example')) {
	http_response_code(504);
	echo 'Compilation timeout';
	exit;
}

file_force_download($user . '/example');
