#!/bin/bash

echo "🔍 Fuwari VPS Debug Script"
echo "================================"
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 1. Check PM2 status
echo -e "${YELLOW}1. PM2 Status:${NC}"
pm2 list
echo ""

# 2. Check if port 3001 is listening
echo -e "${YELLOW}2. Port 3001 Status:${NC}"
if netstat -tuln | grep -q ":3001 "; then
    echo -e "${GREEN}✓ Port 3001 is listening${NC}"
    netstat -tuln | grep ":3001"
else
    echo -e "${RED}✗ Port 3001 is NOT listening${NC}"
fi
echo ""

# 3. Test local connection
echo -e "${YELLOW}3. Testing local connection (http://localhost:3001):${NC}"
curl -s -o /dev/null -w "HTTP Status: %{http_code}\n" http://localhost:3001
echo ""

# 4. Test local API routes
echo -e "${YELLOW}4. Testing local API routes:${NC}"
echo "- Auth status API:"
curl -s http://localhost:3001/api/auth/status | jq . 2>/dev/null || curl -s http://localhost:3001/api/auth/status
echo ""
echo "- NextAuth session API:"
curl -s http://localhost:3001/api/auth/session | jq . 2>/dev/null || curl -s http://localhost:3001/api/auth/session
echo ""

# 5. Check environment variables
echo -e "${YELLOW}5. Environment Variables:${NC}"
if [ -f .env ]; then
    echo "NEXTAUTH_URL=$(grep NEXTAUTH_URL .env | cut -d '=' -f2)"
    echo "NODE_ENV=$(grep NODE_ENV .env | cut -d '=' -f2)"
    echo "DATABASE_HOST=$(grep DATABASE_HOST .env | cut -d '=' -f2)"
else
    echo -e "${RED}✗ .env file not found${NC}"
fi
echo ""

# 6. Check Nginx configuration
echo -e "${YELLOW}6. Nginx Configuration (X-Forwarded headers):${NC}"
if grep -q "X-Forwarded-Proto" /etc/nginx/sites-enabled/fuwari.anhnangcuaem.com 2>/dev/null; then
    echo -e "${GREEN}✓ X-Forwarded-Proto found${NC}"
else
    echo -e "${RED}✗ X-Forwarded-Proto NOT found${NC}"
fi
if grep -q "X-Forwarded-Host" /etc/nginx/sites-enabled/fuwari.anhnangcuaem.com 2>/dev/null; then
    echo -e "${GREEN}✓ X-Forwarded-Host found${NC}"
else
    echo -e "${RED}✗ X-Forwarded-Host NOT found${NC}"
fi
echo ""

# 7. Test public HTTPS endpoint
echo -e "${YELLOW}7. Testing public HTTPS endpoint:${NC}"
echo "- Main page:"
curl -s -o /dev/null -w "HTTP Status: %{http_code}\n" https://fuwari.anhnangcuaem.com
echo "- Auth session (with cookie):"
curl -s -o /dev/null -w "HTTP Status: %{http_code}\n" https://fuwari.anhnangcuaem.com/api/auth/session
echo ""

# 8. Check PM2 logs (last 20 lines)
echo -e "${YELLOW}8. PM2 Recent Logs (last 20 lines):${NC}"
pm2 logs fuwari --lines 20 --nostream
echo ""

# 9. Check Nginx error logs
echo -e "${YELLOW}9. Nginx Error Logs (last 10 relevant lines):${NC}"
sudo tail -20 /var/log/nginx/error.log | grep -v ".git" | tail -10
echo ""

# 10. Database connection test
echo -e "${YELLOW}10. Database Connection:${NC}"
DB_HOST=$(grep DATABASE_HOST .env 2>/dev/null | cut -d '=' -f2)
DB_PORT=$(grep DATABASE_PORT .env 2>/dev/null | cut -d '=' -f2)
if [ ! -z "$DB_HOST" ] && [ ! -z "$DB_PORT" ]; then
    if nc -z $DB_HOST $DB_PORT 2>/dev/null; then
        echo -e "${GREEN}✓ Database connection OK ($DB_HOST:$DB_PORT)${NC}"
    else
        echo -e "${RED}✗ Cannot connect to database ($DB_HOST:$DB_PORT)${NC}"
    fi
else
    echo "Database host/port not found in .env"
fi
echo ""

echo "================================"
echo -e "${GREEN}Debug complete!${NC}"
