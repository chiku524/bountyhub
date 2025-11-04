@echo off
REM Development Environment Setup Script for BountyHub (Windows)

echo 🚀 Setting up BountyHub Development Environment...

REM Check if wrangler is installed
wrangler --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Wrangler is not installed. Please install it first:
    echo    npm install -g wrangler
    pause
    exit /b 1
)

echo 📦 Installing dependencies...
call npm install

echo 🗄️  Setting up local database...
REM Apply migrations to local database
call wrangler d1 migrations apply bountyhub-db-dev --local --config wrangler.dev.toml

echo 🧹 Clearing local database data...
REM Clear all data from local database
call wrangler d1 execute bountyhub-db-dev --local --config wrangler.dev.toml --command "DELETE FROM chat_messages; DELETE FROM chat_room_participants; DELETE FROM chat_rooms WHERE type = 'GLOBAL'; DELETE FROM users; DELETE FROM profiles; DELETE FROM posts; DELETE FROM comments; DELETE FROM answers; DELETE FROM votes; DELETE FROM bounties; DELETE FROM virtual_wallets; DELETE FROM wallet_transactions;"

echo ✅ Local development environment is ready!
echo.
echo To start development:
echo 1. Start the API server: npm run dev:api
echo 2. In another terminal, start the frontend: npm run dev:frontend
echo.
echo Your local environment will be completely isolated from production.
echo API will be available at: http://localhost:8788
echo Frontend will be available at: http://localhost:3000
pause 