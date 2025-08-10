import { FastifyPluginAsync } from 'fastify';
import { AdminController } from '../controllers/admin.controller';

export const adminRoutes: FastifyPluginAsync = async (fastify) => {
  const adminController = new AdminController();

  // Admin authentication middleware
  const adminAuth = async (request: any, reply: any) => {
    await fastify.authenticate(request, reply);
    if (!['ADMIN', 'SUPER_ADMIN'].includes(request.user.role)) {
      reply.status(403).send({ error: 'Admin access required' });
    }
  };

  // Dashboard statistics
  fastify.get('/dashboard', {
    preHandler: [adminAuth],
    handler: adminController.getDashboardStats.bind(adminController),
  });

  // Manage users
  fastify.get('/users', {
    preHandler: [adminAuth],
    schema: {
      querystring: {
        type: 'object',
        properties: {
          page: { type: 'number', default: 1 },
          limit: { type: 'number', default: 20 },
          search: { type: 'string' },
          role: { type: 'string' },
        },
      },
    },
    handler: adminController.getUsers.bind(adminController),
  });

  // Update user role
  fastify.put('/users/:id/role', {
    preHandler: [adminAuth],
    schema: {
      params: {
        type: 'object',
        required: ['id'],
        properties: {
          id: { type: 'string' },
        },
      },
      body: {
        type: 'object',
        required: ['role'],
        properties: {
          role: { type: 'string', enum: ['CITIZEN', 'ADMIN', 'CONTENT_MANAGER', 'SUPER_ADMIN'] },
        },
      },
    },
    handler: adminController.updateUserRole.bind(adminController),
  });

  // Chat analytics
  fastify.get('/analytics/chats', {
    preHandler: [adminAuth],
    schema: {
      querystring: {
        type: 'object',
        properties: {
          startDate: { type: 'string', format: 'date' },
          endDate: { type: 'string', format: 'date' },
          groupBy: { type: 'string', enum: ['day', 'week', 'month'], default: 'day' },
        },
      },
    },
    handler: adminController.getChatAnalytics.bind(adminController),
  });

  // Procedure analytics
  fastify.get('/analytics/procedures', {
    preHandler: [adminAuth],
    handler: adminController.getProcedureAnalytics.bind(adminController),
  });

  // System health
  fastify.get('/system/health', {
    preHandler: [adminAuth],
    handler: adminController.getSystemHealth.bind(adminController),
  });

  // Clear cache
  fastify.delete('/cache', {
    preHandler: [adminAuth],
    schema: {
      querystring: {
        type: 'object',
        properties: {
          pattern: { type: 'string', default: '*' },
        },
      },
    },
    handler: adminController.clearCache.bind(adminController),
  });
};