@echo off
chcp 65001 >nul
title KStudio - CMM Compiler for KolibriOS

if "%1"=="" (
    echo.
    echo KStudio - CMM Compiler for KolibriOS
    echo ======================================
    echo.
    echo Usage: build ^<source.c^> [options]
    echo.
    echo Source file is relative to build\src\
    echo.
    echo Examples:
    echo   build main.c
    echo.
    goto :eof
)

set SOURCE=%1
set BUILD_DIR=%~dp0build
set SRC_DIR=%BUILD_DIR%\src
set LIB_DIR=%BUILD_DIR%\lib

if not exist "%SRC_DIR%\%SOURCE%" (
    echo Error: Source file not found: %SRC_DIR%\%SOURCE%
    exit /b 1
)

if not exist "%LIB_DIR%" (
    echo Copying CMM library files...
    mkdir "%LIB_DIR%" 2>nul
    xcopy /E /I /Y "C:\cmm\apps\lib\*" "%LIB_DIR%" >nul
)

echo.
echo [KStudio] Compiling: %SOURCE%
echo.

pushd "%SRC_DIR%"
c-- /D=LANG_ENG "%SOURCE%"
popd

if exist "%SRC_DIR%\%~n1.com" (
    echo.
    echo [KStudio] Success! Output: %~n1.com
    dir "%SRC_DIR%\%~n1.com"
) else (
    echo.
    echo [KStudio] Compilation failed.
    if exist "%SRC_DIR%\warning.txt" type "%SRC_DIR%\warning.txt"
)

echo.
