cd /d %~dp0
if exist _setpath.bat call _setpath.bat
cd example
deno run --allow-net --allow-read --allow-write 100-http_server.js
pause
