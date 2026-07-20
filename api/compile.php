<?php
require_once __DIR__ . '/init.php';

$code = $_POST['CODE'] ?? '';
$mode = $_POST['MODE'] ?? 'run';

if (!$code) {
	http_response_code(400);
	echo 'No code provided';
	exit;
}

$CMM_LIB = 'C:/cmm/apps/lib';
$BUILD_DIR = __DIR__ . '/../build';
$SRC_DIR = $BUILD_DIR . '/src';
$LIB_DIR = $BUILD_DIR . '/lib';

// Ensure build directory structure
if (!file_exists($SRC_DIR)) mkdir($SRC_DIR, 0777, true);

// Copy CMM lib headers into build/lib/ so relative includes work
if (!file_exists($LIB_DIR)) {
	mkdir($LIB_DIR, 0777, true);
	copy_recursive($CMM_LIB, $LIB_DIR);
} else {
	// Check if lib is outdated (simple check - compare gui.h modification time)
	$src_mtime = filemtime($CMM_LIB . '/gui.h');
	$dst_mtime = filemtime($LIB_DIR . '/gui.h');
	if ($src_mtime > $dst_mtime) {
		del_tree($LIB_DIR);
		mkdir($LIB_DIR, 0777, true);
		copy_recursive($CMM_LIB, $LIB_DIR);
	}
}

// Generate unique filename
$hash = substr(md5(time() . rand()), 0, 8);
$sourceFile = $SRC_DIR . '/app_' . $hash . '.c';
$outputBase = $SRC_DIR . '/app_' . $hash;

file_put_contents($sourceFile, $code);

// Run compiler from the build directory (so lib/ is at ../lib/ relative to src/)
$cwd_before = getcwd();
chdir($SRC_DIR);

$cmd = sprintf('c-- /D=LANG_ENG "%s" 2>&1', $sourceFile);
$output = [];
$return_var = 0;
exec($cmd, $output, $return_var);

chdir($cwd_before);

// Find output file
$found = false;
$binaryPath = '';
foreach (['.com', '.kex'] as $ext) {
	$test = $outputBase . $ext;
	if (file_exists($test)) {
		$binaryPath = $test;
		$found = true;
		break;
	}
}
if (!$found) {
	$files = glob($SRC_DIR . '/app_' . $hash . '.*');
	if ($files) {
		$binaryPath = $files[0];
		$found = true;
	}
}

if ($mode === 'run') {
	$result = [
		'status' => ($return_var === 0 && $found) ? 'ok' : 'error',
		'output' => implode("\n", $output),
		'return_code' => $return_var,
		'binary' => $found ? basename($binaryPath) : ''
	];
	header('Content-Type: application/json');
	echo json_encode($result);
} elseif ($mode === 'download') {
	if ($found && $return_var === 0) {
		file_force_download($binaryPath);
	} else {
		http_response_code(500);
		echo 'Compilation failed';
		file_put_contents(__DIR__ . '/../build/error.log', implode("\n", $output));
	}
}

function copy_recursive($src, $dst) {
	$dir = opendir($src);
	if (!$dir) return;
	@mkdir($dst, 0777, true);
	while (($file = readdir($dir)) !== false) {
		if ($file === '.' || $file === '..') continue;
		$srcPath = $src . '/' . $file;
		$dstPath = $dst . '/' . $file;
		if (is_dir($srcPath)) {
			copy_recursive($srcPath, $dstPath);
		} else {
			copy($srcPath, $dstPath);
		}
	}
	closedir($dir);
}
