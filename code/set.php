<?php
	$user = $_GET['usr'];
	
	file_put_contents($user.'/example',file_get_contents('php://input'));