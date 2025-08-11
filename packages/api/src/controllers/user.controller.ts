import { FastifyRequest, FastifyReply } from 'fastify';
import {
  createSuccessResponse,
  createErrorResponse,
  UpdateProfileRequest,
  ChangePasswordRequest,
} from '@matesl/shared';
import { prisma } from '@matesl/database';
import bcrypt from 'bcryptjs';

export class UserController {
  async getProfile(request: FastifyRequest, reply: FastifyReply) {
    try {
      const userId = (request as any).user.id;

      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          email: true,
          name: true,
          avatar: true,
          role: true,
          createdAt: true,
          updatedAt: true,
          emailVerified: true,
        },
      });

      if (!user) {
        return reply.code(404).send(createErrorResponse('User not found'));
      }

      return reply.send(createSuccessResponse('Profile retrieved', user));
    } catch (error) {
      return reply
        .code(500)
        .send(
          createErrorResponse(
            'Failed to get profile',
            error instanceof Error ? error.message : 'Unknown error'
          )
        );
    }
  }

  async updateProfile(
    request: FastifyRequest<{ Body: UpdateProfileRequest }>,
    reply: FastifyReply
  ) {
    try {
      const userId = (request as any).user.id;
      const name = (request.body as any).name;
      const email = (request.body as any).email;
      const avatar = (request.body as any).avatar;

      // Check if email is already taken by another user
      if (email) {
        const existingUser = await prisma.user.findFirst({
          where: {
            email,
            id: { not: userId },
          },
        });

        if (existingUser) {
          return reply
            .code(400)
            .send(createErrorResponse('Email already in use'));
        }
      }

      const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: {
          ...(name && { name }),
          ...(email && { email, emailVerified: false }), // Reset email verification if email changes
          ...(avatar && { avatar }),
        },
        select: {
          id: true,
          email: true,
          name: true,
          avatar: true,
          role: true,
          updatedAt: true,
          emailVerified: true,
        },
      });

      return reply.send(createSuccessResponse('Profile updated', updatedUser));
    } catch (error) {
      return reply
        .code(500)
        .send(
          createErrorResponse(
            'Failed to update profile',
            error instanceof Error ? error.message : 'Unknown error'
          )
        );
    }
  }

  async changePassword(
    request: FastifyRequest<{ Body: ChangePasswordRequest }>,
    reply: FastifyReply
  ) {
    try {
      const userId = (request as any).user.id;
      const currentPassword = (request.body as any).currentPassword;
      const newPassword = (request.body as any).newPassword;

      // Get current user with password
      const user = await prisma.user.findUnique({
        where: { id: userId },
      });

      if (!user || !user.password) {
        return reply
          .code(400)
          .send(createErrorResponse('Invalid user or password not set'));
      }

      // Verify current password
      const isValidPassword = await bcrypt.compare(
        currentPassword,
        user.password
      );
      if (!isValidPassword) {
        return reply
          .code(400)
          .send(createErrorResponse('Current password is incorrect'));
      }

      // Hash new password
      const hashedNewPassword = await bcrypt.hash(newPassword, 10);

      // Update password
      await prisma.user.update({
        where: { id: userId },
        data: { password: hashedNewPassword },
      });

      return reply.send(createSuccessResponse('Password changed successfully'));
    } catch (error) {
      return reply
        .code(500)
        .send(
          createErrorResponse(
            'Failed to change password',
            error instanceof Error ? error.message : 'Unknown error'
          )
        );
    }
  }

  async getChatHistory(
    request: FastifyRequest<{
      Querystring: { limit?: number; offset?: number };
    }>,
    reply: FastifyReply
  ) {
    try {
      const userId = (request as any).user.id;
      const { limit = 20, offset = 0 } = request.query;

      const sessions = await prisma.chatSession.findMany({
        where: { userId },
        include: {
          messages: {
            orderBy: { timestamp: 'asc' },
            take: 5, // Preview only last 5 messages per session
          },
        },
        orderBy: { updatedAt: 'desc' },
        skip: offset,
        take: limit,
      });

      const total = await prisma.chatSession.count({
        where: { userId },
      });

      const result = {
        sessions,
        pagination: {
          page: Math.floor(offset / limit) + 1,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      };

      return reply.send(
        createSuccessResponse('Chat history retrieved', result)
      );
    } catch (error) {
      return reply
        .code(500)
        .send(
          createErrorResponse(
            'Failed to get chat history',
            error instanceof Error ? error.message : 'Unknown error'
          )
        );
    }
  }

  async deleteAccount(request: FastifyRequest, reply: FastifyReply) {
    try {
      const userId = (request as any).user.id;

      // Delete user and cascade delete related data
      await prisma.user.delete({
        where: { id: userId },
      });

      return reply.send(createSuccessResponse('Account deleted successfully'));
    } catch (error) {
      return reply
        .code(500)
        .send(
          createErrorResponse(
            'Failed to delete account',
            error instanceof Error ? error.message : 'Unknown error'
          )
        );
    }
  }

  async getSearchHistory(
    request: FastifyRequest<{
      Querystring: { limit?: number; offset?: number };
    }>,
    reply: FastifyReply
  ) {
    try {
      const userId = (request as any).user.id;
      const { limit = 20, offset = 0 } = request.query;

      const searches = await prisma.searchHistory.findMany({
        where: { userId },
        include: {
          procedure: {
            select: {
              id: true,
              title: true,
              slug: true,
              category: true,
            },
          },
        },
        orderBy: { timestamp: 'desc' },
        skip: offset,
        take: limit,
      });

      const total = await prisma.searchHistory.count({
        where: { userId },
      });

      const result = {
        searches,
        pagination: {
          page: Math.floor(offset / limit) + 1,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      };

      return reply.send(
        createSuccessResponse('Search history retrieved', result)
      );
    } catch (error) {
      return reply
        .code(500)
        .send(
          createErrorResponse(
            'Failed to get search history',
            error instanceof Error ? error.message : 'Unknown error'
          )
        );
    }
  }
}
