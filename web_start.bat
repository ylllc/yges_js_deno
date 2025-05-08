cd /d %~dp0
if exist _setpath.bat call _setpath.bat
cd example
deno run --allow-net --allow-read --allow-write --allow-env 101-http_server_websock.js
pause
