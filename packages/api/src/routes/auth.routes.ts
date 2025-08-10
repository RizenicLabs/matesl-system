import { FastifyPluginAsync } from 'fastify';
import { AuthController } from '../controllers/auth.controller';
import { LoginRequestSchema, RegisterRequestSchema } from '@matesl/shared';

export const authRoutes: FastifyPluginAsync = async (fastify) => {
  const authController = new AuthController();

  // Register
  fastify.post('/register', {
    schema: {
      body: RegisterRequestSchema,
      response: {
        201: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            data: {
              type: 'object',
              properties: {
                user: {
                  type: 'object',
                  properties: {
                    id: { type: 'string' },
                    email: { type: 'string' },
                    name: { type: 'string' },
                    role: { type: 'string' },
                  },
                },
                tokens: {
                  type: 'object',
                  properties: {
                    accessToken: { type: 'string' },
                    refreshToken: { type: 'string' },
                  },
                },
              },
            },
            message: { type: 'string' },
          },
        },
      },
    },
    handler: authController.register.bind(authController),
  });

  // Login
  fastify.post('/login', {
    schema: {
      body: LoginRequestSchema,
    },
    handler: authController.login.bind(authController),
  });

  // Refresh token
  fastify.post('/refresh', {
    schema: {
      body: {
        type: 'object',
        required: ['refreshToken'],
        properties: {
          refreshToken: { type: 'string' },
        },
      },
    },
    handler: authController.refreshToken.bind(authController),
  });

  // Logout
  fastify.post('/logout', {
    preHandler: [fastify.authenticate],
    handler: authController.logout.bind(authController),
  });

  // Google OAuth - Start
  fastify.get('/google', {
    handler: authController.googleAuth.bind(authController),
  });

  // Google OAuth - Callback
  fastify.get('/google/callback', {
    handler: authController.googleCallback.bind(authController),
  });

  // Get current user
  fastify.get('/me', {
    preHandler: [fastify.authenticate],
    handler: authController.getCurrentUser.bind(authController),
  });

  // Verify email
  fastify.post('/verify-email', {
    schema: {
      body: {
        type: 'object',
        required: ['token'],
        properties: {
          token: { type: 'string' },
        },
      },
    },
    handler: authController.verifyEmail.bind(authController),
  });

  // Forgot password
  fastify.post('/forgot-password', {
    schema: {
      body: {
        type: 'object',
        required: ['email'],
        properties: {
          email: { type: 'string', format: 'email' },
        },
      },
    },
    handler: authController.forgotPassword.bind(authController),
  });

  // Reset password
  fastify.post('/reset-password', {
    schema: {
      body: {
        type: 'object',
        required: ['token', 'password'],
        properties: {
          token: { type: 'string' },
          password: { type: 'string', minLength: 6 },
        },
      },
    },
    handler: authController.resetPassword.bind(authController),
  });
};