import { FastifyPluginAsync, FastifyRequest, FastifyReply } from 'fastify';
import fp from 'fastify-plugin';
import { AuthService } from '../services/auth.service';

declare module 'fastify' {
  interface FastifyRequest {
    user?: {
      id: string;
      email: string;
      name: string;
      role: string;
    };
  }
}

const authService = new AuthService();

export const authMiddleware: FastifyPluginAsync = fp(async (fastify) => {
  // Optional authentication - doesn't require auth but adds user if token exists
  fastify.decorate('optionalAuth', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const token = extractToken(request);
      if (!token) return; // No token, continue without user

      const decoded = authService.verifyToken(token);
      if (!decoded) return; // Invalid token, continue without user

      const userResult = await authService.getUserById(decoded.userId);
      if (userResult.success) {
        request.user = userResult.data;
      }
    } catch (error) {
      // Log error but don't fail the request
      console.warn('Optional auth error:', error);
    }
  });

  // Required authentication - throws error if no valid token
  fastify.decorate('requireAuth', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const token = extractToken(request);
      if (!token) {
        reply.status(401).send({
          success: false,
          error: 'Access token required',
        });
        return;
      }

      const decoded = authService.verifyToken(token);
      if (!decoded) {
        reply.status(401).send({
          success: false,
          error: 'Invalid or expired token',
        });
        return;
      }

      const userResult = await authService.getUserById(decoded.userId);
      if (!userResult.success || !userResult.data) {
        reply.status(401).send({
          success: false,
          error: 'User not found',
        });
        return;
      }

      request.user = userResult.data;
    } catch (error) {
      console.error('Auth middleware error:', error);
      reply.status(500).send({
        success: false,
        error: 'Authentication failed',
      });
    }
  });

  // Role-based authorization
  fastify.decorate('requireRole', (allowedRoles: string[]) => {
    return async (request: FastifyRequest, reply: FastifyReply) => {
      if (!request.user) {
        reply.status(401).send({
          success: false,
          error: 'Authentication required',
        });
        return;
      }

      if (!allowedRoles.includes(request.user.role)) {
        reply.status(403).send({
          success: false,
          error: 'Insufficient permissions',
        });
        return;
      }
    };
  });
});

function extractToken(request: FastifyRequest): string | null {
  const authHeader = request.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7);
  }

  // Also check query params for WebSocket connections
  const tokenFromQuery = (request.query as any)?.token;
  if (tokenFromQuery) {
    return tokenFromQuery;
  }

  return null;
}

declare module 'fastify' {
  interface FastifyInstance {
    optionalAuth: (request: FastifyRequest, reply: FastifyReply) => Promise<void>;
    requireAuth: (request: FastifyRequest, reply: FastifyReply) => Promise<void>;
    requireRole: (roles: string[]) => (request: FastifyRequest, reply: FastifyReply) => Promise<void>;
  }
}