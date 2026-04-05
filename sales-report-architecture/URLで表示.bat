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
echo ========================================
echo  この URL をブラウザで開いてください（固定）
echo    この PC:  http://localhost:4180/
echo  同一 Wi-Fi の別端末: 下に表示される Network の URL
echo ========================================
echo  4180 が使用中の場合はエラーになります。そのアプリを終了するか、
echo  vite.config.ts の preview.port を変えてください。
echo.
echo  インターネット上の URL が必要な場合（別の黒い画面で）:
echo    npx localtunnel --port 4180
echo  または: npm run tunnel
echo    （この画面でプレビューが動いたままにしてから実行）
echo ========================================
echo.
call npm run url
pause
