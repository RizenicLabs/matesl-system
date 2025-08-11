import { FastifyRequest, FastifyReply } from 'fastify';
import { createSuccessResponse, createErrorResponse } from '@matesl/shared';
import { prisma } from '@matesl/database';

export class AdminController {
  async getDashboardStats(request: FastifyRequest, reply: FastifyReply) {
    try {
      const [
        totalUsers,
        totalProcedures,
        activeProcedures,
        totalSessions,
        recentMessages,
      ] = await Promise.all([
        prisma.user.count(),
        prisma.procedure.count(),
        prisma.procedure.count({ where: { status: 'ACTIVE' } }),
        prisma.chatSession.count(),
        prisma.chatMessage.count({
          where: {
            timestamp: {
              gte: new Date(Date.now() - 24 * 60 * 60 * 1000), // Last 24 hours
            },
          },
        }),
      ]);

      const stats = {
        totalUsers,
        totalProcedures,
        activeProcedures,
        totalSessions,
        recentMessages,
      };

      return reply.send(
        createSuccessResponse('Dashboard stats retrieved', stats)
      );
    } catch (error) {
      return reply
        .code(500)
        .send(
          createErrorResponse(
            'Failed to get dashboard stats',
            error instanceof Error ? error.message : 'Unknown error'
          )
        );
    }
  }

  async getUsers(request: FastifyRequest, reply: FastifyReply) {
    try {
      const users = await prisma.user.findMany({
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          isActive: true,
          createdAt: true,
          updatedAt: true,
        },
        orderBy: { createdAt: 'desc' },
      });

      return reply.send(createSuccessResponse('Users retrieved', users));
    } catch (error) {
      return reply
        .code(500)
        .send(
          createErrorResponse(
            'Failed to get users',
            error instanceof Error ? error.message : 'Unknown error'
          )
        );
    }
  }

  async updateUserRole(
    request: FastifyRequest<{
      Params: { userId: string };
      Body: { role: string };
    }>,
    reply: FastifyReply
  ) {
    try {
      const { userId } = request.params;
      const { role } = request.body;

      const user = await prisma.user.update({
        where: { id: userId },
        data: { role: role as any },
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          updatedAt: true,
        },
      });

      return reply.send(createSuccessResponse('User role updated', user));
    } catch (error) {
      return reply
        .code(500)
        .send(
          createErrorResponse(
            'Failed to update user role',
            error instanceof Error ? error.message : 'Unknown error'
          )
        );
    }
  }

  async getProcedures(request: FastifyRequest, reply: FastifyReply) {
    try {
      const procedures = await prisma.procedure.findMany({
        include: {
          _count: {
            select: {
              steps: true,
              requirements: true,
              fees: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      });

      return reply.send(
        createSuccessResponse('Procedures retrieved', procedures)
      );
    } catch (error) {
      return reply
        .code(500)
        .send(
          createErrorResponse(
            'Failed to get procedures',
            error instanceof Error ? error.message : 'Unknown error'
          )
        );
    }
  }
}
