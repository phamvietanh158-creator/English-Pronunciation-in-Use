@echo off
rem Nhap dup file nay de chay server xem thu, roi mo http://localhost:8765/
start "" http://localhost:8765/
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0serve.ps1"
