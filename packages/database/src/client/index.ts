import { PrismaClient } from '../generated/client';
import { createSuccessResponse, createErrorResponse } from '@matesl/shared';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma = globalForPrisma.prisma ?? new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
});

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

export class DatabaseService {
  static async connect() {
    try {
      await prisma.$connect();
      console.log('✅ Database connected successfully');
      return createSuccessResponse(null, 'Database connected');
    } catch (error) {
      console.error('❌ Database connection failed:', error);
      return createErrorResponse('Database connection failed');
    }
  }

  static async disconnect() {
    try {
      await prisma.$disconnect();
      console.log('✅ Database disconnected successfully');
      return createSuccessResponse(null, 'Database disconnected');
    } catch (error) {
      console.error('❌ Database disconnection failed:', error);
      return createErrorResponse('Database disconnection failed');
    }
  }

  static async healthCheck() {
    try {
      await prisma.$queryRaw`SELECT 1`;
      return createSuccessResponse({ status: 'healthy' });
    } catch (error) {
      return createErrorResponse('Database health check failed');
    }
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