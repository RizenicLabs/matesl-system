# MateSL Environment Variables Setup Guide

## Run `generate-env.sh` Script

```bash
chmod +x generate-keys.sh
./generate-keys.sh
```

### This script will generate all necessary environment variables and print them to the console. Copy these values into your `.env` files as instructed below.

---

## 🔐 1. JWT Secret Generation

### Method 1: Using Node.js (Recommended)

```bash
# Generate a strong 64-character random string
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

### Method 2: Using OpenSSL

```bash
# Generate a 64-byte random string
openssl rand -hex 64
```

### Method 3: Online Generator (Less secure)

Visit: https://www.allkeysgenerator.com/Random/Security-Encryption-Key-Generator.aspx

- Select "Encryption Key"
- Choose "512-bit" length
- Generate and copy

**Update in `packages/api/.env`:**

```env
JWT_SECRET="your-generated-64-character-hex-string-here"
```

---

## 🤖 2. OpenAI API Key Setup

### Step 1: Create OpenAI Account

1. Visit: https://platform.openai.com/
2. Sign up or log in
3. Add payment method (required for API access)

### Step 2: Generate API Key

1. Go to: https://platform.openai.com/api-keys
2. Click "Create new secret key"
3. Name it "MateSL Development"
4. Copy the key (starts with `sk-`)

### Step 3: Check Your Quota

1. Visit: https://platform.openai.com/account/billing/overview
2. Ensure you have available credits

**Update in `packages/ai-service/.env`:**

```env
OPENAI_API_KEY="sk-your-actual-openai-api-key-here"
```

### Model Recommendations:

- **Development**: `gpt-3.5-turbo` (cheaper)
- **Production**: `gpt-4` or `gpt-4-turbo` (better quality)

---

## 🤗 3. Hugging Face API Key Setup

### Step 1: Create Account

1. Visit: https://huggingface.co/
2. Sign up for free account

### Step 2: Generate Access Token

1. Go to: https://huggingface.co/settings/tokens
2. Click "New token"
3. Name: "MateSL Development"
4. Type: "Read" (sufficient for inference)
5. Copy the token (starts with `hf_`)

**Update in `packages/ai-service/.env`:**

```env
HUGGINGFACE_API_KEY="hf_your-actual-huggingface-token-here"
```

---

## 🔑 4. Google OAuth Setup (Optional but Recommended)

### Step 1: Create Google Cloud Project

1. Visit: https://console.cloud.google.com/
2. Create new project or select existing
3. Name: "MateSL Development"

### Step 2: Enable Google+ API

1. In Google Cloud Console, go to "APIs & Services" > "Library"
2. Search for "Google+ API"
3. Click and enable it

### Step 3: Configure OAuth Consent Screen

1. Go to "APIs & Services" > "OAuth consent screen"
2. Choose "External" user type
3. Fill required fields:
   - App name: "MateSL"
   - User support email: your-email@gmail.com
   - App domain: `http://localhost:3000`
   - Developer contact: your-email@gmail.com
4. Add scopes: `email`, `profile`, `openid`
5. Add test users (your Gmail for testing)

### Step 4: Create OAuth Credentials

1. Go to "APIs & Services" > "Credentials"
2. Click "Create Credentials" > "OAuth 2.0 Client IDs"
3. Application type: "Web application"
4. Name: "MateSL Web Client"
5. Authorized JavaScript origins:
   - `http://localhost:3000`
   - `http://localhost:3001`
6. Authorized redirect URIs:
   - `http://localhost:3001/api/v1/auth/google/callback`
7. Click "Create"
8. Copy Client ID and Client Secret

**Update in `packages/api/.env`:**

```env
GOOGLE_CLIENT_ID="your-google-client-id.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
```

**Update in `packages/web/.env.local`:**

```env
NEXT_PUBLIC_GOOGLE_CLIENT_ID="your-google-client-id.apps.googleusercontent.com"
```

---

## 📊 5. Additional Security Configurations

### Generate Session Secret (for additional security)

```bash
# Generate another random string for sessions
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### Update File Upload Security

**In `packages/api/.env` and `packages/database/.env`:**

```env
MAX_FILE_SIZE=5242880  # 5MB in bytes
UPLOAD_DIR="uploads"
```

---

## 🌍 6. Production-Ready Environment Variables

When deploying to production, update these values:

### `packages/api/.env` (Production)

```env
NODE_ENV=production
HOST=0.0.0.0
PORT=3001

# Use a production database URL
DATABASE_URL="postgresql://username:password@host:port/database"

# Use Redis Cloud or production Redis
REDIS_URL="redis://username:password@host:port"

# Production frontend URL
FRONTEND_URL="https://your-domain.com"
ADMIN_URL="https://admin.your-domain.com"

# Longer JWT expiration for production
JWT_EXPIRE="1h"
JWT_REFRESH_EXPIRE="7d"
```

### `packages/web/.env.local` (Production)

```env
NODE_ENV=production
NEXT_PUBLIC_API_URL=https://api.your-domain.com
NEXT_PUBLIC_AI_SERVICE_URL=https://ai.your-domain.com
NEXT_PUBLIC_APP_URL=https://your-domain.com
```

---

## 🧪 7. Testing Your Configuration

### Test JWT Secret Generation

```bash
# In your project root
node -e "
const jwt = require('jsonwebtoken');
const secret = 'your-jwt-secret-here';
const token = jwt.sign({test: true}, secret);
console.log('JWT Test Token:', token);
const decoded = jwt.verify(token, secret);
console.log('Decoded:', decoded);
"
```

### Test OpenAI Connection

```bash
# Test OpenAI API
curl https://api.openai.com/v1/models \
  -H "Authorization: Bearer your-openai-api-key-here"
```

### Test Hugging Face Connection

```bash
# Test Hugging Face API
curl https://api-inference.huggingface.co/models/microsoft/DialoGPT-medium \
  -X POST \
  -d '{"inputs": "Hello"}' \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer your-hf-token-here"
```

---

## 🚨 8. Security Best Practices

### Never Commit Secrets

Add to `.gitignore`:

```gitignore
# Environment variables
.env
.env.local
.env.*.local
packages/*/.env
packages/*/.env.local
*.pem
```

### Rotate Keys Regularly

- JWT secrets: Every 3-6 months
- API keys: When compromised or annually
- OAuth secrets: When compromised

### Use Different Keys for Different Environments

- Development: One set of keys
- Staging: Different set
- Production: Completely different set

---

## 🔧 9. Quick Setup Commands

Run these commands to quickly generate all necessary secrets:

```bash
#!/bin/bash

echo "=== MateSL Environment Variables Generator ==="
echo ""

# Generate JWT Secret
JWT_SECRET=$(node -e "console.log(require('crypto').randomBytes(64).toString('hex'))")
echo "JWT_SECRET=\"$JWT_SECRET\""
echo ""

# Generate Session Secret
SESSION_SECRET=$(node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")
echo "SESSION_SECRET=\"$SESSION_SECRET\""
echo ""

echo "Copy these values to your .env files!"
echo ""
echo "Still needed manually:"
echo "- OpenAI API Key: https://platform.openai.com/api-keys"
echo "- Hugging Face Token: https://huggingface.co/settings/tokens"
echo "- Google OAuth: https://console.cloud.google.com/"
```

---

## 📝 10. Final Checklist

Before starting your application:

- [ ] JWT_SECRET generated and set
- [ ] OpenAI API key obtained and set
- [ ] Hugging Face token obtained and set
- [ ] Google OAuth configured (if using social login)
- [ ] Database URLs match your Docker setup
- [ ] Redis URLs match your Docker setup
- [ ] All .env files have actual values (not placeholders)
- [ ] .env files added to .gitignore
- [ ] Test database connection works
- [ ] Test Redis connection works

Run your setup script after configuring all variables:

```bash
./setup.sh
```

Your MateSL system should now be fully configured and ready for development! 🎉
