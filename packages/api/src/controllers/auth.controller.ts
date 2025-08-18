import { FastifyRequest, FastifyReply } from 'fastify';
import { AuthService } from '../services/auth.service';
import { createSuccessResponse, createErrorResponse } from '@matesl/shared';

export class AuthController {
  private authService: AuthService;

  constructor() {
    this.authService = new AuthService();
  }

  async register(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { email, password, name } = request.body as any;
      const result = await this.authService.register({ email, password, name });

      if (!result.success) {
        reply.status(400);
        return createErrorResponse(result.error || 'Registration failed');
      }

      reply.status(201);
      return createSuccessResponse(result.data, 'User registered successfully');
    } catch (error) {
      reply.status(500);
      return createErrorResponse('Internal server error');
    }
  }

  async login(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { email, password } = request.body as any;
      const result = await this.authService.login(email, password);

      if (!result.success) {
        reply.status(401);
        return createErrorResponse(result.error || 'Login failed');
      }

      return createSuccessResponse(result.data, 'Login successful');
    } catch (error) {
      reply.status(500);
      return createErrorResponse('Internal server error');
    }
  }

  async refreshToken(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { refreshToken } = request.body as any;
      const result = await this.authService.refreshToken(refreshToken);

      if (!result.success) {
        reply.status(401);
        return createErrorResponse(result.error || 'Token refresh failed');
      }

      return createSuccessResponse(result.data, 'Token refreshed successfully');
    } catch (error) {
      reply.status(500);
      return createErrorResponse('Internal server error');
    }
  }

  async logout(request: FastifyRequest, reply: FastifyReply) {
    try {
      const userId = (request as any).user.id;
      await this.authService.logout(userId);
      return createSuccessResponse(null, 'Logout successful');
    } catch (error) {
      reply.status(500);
      return createErrorResponse('Internal server error');
    }
  }

  async googleAuth(request: FastifyRequest, reply: FastifyReply) {
    try {
      const authUrl = await this.authService.getGoogleAuthUrl();
      reply.redirect(authUrl);
    } catch (error) {
      reply.status(500);
      return createErrorResponse('Google auth initialization failed');
    }
  }

  async googleCallback(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { code } = request.query as any;
      const result = await this.authService.handleGoogleCallback(code);

      if (!result.success) {
        reply.status(400);
        return createErrorResponse(result.error || 'Google auth failed');
      }

      // Redirect to frontend with tokens
      const { accessToken, refreshToken } = result.data.tokens;
      const redirectUrl = `${process.env.FRONTEND_URL}/auth/callback?token=${accessToken}&refresh=${refreshToken}`;
      reply.redirect(redirectUrl);
    } catch (error) {
      reply.status(500);
      return createErrorResponse('Google auth callback failed');
    }
  }

  async getCurrentUser(request: FastifyRequest, reply: FastifyReply) {
    try {
      const userId = (request as any).user.id;
      const user = await this.authService.getCurrentUser(userId);

      if (!user) {
        reply.status(404);
        return createErrorResponse('User not found');
      }

      return createSuccessResponse(user);
    } catch (error) {
      reply.status(500);
      return createErrorResponse('Internal server error');
    }
  }

  async verifyEmail(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { token } = request.body as any;
      const result = await this.authService.verifyEmail(token);

      if (!result.success) {
        reply.status(400);
        return createErrorResponse(result.error || 'Email verification failed');
      }

      return createSuccessResponse(null, 'Email verified successfully');
    } catch (error) {
      reply.status(500);
      return createErrorResponse('Internal server error');
    }
  }

  async forgotPassword(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { email } = request.body as any;
      const result = await this.authService.forgotPassword(email);

      // Always return success for security (don't reveal if email exists)
      return createSuccessResponse(
        null,
        'If the email exists, a reset link has been sent'
      );
    } catch (error) {
      reply.status(500);
      return createErrorResponse('Internal server error');
    }
  }

  async resetPassword(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { token, password } = request.body as any;
      const result = await this.authService.resetPassword(token, password);

      if (!result.success) {
        reply.status(400);
        return createErrorResponse(result.error || 'Password reset failed');
      }

      return createSuccessResponse(null, 'Password reset successfully');
    } catch (error) {
      reply.status(500);
      return createErrorResponse('Internal server error');
    }
  }
}
