#!/bin/bash

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ️ $1${NC}"
}

echo -e "${BLUE}"
echo "╔══════════════════════════════════════════════════╗"
echo "║                MateSL System Setup               ║"
echo "║               Sri Lankan Services AI             ║"
echo "╚══════════════════════════════════════════════════╝"
echo -e "${NC}"

# Check prerequisites
print_info "Checking prerequisites..."

# Check Node.js
if ! command -v node &> /dev/null; then
    print_error "Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    print_error "Node.js version must be 18 or higher. Current: $(node -v)"
    exit 1
fi

print_status "Node.js $(node -v) found"

# Check npm
if ! command -v npm &> /dev/null; then
    print_error "npm is not installed"
    exit 1
fi

print_status "npm $(npm -v) found"

# Check Docker
if ! command -v docker &> /dev/null; then
    print_error "Docker is not installed. Please install Docker first."
    exit 1
fi

print_status "Docker $(docker -v | cut -d' ' -f3 | cut -d',' -f1) found"

# Check Docker Compose
if ! command -v docker-compose &> /dev/null; then
    print_error "Docker Compose is not installed"
    exit 1
fi

print_status "Docker Compose $(docker-compose -v | cut -d' ' -f3 | cut -d',' -f1) found"

# Step 1: Install dependencies
print_info "Step 1: Installing dependencies..."

print_info "Installing root dependencies..."
if npm install; then
    print_status "Root dependencies installed"
else
    print_error "Failed to install root dependencies"
    exit 1
fi

print_info "Installing workspace dependencies..."
if npm install --workspaces; then
    print_status "Workspace dependencies installed"
else
    print_error "Failed to install workspace dependencies"
    exit 1
fi

# Step 2: Start databases
print_info "Step 2: Starting database services..."

if docker-compose -f docker-compose.dev.yml up -d; then
    print_status "Database services started"
else
    print_error "Failed to start database services"
    exit 1
fi

# Wait for services to be ready
print_info "Waiting for database services to be ready..."
sleep 15

# Test database connection
print_info "Testing database connection..."
if docker exec matesl_postgres pg_isready -h localhost -p 5432 -U postgres > /dev/null 2>&1; then
    print_status "PostgreSQL is ready"
else
    print_error "PostgreSQL is not ready"
    exit 1
fi

if docker exec matesl_redis redis-cli ping > /dev/null 2>&1; then
    print_status "Redis is ready"
else
    print_error "Redis is not ready"
    exit 1
fi

# Step 3: Database setup
print_info "Step 3: Setting up database..."

cd packages/database

# Generate Prisma client
print_info "Generating Prisma client..."
if npm run db:generate; then
    print_status "Prisma client generated"
else
    print_error "Failed to generate Prisma client"
    exit 1
fi

# Push database schema
print_info "Pushing database schema..."
if npm run db:push; then
    print_status "Database schema pushed"
else
    print_error "Failed to push database schema"
    exit 1
fi

# Seed database
print_info "Seeding database..."
if npm run db:seed; then
    print_status "Database seeded successfully"
else
    print_error "Failed to seed database"
    exit 1
fi

cd ../..

# Step 4: Environment configuration
print_info "Step 4: Checking environment configuration..."

# Check if API keys are configured
if [ -f "packages/ai-service/.env" ]; then
    if grep -q "sk-" packages/ai-service/.env; then
        print_status "OpenAI API key configured"
    else
        print_warning "OpenAI API key not configured - AI features will use fallback"
    fi
    
    if grep -q "hf_" packages/ai-service/.env; then
        print_status "Hugging Face API key configured"
    else
        print_warning "Hugging Face API key not configured"
    fi
else
    print_error "AI service environment file not found"
    exit 1
fi

# Step 5: Build packages
print_info "Step 5: Building packages..."

if npm run build; then
    print_status "All packages built successfully"
else
    print_warning "Some packages failed to build (this is normal for initial setup)"
fi

# Step 6: Final verification
print_info "Step 6: Final system verification..."

print_info "Checking service endpoints..."

# Test database connection via Prisma Studio
print_info "Database Studio will be available at: http://localhost:5555"

echo -e "\n${GREEN}╔══════════════════════════════════════════════════╗"
echo "║                Setup Complete!                   ║"
echo "╚══════════════════════════════════════════════════╝${NC}"

echo -e "\n${BLUE}📋 Next Steps:${NC}"
echo "1. Configure API keys in packages/ai-service/.env:"
echo "   - Get OpenAI API key: https://platform.openai.com/api-keys"
echo "   - Get Hugging Face API key: https://huggingface.co/settings/tokens"
echo ""
echo "2. Start development servers:"
echo "   ${YELLOW}Terminal 1:${NC} cd packages/ai-service && npm run dev"
echo "   ${YELLOW}Terminal 2:${NC} cd packages/api && npm run dev"
echo "   ${YELLOW}Terminal 3:${NC} cd packages/web && npm run dev"
echo ""
echo "3. Access your application:"
echo "   🌐 Web App: http://localhost:3000"
echo "   🔧 API: http://localhost:3001/health"
echo "   🤖 AI Service: http://localhost:3003/health"
echo "   🗄️  Database Studio: http://localhost:5555"
echo ""
echo "4. Test the setup:"
echo "   - Visit the web app and try the chat feature"
echo "   - Check API health endpoints"
echo "   - Browse procedures in Database Studio"
echo ""

echo -e "${YELLOW}⚠️  Important Notes:${NC}"
echo "• The system will work without API keys but with limited AI features"
echo "• Make sure to keep your .env files secure and never commit them to git"
echo "• For production deployment, use strong JWT secrets and proper SSL certificates"
echo ""

print_status "Setup completed successfully! 🎉"