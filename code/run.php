<?php
	system('start '.md5($_SERVER["REMOTE_ADDR"]).'/example');
	unlink(md5($_SERVER["REMOTE_ADDR"]).'/example');
?>