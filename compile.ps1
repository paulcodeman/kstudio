# KStudio Compiler for KolibriOS
# Usage: .\compile.ps1 -Source "main.c" [-Run]

param(
    [Parameter(Mandatory=$true)]
    [string]$Source,
    [switch]$Run
)

$BUILD_DIR = Join-Path $PSScriptRoot "build"
$SRC_DIR = Join-Path $BUILD_DIR "src"
$LIB_DIR = Join-Path $BUILD_DIR "lib"

Write-Host "=== KStudio Compiler for KolibriOS ===" -ForegroundColor Cyan
Write-Host "Source:   $Source"
Write-Host ""

if (-not (Test-Path $Source)) {
    Write-Host "ERROR: Source file not found: $Source" -ForegroundColor Red
    exit 1
}

# Ensure lib directory exists
if (-not (Test-Path $LIB_DIR)) {
    Write-Host "Copying CMM library files..." -ForegroundColor Yellow
    New-Item -ItemType Directory -Path $LIB_DIR -Force | Out-Null
    Copy-Item -Recurse "C:\cmm\apps\lib\*" $LIB_DIR
}

# Copy source to build/src
$SourceName = [System.IO.Path]::GetFileNameWithoutExtension($Source)
Copy-Item $Source (Join-Path $SRC_DIR "$SourceName.c") -Force

Push-Location $SRC_DIR

Write-Host "Compiling..." -ForegroundColor Yellow
$output = & "c--" "/D=LANG_ENG" "$SourceName.c" 2>&1
$exitCode = $LASTEXITCODE

Pop-Location

if ($exitCode -eq 0) {
    $extensions = @('.com', '.kex')
    $found = $false
    foreach ($ext in $extensions) {
        $outFile = Join-Path $SRC_DIR "$SourceName$ext"
        if (Test-Path $outFile) {
            Write-Host ""
            Write-Host "SUCCESS: $outFile" -ForegroundColor Green
            Write-Host "Size:    $((Get-Item $outFile).Length) bytes" -ForegroundColor Green
            $found = $true
            break
        }
    }
    
    if (-not $found) {
        $comFiles = Get-ChildItem $SRC_DIR -Filter "*.com" | Sort-Object LastWriteTime -Descending
        if ($comFiles) {
            Write-Host ""
            Write-Host "SUCCESS: $($comFiles[0].FullName)" -ForegroundColor Green
            Write-Host "Size:    $($comFiles[0].Length) bytes" -ForegroundColor Green
            $found = $true
        }
    }
    
    Write-Host ""
    Write-Host "Done." -ForegroundColor Green
} else {
    Write-Host ""
    Write-Host "COMPILATION FAILED (exit code: $exitCode)" -ForegroundColor Red
    if ($output) {
        $output | ForEach-Object { Write-Host "  $_" -ForegroundColor Red }
    }
    $warnFile = Join-Path $SRC_DIR "warning.txt"
    if (Test-Path $warnFile) {
        Write-Host "Warnings/Errors:" -ForegroundColor Yellow
        Get-Content $warnFile | ForEach-Object { Write-Host "  $_" }
    }
}
