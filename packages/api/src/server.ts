import Fastify from 'fastify';
import cors from '@fastify/cors';
import jwt from '@fastify/jwt';
import multipart from '@fastify/multipart';
import rateLimit from '@fastify/rate-limit';
import helmet from '@fastify/helmet';
import { DatabaseService } from '@matesl/database';
import { authRoutes } from './routes/auth.routes';
import { chatRoutes } from './routes/chat.routes';
import { procedureRoutes } from './routes/procedure.routes';
import { userRoutes } from './routes/user.routes';
import { adminRoutes } from './routes/admin.routes';
import { errorHandler } from './middleware/error.middleware';
import { authMiddleware } from './middleware/auth.middleware';
import dotenv from 'dotenv';

dotenv.config();

const fastify = Fastify({
  logger: {
    level: process.env.LOG_LEVEL || 'info',
    transport: process.env.NODE_ENV === 'development' ? {
      target: 'pino-pretty',
      options: {
        translateTime: 'HH:MM:ss Z',
        ignore: 'pid,hostname',
      },
    } : undefined,
  },
});

async function buildServer() {
  // Security
  await fastify.register(helmet, {
    contentSecurityPolicy: false, // We'll handle this separately for the frontend
  });

  // CORS
  await fastify.register(cors, {
    origin: [
      'http://localhost:3000',
      'http://localhost:3001',
      process.env.FRONTEND_URL || 'http://localhost:3000',
      process.env.ADMIN_URL || 'http://localhost:3002',
    ],
    credentials: true,
  });

  // Rate limiting
  await fastify.register(rateLimit, {
    max: 100, // 100 requests
    timeWindow: '1 minute',
    redis: process.env.REDIS_URL ? undefined : null,
  });

  // JWT
  await fastify.register(jwt, {
    secret: process.env.JWT_SECRET || 'fallback-secret-change-in-production',
    sign: {
      expiresIn: process.env.JWT_EXPIRE || '15m',
    },
  });

  // Multipart/form-data support
  await fastify.register(multipart, {
    limits: {
      fileSize: 5 * 1024 * 1024, // 5MB
    },
  });

  // Database connection
  await DatabaseService.connect();

  // Register middleware
  fastify.register(authMiddleware);
  fastify.register(errorHandler);

  // Health check
  fastify.get('/health', async () => {
    const dbHealth = await DatabaseService.healthCheck();
    return {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      database: dbHealth.success ? 'connected' : 'disconnected',
      version: process.env.npm_package_version || '1.0.0',
    };
  });

  // API routes
  fastify.register(authRoutes, { prefix: '/api/v1/auth' });
  fastify.register(chatRoutes, { prefix: '/api/v1/chat' });
  fastify.register(procedureRoutes, { prefix: '/api/v1/procedures' });
  fastify.register(userRoutes, { prefix: '/api/v1/users' });
  fastify.register(adminRoutes, { prefix: '/api/v1/admin' });

  // 404 handler
  fastify.setNotFoundHandler(async (request, reply) => {
    reply.status(404).send({
      success: false,
      error: 'Route not found',
      message: `${request.method} ${request.url} not found`,
    });
  });

  return fastify;
}

// Start server
async function start() {
  try {
    const server = await buildServer();
    const port = parseInt(process.env.PORT || '3001');
    const host = process.env.HOST || '0.0.0.0';

    await server.listen({ port, host });
    console.log(`🚀 API Server running on http://${host}:${port}`);
  } catch (err) {
    console.error('Server start error:', err);
    process.exit(1);
  }
}

if (require.main === module) {
  start();
}

export { buildServer };