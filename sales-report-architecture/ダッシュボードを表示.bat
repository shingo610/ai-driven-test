@echo off
chcp 65001 >nul
cd /d "%~dp0"
if not exist "node_modules\" (
  echo node_modules がありません。初回のみ npm install を実行します...
  call npm install
  if errorlevel 1 (
    echo npm install に失敗しました。Node.js をインストールしてから再試行してください。
    pause
    exit /b 1
  )
)
echo.
echo 【開発モード】ブラウザが開きます。
echo   主な URL: http://localhost:5180/ （ターミナル表示が正）
echo.
echo 【固定 URL で見たい場合】フォルダ内の「URLで表示.bat」を実行してください。
echo   → http://localhost:4180/ （ビルド後プレビュー）
echo.
echo この黒い画面は閉じないでください（閉じると表示が止まります）。
echo.
call npm run dev
pause
