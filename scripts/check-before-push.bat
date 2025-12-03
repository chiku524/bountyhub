@echo off
REM Script to check for errors before pushing to GitHub (Windows)
REM Usage: scripts\check-before-push.bat

echo 🔍 Running pre-push checks...
echo.

REM Check TypeScript compilation
echo 📝 Checking TypeScript compilation...
npm run build 2>&1 | findstr /C:"error TS" >nul
if %errorlevel% equ 0 (
    echo ❌ TypeScript compilation: FAILED
    echo Please fix TypeScript errors before pushing.
    exit /b 1
) else (
    echo ✅ TypeScript compilation: PASSED
)

REM Check API build
echo 📝 Checking API TypeScript compilation...
npm run build:api 2>&1 | findstr /C:"error TS" >nul
if %errorlevel% equ 0 (
    echo ❌ API TypeScript compilation: FAILED
    echo Please fix API TypeScript errors before pushing.
    exit /b 1
) else (
    echo ✅ API TypeScript compilation: PASSED
)

REM Check linter
echo 🔍 Running linter...
npm run lint 2>&1 | findstr /C:"error" /C:"✖" >nul
if %errorlevel% equ 0 (
    echo ❌ Linter: FAILED
    echo Please fix linter errors before pushing.
    exit /b 1
) else (
    echo ✅ Linter: PASSED
)

echo.
echo ✅ All checks passed! Ready to push.

