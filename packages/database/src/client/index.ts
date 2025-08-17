import { PrismaClient } from '../generated/client';
import { createSuccessResponse, createErrorResponse } from '@matesl/shared';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log:
      process.env.NODE_ENV === 'development'
        ? ['query', 'error', 'warn']
        : ['error'],
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

export class DatabaseService {
  private client: PrismaClient;

  constructor() {
    this.client = prisma;
  }

  static async connect() {
    try {
      await prisma.$connect();
      console.log('✅ Database connected successfully');
      return createSuccessResponse('Database connected', null);
    } catch (error) {
      console.error('❌ Database connection failed:', error);
      return createErrorResponse('Database connection failed');
    }
  }

  static async disconnect() {
    try {
      await prisma.$disconnect();
      console.log('✅ Database disconnected successfully');
      return createSuccessResponse('Database disconnected', null);
    } catch (error) {
      console.error('❌ Database disconnection failed:', error);
      return createErrorResponse('Database disconnection failed');
    }
  }

  static async healthCheck() {
    try {
      await prisma.$queryRaw`SELECT 1`;
      return createSuccessResponse('Database service works!', {
        status: 'healthy',
      });
    } catch (error) {
      return createErrorResponse('Database health check failed');
    }
  }

  getClient() {
    return this.client;
  }
}

// Graceful shutdown
process.on('SIGINT', async () => {
  await DatabaseService.disconnect();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  await DatabaseService.disconnect();
  process.exit(0);
});

// Export types
export * from '../generated/client';
