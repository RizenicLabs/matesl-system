# MateSL Knowledge Guide

## 1. What is Prisma and How Does It Work?

**Prisma** is a modern database toolkit that acts as a bridge between your application and your database. It consists of three main components:

### Core Components:

- **Prisma Schema**: A declarative way to define your database structure using a simple syntax
- **Prisma Client**: Auto-generated, type-safe database client for your application
- **Prisma Studio**: Visual database browser to view and edit data

### How It Works:

1. **Define Schema**: You write your database models in `schema.prisma`
2. **Generate Client**: Prisma generates a type-safe client based on your schema
3. **Database Operations**: Use the client to perform CRUD operations with full TypeScript support
4. **Migrations**: Prisma can create and manage database migrations automatically

### In Our Project:

```
packages/database/
├── prisma/
│   └── schema.prisma     # Database schema definition
├── src/
│   ├── generated/        # Auto-generated Prisma client
│   └── seed/            # Database seeding scripts
```

### Benefits:

- **Type Safety**: Full TypeScript support with auto-completion
- **Migration Management**: Automated database schema changes
- **Query Builder**: Intuitive API for database operations
- **Multi-database Support**: Works with PostgreSQL, MySQL, SQLite, etc.

---

## 2. What is PostgreSQL and How Does It Work?

**PostgreSQL** is a powerful, open-source relational database management system (RDBMS) that stores and manages your application data.

### Key Features:

- **ACID Compliance**: Ensures data integrity with Atomicity, Consistency, Isolation, Durability
- **SQL Support**: Full SQL standard compliance with advanced features
- **JSON Support**: Native JSON data types for flexible data storage
- **Extensibility**: Custom functions, data types, and extensions
- **Concurrent Access**: Multiple users can access data simultaneously

### How It Works:

1. **Data Storage**: Stores data in tables with rows and columns
2. **Query Processing**: Executes SQL queries to retrieve and manipulate data
3. **Transaction Management**: Ensures data consistency across operations
4. **Indexing**: Optimizes query performance using various index types

### In Our Project:

- **Host**: `localhost:5433` (containerized to avoid conflicts)
- **Database**: `matesl`
- **User**: `postgres`
- **Usage**: Stores users, procedures, offices, chat sessions, etc.

### Our Database Structure:

```
- users (User accounts)
- procedures (Government procedures)
- offices (Government offices)
- chat_sessions (AI chat conversations)
- chat_messages (Individual chat messages)
- faqs (Frequently asked questions)
- search_history (User search logs)
```

---

## 3. How to Check Seeded Data in Database?

You have several ways to view and interact with your database:

### Method 1: Prisma Studio (Recommended)

```bash
cd packages/database
npm run db:studio
```

- **URL**: http://localhost:5555
- **Features**: Visual interface, edit data, browse relationships
- **Best for**: Development and debugging

### Method 2: Database Client Tools

Popular PostgreSQL clients:

- **pgAdmin**: Full-featured web-based administration
- **DBeaver**: Universal database tool
- **TablePlus**: Modern database client (macOS/Windows)
- **psql**: Command-line PostgreSQL client

### Connection Details:

```
Host: localhost
Port: 5433
Database: matesl
Username: postgres
Password: postgres123
```

### Method 3: Direct Docker Access

```bash
# Connect to PostgreSQL container
docker exec -it matesl_postgres psql -U postgres -d matesl

# Example queries:
SELECT * FROM users;
SELECT * FROM procedures;
SELECT * FROM offices;
```

### Method 4: API Endpoints

Once your API is running, you can access data through REST endpoints:

```
GET http://localhost:3001/api/procedures
GET http://localhost:3001/api/offices
GET http://localhost:3001/api/faqs
```

---

## 4. What Does the setup.sh Script Do?

The `setup.sh` script is an automated setup tool that prepares your entire development environment. Here's what it does:

### Phase 1: Prerequisites Check

- ✅ Validates Node.js version (18+)
- ✅ Checks npm availability
- ✅ Verifies Docker and Docker Compose
- ✅ Detects port conflicts and suggests alternatives

### Phase 2: Environment Preparation

- 🧹 Cleans up existing Docker containers
- 📦 Installs root and workspace dependencies
- 🔨 Builds the shared package first (dependency for others)

### Phase 3: Database Services

- 🐳 Starts PostgreSQL (port 5433)
- 🔴 Starts Redis (port 6380)
- 🔍 Starts Elasticsearch (port 9201)
- ⏳ Waits for all services to be healthy

### Phase 4: Database Setup

- 🎯 Generates Prisma client
- 📊 Pushes database schema to PostgreSQL
- 🌱 Seeds database with sample data
- 🔨 Builds database package

### Phase 5: Build Process

- 🤖 Builds AI service package
- 🌐 Builds API service package
- ✅ Verifies all connections

### Phase 6: Final Verification

- 🔍 Tests database connections
- 📋 Provides next steps and access URLs
- 🚀 Shows quick start commands

### Services Started:

| Service       | Port | Purpose              |
| ------------- | ---- | -------------------- |
| PostgreSQL    | 5433 | Main database        |
| Redis         | 6380 | Caching & sessions   |
| Elasticsearch | 9201 | Search functionality |
| Prisma Studio | 5555 | Database management  |

### Key Files Created/Modified:

- `packages/database/src/generated/client/` - Prisma client
- Database populated with sample users, procedures, offices, FAQs
- Docker containers configured and running

### After Setup:

The script leaves you with a fully configured development environment where you can immediately start the development servers and begin coding.

---

## Quick Reference Commands

### Database Operations:

```bash
# Generate Prisma client
npm run db:generate

# Push schema changes
npm run db:push

# Create migration
npm run db:migrate

# Reset database
npm run db:reset

# Seed database
npm run db:seed

# Open Prisma Studio
npm run db:studio
```

### Development:

```bash
# Start all services
npm run dev

# Start individual services
cd packages/ai-service && npm run dev
cd packages/api && npm run dev
cd packages/web && npm run dev
```

### Database Access:

```bash
# Direct PostgreSQL access
docker exec -it matesl_postgres psql -U postgres -d matesl

# Redis CLI
docker exec -it matesl_redis redis-cli
```

---

## Troubleshooting

### Common Issues:

1. **Port Conflicts**: Script handles this by using alternative ports
2. **Permission Issues**: Ensure Docker daemon is running
3. **Build Failures**: Check Node.js version and dependencies
4. **Database Connection**: Verify containers are running with `docker ps`

### Useful Commands:

```bash
# Check running containers
docker ps

# View container logs
docker logs matesl_postgres
docker logs matesl_redis

# Restart services
docker-compose -f docker-compose.dev.yml restart

# Clean start
docker-compose -f docker-compose.dev.yml down -v
./setup.sh
```
