#!/bin/bash
# Quick verification script to test all components

echo "🔍 BnB Chatbot - Component Verification"
echo "======================================"
echo ""

# Check Node version
echo "1. Checking Node.js..."
if command -v node &> /dev/null; then
    echo "   ✅ Node.js $(node --version) installed"
else
    echo "   ❌ Node.js not found - install from nodejs.org"
    exit 1
fi

# Check npm packages
echo ""
echo "2. Checking npm packages..."
if [ -d "node_modules" ]; then
    echo "   ✅ node_modules directory exists"
else
    echo "   ⚠️  node_modules missing - run: npm install"
fi

# Check .env.local
echo ""
echo "3. Checking .env.local..."
if [ -f ".env.local" ]; then
    echo "   ✅ .env.local exists"
    
    if grep -q "VITE_SUPABASE_URL" .env.local; then
        echo "   ✅ VITE_SUPABASE_URL found"
    else
        echo "   ❌ VITE_SUPABASE_URL missing"
    fi
    
    if grep -q "VITE_SUPABASE_ANON_KEY" .env.local; then
        echo "   ✅ VITE_SUPABASE_ANON_KEY found"
    else
        echo "   ❌ VITE_SUPABASE_ANON_KEY missing"
    fi
    
    if grep -q "GROQ_API_KEY" .env.local; then
        echo "   ✅ GROQ_API_KEY found"
    else
        echo "   ❌ GROQ_API_KEY missing"
    fi
else
    echo "   ❌ .env.local not found - create from .env.example"
fi

# Check key files
echo ""
echo "4. Checking key files..."
files=(
    "src/App.jsx"
    "src/main.jsx"
    "src/hooks/useChat.js"
    "src/lib/db.js"
    "src/lib/supabaseClient.js"
    "api/chat.js"
    "api/detect-property.js"
    "supabase/schema.sql"
    "vite.config.js"
    "vercel.json"
    "package.json"
)

for file in "${files[@]}"; do
    if [ -f "$file" ]; then
        echo "   ✅ $file"
    else
        echo "   ❌ $file missing"
    fi
done

# Check database schema exists
echo ""
echo "5. Checking database setup..."
if [ -f "supabase/schema.sql" ]; then
    lines=$(wc -l < supabase/schema.sql)
    echo "   ✅ schema.sql exists ($lines lines)"
else
    echo "   ❌ schema.sql missing"
fi

# Summary
echo ""
echo "======================================"
echo "✅ Pre-flight check complete!"
echo ""
echo "Next steps:"
echo "1. npm install (if node_modules missing)"
echo "2. Verify .env.local has all 3 variables"
echo "3. Run in Supabase: supabase/schema.sql"
echo "4. npm run dev:vercel"
echo "5. Open http://localhost:5173"
echo ""
