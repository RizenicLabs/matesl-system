#!/bin/bash

# Always run from the project root
cd "$(dirname "$0")/.." || exit 1

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
LINK='\033[1;36m'  # bright cyan
NC='\033[0m' # No Color
ITALIC='\033[3m' # Italic text

# Function to print colored output
print_status() {
    echo -e "${GREEN}✅\u00A0$1${NC}"
}

print_error() {
    echo -e "${RED}❌\u00A0$1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️\u00A0\u00A0$1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ️\u00A0\u00A0$1${NC}"
}

# Function to create a clickable link
link_text_with_url() {
    local text="$1"
    local url="$2"
    echo -e "\033]8;;${url}\033\\${LINK}${text}${NC}\033]8;;\033\\"
}

# Function to check if port is in use
check_port() {
    local port=$1
    if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null 2>&1; then
        return 0  # Port is in use
    else
        return 1  # Port is free
    fi
}

# Function to stop conflicting services
stop_conflicting_services() {
    print_info "Checking for conflicting services..."
    
    if check_port 5432; then
        print_warning "PostgreSQL is running on port 5432"
        echo "We'll use port 5433 for the containerized PostgreSQL"
    fi
    
    if check_port 6379; then
        print_warning "Redis is running on port 6379"
        echo "We'll use port 6380 for the containerized Redis"
        echo "You can stop local Redis with: sudo systemctl stop redis-server"
    fi
    
    if check_port 9200; then
        print_warning "Elasticsearch is running on port 9200"
        echo "We'll use port 9201 for the containerized Elasticsearch"
    fi
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

print_status "Docker found"

# Check Docker Compose
if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null; then
    print_error "Docker Compose is not installed"
    exit 1
fi

print_status "Docker Compose found"

# Check and handle port conflicts
stop_conflicting_services

# Step 1: Clean up existing containers
print_info "Step 1: Cleaning up existing containers..."

docker-compose -f docker-compose.dev.yml down -v 2>/dev/null || true
docker container prune -f 2>/dev/null || true

print_status "Cleanup completed"

# Step 2: Install dependencies
print_info "Step 2: Installing dependencies..."

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

# Step 2.5: Build shared packages first
print_info "Step 2.5: Building shared package..."

# Build shared package first
print_info "Building @matesl/shared..."
cd packages/shared
if npm run build; then
    print_status "Shared package built successfully"
else
    print_error "Failed to build shared package"
    exit 1
fi
cd ../..

# Step 3: Start databases with health checks
print_info "Step 3: Starting database services..."

if docker-compose -f docker-compose.dev.yml up -d; then
    print_status "Database services started"
else
    print_error "Failed to start database services"
    exit 1
fi

# Wait for services to be ready with proper health checks
print_info "Waiting for database services to be ready..."

# Wait for PostgreSQL
print_info "Waiting for PostgreSQL..."
for i in {1..30}; do
    if docker exec matesl_postgres pg_isready -h localhost -p 5432 -U postgres >/dev/null 2>&1; then
        print_status "PostgreSQL is ready"
        break
    fi
    if [ $i -eq 30 ]; then
        print_error "PostgreSQL failed to start"
        exit 1
    fi
    sleep 2
done

# Wait for Redis
print_info "Waiting for Redis..."
for i in {1..30}; do
    if docker exec matesl_redis redis-cli ping >/dev/null 2>&1; then
        print_status "Redis is ready"
        break
    fi
    if [ $i -eq 30 ]; then
        print_error "Redis failed to start"
        exit 1
    fi
    sleep 2
done

# Wait for Elasticsearch
print_info "Waiting for Elasticsearch..."
for i in {1..60}; do
    if curl -f http://localhost:9201/_cluster/health >/dev/null 2>&1; then
        print_status "Elasticsearch is ready"
        break
    fi
    if [ $i -eq 60 ]; then
        print_error "Elasticsearch failed to start"
        exit 1
    fi
    sleep 2
done

# Step 4: Database setup
print_info "Step 4: Setting up database..."

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

# Build database package now that shared is available
print_info "Building database package..."
if npm run build; then
    print_status "Database package built successfully"
else
    print_warning "Database package build failed (continuing anyway)"
fi

# Seed database (now that everything is built)
print_info "Seeding database..."
if npm run db:seed; then
    print_status "Database seeded successfully"
else
    print_warning "Failed to seed database (this might be normal for initial setup)"
fi

cd ../..

# Step 5: Environment configuration check
print_info "Step 5: Checking environment configuration..."

# Check AI service environment
if [ -f "packages/ai-service/.env" ]; then
    if grep -q "sk-" packages/ai-service/.env 2>/dev/null; then
        print_status "OpenAI API key configured"
    else
        print_warning "OpenAI API key not configured - AI features will use fallback"
    fi
    
    if grep -q "hf_" packages/ai-service/.env 2>/dev/null; then
        print_status "Hugging Face API key configured"
    else
        print_warning "Hugging Face API key not configured"
    fi
else
    print_warning "AI service environment file not found"
fi

# Step 6: Build remaining packages
print_info "Step 6: Building remaining packages..."

# Build ai-service
print_info "Building AI service..."
cd packages/ai-service
if npm run build; then
    print_status "AI service built"
else
    print_warning "AI service build failed"
fi
cd ../..

# Build API
print_info "Building API service..."
cd packages/api
if npm run build; then
    print_status "API service built"
else
    print_warning "API service build failed"
fi
cd ../..

# Step 7: Final verification
print_info "Step 7: Final system verification..."

# Test database connections
print_info "Testing database connections..."

# Test PostgreSQL
if docker exec matesl_postgres psql -U postgres -d matesl -c "SELECT 1;" >/dev/null 2>&1; then
    print_status "PostgreSQL connection verified"
else
    print_warning "PostgreSQL connection test failed"
fi

# Test Redis
if docker exec matesl_redis redis-cli ping >/dev/null 2>&1; then
    print_status "Redis connection verified"
else
    print_warning "Redis connection test failed"
fi

# Test shared package import
print_info "Testing shared package resolution..."
if node -e "require('./packages/shared/dist/index.js'); console.log('✅ Shared package works')" 2>/dev/null; then
    print_status "Shared package resolution verified"
else
    print_warning "Shared package resolution test failed"
fi

echo -e "\n${GREEN}"
echo "╔══════════════════════════════════════════════════╗"
echo "║                Setup Complete!                   ║"
echo "╚══════════════════════════════════════════════════╝"
echo -e "${NC}"

echo -e "\n${BLUE}📋 Next Steps:${NC}"
echo "1. Configure API keys in packages/ai-service/.env:"
echo "   - Get OpenAI API key: $(link_text_with_url 'https://platform.openai.com/api-keys' 'https://platform.openai.com/api-keys')"
echo "   - Get Hugging Face API key: $(link_text_with_url 'https://huggingface.co/settings/tokens' 'https://huggingface.co/settings/tokens')"
echo ""
echo "2. Start development servers (in separate terminals):"
echo -e "   ${YELLOW}Terminal 1:${NC} cd packages/ai-service && npm run dev"
echo -e "   ${YELLOW}Terminal 2:${NC} cd packages/api && npm run dev"
echo -e "   ${YELLOW}Terminal 3:${NC} cd packages/web && npm run dev"
echo ""
echo "3. Access your application:"
echo -e "   🌐 Web App: $(link_text_with_url 'http://localhost:3000' 'http://localhost:3000')"
echo -e "   🔧 API: $(link_text_with_url 'http://localhost:3001/health' 'http://localhost:3001/health')"
echo -e "   🤖 AI Service: $(link_text_with_url 'http://localhost:3003/health' 'http://localhost:3003/health')"
echo -e "   🗄️  Database Studio: $(link_text_with_url 'http://localhost:5555' 'http://localhost:5555')"
echo ""
echo "4. Database connections (updated ports):"
echo "   📊 PostgreSQL: localhost:5433"
echo "   🔴 Redis: localhost:6380"  
echo "   🔍 Elasticsearch: localhost:9201"
echo ""
echo "5. Start Database Studio (optional):"
echo -e "   ${YELLOW}${ITALIC}~ cd packages/database && npm run db:studio${NC}"
echo ""

echo -e "${YELLOW}⚠️  Important Notes:${NC}"
echo "• Updated ports used to avoid conflicts with local services"
echo "• The system will work without API keys but with limited AI features"
echo "• Make sure to keep your .env files secure and never commit them to git"
echo "• For production deployment, use strong JWT secrets and proper SSL certificates"
echo ""

echo -e "${BLUE}🚀 Quick Start Commands:${NC}"
echo "# Run setup (from project root)"
echo -e "${YELLOW}${ITALIC}~ cd scripts && ./setup.sh${NC}"
echo ""
echo "# Start all development servers"
echo -e "${YELLOW}${ITALIC}~ npm run dev${NC}"
echo ""
echo "# Or start individually:"
echo -e "${YELLOW}${ITALIC}~ cd packages/ai-service && npm run dev${NC}"
echo -e "${YELLOW}${ITALIC}~ cd packages/api && npm run dev${NC}"
echo -e "${YELLOW}${ITALIC}~ cd packages/web && npm run dev${NC}"
echo ""

print_status "Setup completed successfully! 🎉"
print_info "Check the README.md for detailed development instructions"
echo ""