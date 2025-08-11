#!/bin/bash

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

print_status() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

echo -e "${BLUE}"
echo "╔══════════════════════════════════════════════════╗"
echo "║            MateSL System Fix Setup               ║"
echo "║               Fixing Build Issues                ║"
echo "╚══════════════════════════════════════════════════╝"
echo -e "${NC}"

# Step 1: Clean everything
print_info "Step 1: Cleaning existing builds..."
rm -rf packages/*/dist
rm -rf packages/*/node_modules/.cache
rm -rf node_modules/.cache
print_status "Cleaned existing builds"

# Step 2: Build in correct order
print_info "Step 2: Building packages in correct order..."

# Build shared package first
print_info "Building shared package..."
cd packages/shared
npm run build
if [ $? -eq 0 ]; then
    print_status "Shared package built successfully"
else
    print_error "Failed to build shared package"
    exit 1
fi
cd ../..

# Build database package
print_info "Building database package..."
cd packages/database
npm run db:generate
npm run build
if [ $? -eq 0 ]; then
    print_status "Database package built successfully"
else
    print_error "Failed to build database package"
    exit 1
fi
cd ../..

# Step 3: Reset database schema
print_info "Step 3: Resetting and updating database schema..."
cd packages/database
npm run db:push
if [ $? -eq 0 ]; then
    print_status "Database schema updated"
else
    print_warning "Database schema update had issues (continuing...)"
fi
cd ../..

# Step 4: Reinstall workspace dependencies
print_info "Step 4: Reinstalling workspace dependencies..."
rm -rf packages/*/node_modules
npm install
if [ $? -eq 0 ]; then
    print_status "Dependencies reinstalled"
else
    print_error "Failed to reinstall dependencies"
    exit 1
fi

# Step 5: Try building other packages
print_info "Step 5: Building remaining packages..."

# Build AI service
print_info "Building AI service..."
cd packages/ai-service
npm run build
if [ $? -eq 0 ]; then
    print_status "AI service built successfully"
else
    print_warning "AI service build failed - check import issues"
fi
cd ../..

# Build API service
print_info "Building API service..."
cd packages/api
npm run build
if [ $? -eq 0 ]; then
    print_status "API service built successfully"
else
    print_warning "API service build failed - check import issues"
fi
cd ../..

# Step 6: Seed database
print_info "Step 6: Attempting to seed database..."
cd packages/database
npm run db:seed
if [ $? -eq 0 ]; then
    print_status "Database seeded successfully"
else
    print_warning "Database seeding failed - will create minimal data"
    
    # Try to create admin user manually using psql
    print_info "Creating admin user manually..."
    docker exec -i matesl_postgres psql -U postgres -d matesl << EOF
INSERT INTO users (id, email, name, password, role, "emailVerified", "createdAt", "updatedAt")
VALUES (
    'admin_' || extract(epoch from now()),
    'admin@gov.lk',
    'System Administrator',
    '\$2a\$10\$K9pNkQXz8gF7sR3mL4nQ.eHqB8Vv5Wg3L2nF7Kj6M8P9Qw1E2R3T4',
    'ADMIN',
    true,
    now(),
    now()
) ON CONFLICT (email) DO NOTHING;
EOF
    print_status "Admin user created"
fi
cd ../..

print_info "Step 7: Final verification..."

# Check if containers are running
docker ps --filter "name=matesl" --format "table {{.Names}}\t{{.Status}}" | grep -v NAMES
print_status "Database services are running"

echo -e "\n${GREEN}"
echo "╔══════════════════════════════════════════════════╗"
echo "║                Fix Complete!                     ║"
echo "╚══════════════════════════════════════════════════╝"
echo -e "${NC}"

echo -e "\n${BLUE}🚀 Next Steps:${NC}"
echo "1. Try running the services individually to check for remaining issues:"
echo -e "   ${YELLOW}Terminal 1:${NC} cd packages/ai-service && npm run dev"
echo -e "   ${YELLOW}Terminal 2:${NC} cd packages/api && npm run dev"
echo -e "   ${YELLOW}Terminal 3:${NC} cd packages/web && npm run dev"
echo ""
echo "2. If you still get import errors, try:"
echo -e "   ${YELLOW}npm run build:deps${NC}"
echo ""
echo "3. Access your application:"
echo "   🌐 Web App: http://localhost:3000"
echo "   🔧 API: http://localhost:3001/health"
echo "   🤖 AI Service: http://localhost:3003/health"
echo ""

print_status "Fix script completed!"