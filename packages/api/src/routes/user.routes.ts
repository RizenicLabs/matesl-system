import { FastifyPluginAsync } from 'fastify';
import { UserController } from '../controllers/user.controller';

export const userRoutes: FastifyPluginAsync = async (fastify) => {
  const userController = new UserController();

  // Get user profile
  fastify.get('/profile', {
    preHandler: [fastify.authenticate],
    handler: userController.getProfile.bind(userController),
  });

  // Update user profile
  fastify.put('/profile', {
    preHandler: [fastify.authenticate],
    schema: {
      body: {
        type: 'object',
        properties: {
          name: { type: 'string' },
          avatar: { type: 'string' },
        },
      },
    },
    handler: userController.updateProfile.bind(userController),
  });

  // Change password
  fastify.put('/password', {
    preHandler: [fastify.authenticate],
    schema: {
      body: {
        type: 'object',
        required: ['currentPassword', 'newPassword'],
        properties: {
          currentPassword: { type: 'string' },
          newPassword: { type: 'string', minLength: 6 },
        },
      },
    },
    handler: userController.changePassword.bind(userController),
  });

  // Delete account
  fastify.delete('/account', {
    preHandler: [fastify.authenticate],
    schema: {
      body: {
        type: 'object',
        required: ['password'],
        properties: {
          password: { type: 'string' },
        },
      },
    },
    handler: userController.deleteAccount.bind(userController),
  });

  // Get user statistics
  fastify.get('/stats', {
    preHandler: [fastify.authenticate],
    handler: userController.getUserStats.bind(userController),
  });

  // Upload avatar
  fastify.post('/avatar', {
    preHandler: [fastify.authenticate],
    handler: userController.uploadAvatar.bind(userController),
  });
};