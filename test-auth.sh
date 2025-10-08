#!/bin/bash

echo "🔐 Authentication Flow Test"
echo "================================"
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

DOMAIN="https://fuwari.anhnangcuaem.com"
COOKIE_FILE="/tmp/fuwari-cookies.txt"

# Clean up old cookies
rm -f $COOKIE_FILE

echo -e "${YELLOW}1. Testing unauthenticated session API:${NC}"
RESPONSE=$(curl -s -c $COOKIE_FILE "$DOMAIN/api/auth/session")
echo "Response: $RESPONSE"
echo ""

echo -e "${YELLOW}2. Testing signin page:${NC}"
STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$DOMAIN/auth/signin")
echo "HTTP Status: $STATUS"
if [ "$STATUS" = "200" ]; then
    echo -e "${GREEN}✓ Signin page accessible${NC}"
else
    echo -e "${RED}✗ Cannot access signin page${NC}"
fi
echo ""

echo -e "${YELLOW}3. Testing protected route without auth (/mypage):${NC}"
MYPAGE_RESPONSE=$(curl -s -L -w "\nFinal URL: %{url_effective}\nHTTP Code: %{http_code}" "$DOMAIN/mypage" | tail -3)
echo "$MYPAGE_RESPONSE"
if echo "$MYPAGE_RESPONSE" | grep -q "signin"; then
    echo -e "${GREEN}✓ Correctly redirected to signin${NC}"
else
    echo -e "${RED}✗ Not redirected to signin (middleware may not be working)${NC}"
fi
echo ""

echo -e "${YELLOW}4. Testing auth status API:${NC}"
AUTH_STATUS=$(curl -s "$DOMAIN/api/auth/status")
echo "Response: $AUTH_STATUS"
echo ""

echo -e "${YELLOW}5. Testing NextAuth providers:${NC}"
PROVIDERS=$(curl -s "$DOMAIN/api/auth/providers")
echo "Available providers: $PROVIDERS"
echo ""

echo -e "${YELLOW}6. Testing CSRF token:${NC}"
CSRF=$(curl -s "$DOMAIN/api/auth/csrf")
echo "CSRF response: $CSRF"
echo ""

echo -e "${YELLOW}7. Checking if app is using correct auth URL:${NC}"
echo "Expected: $DOMAIN"
echo "From env: Check .env file on server"
echo ""

echo -e "${YELLOW}8. Testing with verbose headers:${NC}"
curl -v "$DOMAIN/api/auth/session" 2>&1 | grep -E "(< HTTP|< Set-Cookie|< Location|X-Forwarded)"
echo ""

# Clean up
rm -f $COOKIE_FILE

echo "================================"
echo -e "${GREEN}Authentication flow test complete!${NC}"
echo ""
echo -e "${YELLOW}Next steps if issues found:${NC}"
echo "1. Check PM2 logs: pm2 logs fuwari --lines 50"
echo "2. Check app is built correctly: ls -la .next/"
echo "3. Verify .env file: cat .env | grep NEXTAUTH"
echo "4. Restart everything: pm2 restart fuwari && sudo systemctl reload nginx"
