#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${BLUE}🔐 MateSL Key Generator${NC}"
echo "=================================="
echo ""

# Check if Node.js is available
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is required but not installed."
    exit 1
fi

echo -e "${GREEN}✅ Generating cryptographic keys...${NC}"
echo ""

# Generate JWT Secret
JWT_SECRET=$(node -e "console.log(require('crypto').randomBytes(64).toString('hex'))")
echo -e "${YELLOW}JWT_SECRET:${NC}"
echo "JWT_SECRET=\"$JWT_SECRET\""
echo ""

# Generate additional secrets
SESSION_SECRET=$(node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")
echo -e "${YELLOW}SESSION_SECRET (for additional security):${NC}"
echo "SESSION_SECRET=\"$SESSION_SECRET\""
echo ""

# Generate encryption key
ENCRYPTION_KEY=$(node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")
echo -e "${YELLOW}ENCRYPTION_KEY (for file encryption):${NC}"
echo "ENCRYPTION_KEY=\"$ENCRYPTION_KEY\""
echo ""

echo "=================================="
echo -e "${GREEN}✅ Keys generated successfully!${NC}"
echo ""
echo -e "${BLUE}📋 Next steps:${NC}"
echo "1. Copy the JWT_SECRET to packages/api/.env"
echo "2. Get your OpenAI API key from: https://platform.openai.com/api-keys"
echo "3. Get your Hugging Face token from: https://huggingface.co/settings/tokens"
echo "4. (Optional) Set up Google OAuth: https://console.cloud.google.com/"
echo ""
echo -e "${YELLOW}⚠️  Important:${NC} Keep these keys secure and never commit them to git!"