#!/bin/bash

echo "🍪 Cookie & Session Debug Script"
echo "================================"
echo ""

DOMAIN="https://fuwari.anhnangcuaem.com"

# Test 1: Check headers being sent by Nginx
echo "1️⃣  Testing HTTP headers from Nginx:"
echo "-----------------------------------"
curl -s -I "$DOMAIN" | grep -E "(HTTP|Server|X-)"
echo ""

# Test 2: Test session endpoint with all headers
echo "2️⃣  Testing /api/auth/session endpoint:"
echo "-----------------------------------"
RESPONSE=$(curl -s -w "\nHTTP_CODE:%{http_code}" "$DOMAIN/api/auth/session")
echo "$RESPONSE"
echo ""

# Test 3: Check if NextAuth is initialized
echo "3️⃣  Testing NextAuth CSRF endpoint:"
echo "-----------------------------------"
curl -s "$DOMAIN/api/auth/csrf" | head -3
echo ""

# Test 4: Test local vs public
echo "4️⃣  Comparing local vs public responses:"
echo "-----------------------------------"
echo "Local (http://localhost:3001/api/auth/session):"
curl -s http://localhost:3001/api/auth/session | head -3
echo ""
echo "Public ($DOMAIN/api/auth/session):"
curl -s "$DOMAIN/api/auth/session" | head -3
echo ""

# Test 5: Check what PM2 sees
echo "5️⃣  PM2 Environment Variables:"
echo "-----------------------------------"
pm2 env fuwari | grep -E "(NEXTAUTH|NODE_ENV|PORT)" || echo "Cannot read PM2 env"
echo ""

# Test 6: Verify build
echo "6️⃣  Checking Next.js build:"
echo "-----------------------------------"
if [ -d ".next" ]; then
    echo "✓ .next directory exists"
    echo "Build time: $(stat -c %y .next 2>/dev/null || stat -f %Sm .next)"
    if [ -f ".next/BUILD_ID" ]; then
        echo "Build ID: $(cat .next/BUILD_ID)"
    fi
else
    echo "✗ .next directory NOT found - need to run 'npm run build'"
fi
echo ""

# Test 7: Check if middleware is working
echo "7️⃣  Testing middleware protection:"
echo "-----------------------------------"
echo "Testing /mypage (should redirect):"
REDIRECT=$(curl -s -o /dev/null -w "%{redirect_url}" "$DOMAIN/mypage")
if [ ! -z "$REDIRECT" ]; then
    echo "✓ Redirects to: $REDIRECT"
else
    echo "Checking with -L flag:"
    curl -s -L -o /dev/null -w "Final URL: %{url_effective}\nHTTP: %{http_code}\n" "$DOMAIN/mypage"
fi
echo ""

# Test 8: Check database connection
echo "8️⃣  Testing database connection:"
echo "-----------------------------------"
if [ -f ".env" ]; then
    DB_HOST=$(grep "^DATABASE_HOST=" .env | cut -d'=' -f2)
    DB_PORT=$(grep "^DATABASE_PORT=" .env | cut -d'=' -f2)
    DB_NAME=$(grep "^DATABASE_NAME=" .env | cut -d'=' -f2)
    
    echo "Database: $DB_NAME @ $DB_HOST:$DB_PORT"
    
    # Try to connect (requires mysql client)
    if command -v mysql &> /dev/null; then
        DB_USER=$(grep "^DATABASE_USER=" .env | cut -d'=' -f2)
        DB_PASS=$(grep "^DATABASE_PASSWORD=" .env | cut -d'=' -f2)
        echo "Testing connection..."
        mysql -h"$DB_HOST" -P"$DB_PORT" -u"$DB_USER" -p"$DB_PASS" -e "SELECT 1;" 2>&1 | head -2
    else
        echo "mysql client not installed, skipping connection test"
    fi
else
    echo "✗ .env file not found"
fi
echo ""

# Test 9: Real browser simulation
echo "9️⃣  Simulating browser flow:"
echo "-----------------------------------"
COOKIE_FILE="/tmp/test-cookies.txt"
rm -f $COOKIE_FILE

echo "Step 1: Get CSRF token"
CSRF_RESPONSE=$(curl -s -c $COOKIE_FILE "$DOMAIN/api/auth/csrf")
echo "CSRF: $CSRF_RESPONSE" | head -1

echo ""
echo "Step 2: Check session (should be empty)"
SESSION=$(curl -s -b $COOKIE_FILE "$DOMAIN/api/auth/session")
echo "Session: $SESSION"

echo ""
echo "Step 3: Try to access protected route"
PROTECTED=$(curl -s -b $COOKIE_FILE -L -w "\nFinal URL: %{url_effective}" "$DOMAIN/mypage" | tail -1)
echo "$PROTECTED"

rm -f $COOKIE_FILE
echo ""

echo "================================"
echo "✅ Debug complete!"
echo ""
echo "📋 Summary checklist:"
echo "  [ ] NextAuth endpoints responding (test 2 & 3)"
echo "  [ ] Middleware redirecting correctly (test 7)"
echo "  [ ] Database connected (test 8)"
echo "  [ ] .next build exists and recent (test 6)"
echo "  [ ] PM2 running with correct env vars (test 5)"
