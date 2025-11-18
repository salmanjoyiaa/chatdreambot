@echo off
REM Quick verification script for Windows
REM Run this from your project root: verify.bat

echo.
echo 🔍 BnB Chatbot - Component Verification
echo ======================================
echo.

REM Check Node version
echo 1. Checking Node.js...
where node >nul 2>nul
if %ERRORLEVEL% EQU 0 (
    echo    ✅ Node.js installed
    node --version
) else (
    echo    ❌ Node.js not found - install from nodejs.org
    exit /b 1
)

REM Check npm packages
echo.
echo 2. Checking npm packages...
if exist "node_modules" (
    echo    ✅ node_modules directory exists
) else (
    echo    ⚠️  node_modules missing - run: npm install
)

REM Check .env.local
echo.
echo 3. Checking .env.local...
if exist ".env.local" (
    echo    ✅ .env.local exists
    
    findstr /M "VITE_SUPABASE_URL" .env.local >nul
    if %ERRORLEVEL% EQU 0 (
        echo    ✅ VITE_SUPABASE_URL found
    ) else (
        echo    ❌ VITE_SUPABASE_URL missing
    )
    
    findstr /M "VITE_SUPABASE_ANON_KEY" .env.local >nul
    if %ERRORLEVEL% EQU 0 (
        echo    ✅ VITE_SUPABASE_ANON_KEY found
    ) else (
        echo    ❌ VITE_SUPABASE_ANON_KEY missing
    )
    
    findstr /M "GROQ_API_KEY" .env.local >nul
    if %ERRORLEVEL% EQU 0 (
        echo    ✅ GROQ_API_KEY found
    ) else (
        echo    ❌ GROQ_API_KEY missing
    )
) else (
    echo    ❌ .env.local not found - create from .env.example
)

REM Check key files
echo.
echo 4. Checking key files...

setlocal enabledelayedexpansion
set "files=src\App.jsx src\main.jsx src\hooks\useChat.js src\lib\db.js src\lib\supabaseClient.js api\chat.js api\detect-property.js supabase\schema.sql vite.config.js vercel.json package.json"

for %%F in (%files%) do (
    if exist "%%F" (
        echo    ✅ %%F
    ) else (
        echo    ❌ %%F missing
    )
)

REM Check database schema
echo.
echo 5. Checking database setup...
if exist "supabase\schema.sql" (
    echo    ✅ schema.sql exists
) else (
    echo    ❌ schema.sql missing
)

REM Summary
echo.
echo ======================================
echo ✅ Pre-flight check complete!
echo.
echo Next steps:
echo 1. npm install (if node_modules missing)
echo 2. Verify .env.local has all 3 variables
echo 3. Run in Supabase: supabase/schema.sql
echo 4. npm run dev:vercel
echo 5. Open http://localhost:5173
echo.
pause
