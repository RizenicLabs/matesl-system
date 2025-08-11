import { FastifyRequest, FastifyReply } from 'fastify';
import {
  createSuccessResponse,
  createErrorResponse,
  SearchRequest,
} from '@matesl/shared';
import { prisma } from '@matesl/database';

export class ProcedureController {
  async searchProcedures(
    request: FastifyRequest<{ Querystring: SearchRequest }>,
    reply: FastifyReply
  ) {
    try {
      const {
        query,
        category,
        language = 'EN',
        limit = 10,
        offset = 0,
      } = request.query as any;

      const whereClause: any = {
        status: 'ACTIVE',
        OR: [
          { title: { contains: query, mode: 'insensitive' } },
          { description: { contains: query, mode: 'insensitive' } },
          { keywords: { hasSome: [query] } },
          { searchTags: { hasSome: [query.toLowerCase()] } },
        ],
      };

      if (category) {
        whereClause.category = category;
      }

      // Add language-specific search
      if (language === 'SI') {
        whereClause.OR.push({
          titleSi: { contains: query, mode: 'insensitive' },
        });
      } else if (language === 'TA') {
        whereClause.OR.push({
          titleTa: { contains: query, mode: 'insensitive' },
        });
      }

      const [procedures, total] = await Promise.all([
        prisma.procedure.findMany({
          where: whereClause,
          include: {
            steps: {
              orderBy: { order: 'asc' },
              take: 3, // Preview only first 3 steps
            },
            requirements: {
              where: { isRequired: true },
              take: 5, // Preview only first 5 requirements
            },
            fees: true,
            offices: {
              include: {
                office: {
                  select: {
                    id: true,
                    name: true,
                    nameSi: true,
                    nameTa: true,
                    district: true,
                    province: true,
                  },
                },
              },
              take: 3, // Preview only first 3 offices
            },
          },
          skip: offset,
          take: limit,
          orderBy: [{ createdAt: 'desc' }],
        }),
        prisma.procedure.count({ where: whereClause }),
      ]);

      // Generate search suggestions
      const suggestions = await this.generateSearchSuggestions(query);

      const result = {
        procedures,
        total,
        suggestions,
        pagination: {
          page: Math.floor(offset / limit) + 1,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      };

      return reply.send(createSuccessResponse('Search completed', result));
    } catch (error) {
      return reply
        .code(500)
        .send(
          createErrorResponse(
            'Search failed',
            error instanceof Error ? error.message : 'Unknown error'
          )
        );
    }
  }

  async getProcedureBySlug(
    request: FastifyRequest<{ Params: { slug: string } }>,
    reply: FastifyReply
  ) {
    try {
      const { slug } = request.params;

      const procedure = await prisma.procedure.findUnique({
        where: { slug },
        include: {
          steps: {
            orderBy: { order: 'asc' },
          },
          requirements: {
            orderBy: { order: 'asc' },
          },
          fees: true,
          offices: {
            include: {
              office: true,
            },
          },
        },
      });

      if (!procedure) {
        return reply.code(404).send(createErrorResponse('Procedure not found'));
      }

      return reply.send(
        createSuccessResponse('Procedure retrieved', procedure)
      );
    } catch (error) {
      return reply
        .code(500)
        .send(
          createErrorResponse(
            'Failed to get procedure',
            error instanceof Error ? error.message : 'Unknown error'
          )
        );
    }
  }

  async getProcedureById(
    request: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply
  ) {
    try {
      const { id } = request.params;

      const procedure = await prisma.procedure.findUnique({
        where: { id },
        include: {
          steps: {
            orderBy: { order: 'asc' },
          },
          requirements: {
            orderBy: { order: 'asc' },
          },
          fees: true,
          offices: {
            include: {
              office: true,
            },
          },
        },
      });

      if (!procedure) {
        return reply.code(404).send(createErrorResponse('Procedure not found'));
      }

      return reply.send(
        createSuccessResponse('Procedure retrieved', procedure)
      );
    } catch (error) {
      return reply
        .code(500)
        .send(
          createErrorResponse(
            'Failed to get procedure',
            error instanceof Error ? error.message : 'Unknown error'
          )
        );
    }
  }

  async getAllProcedures(
    request: FastifyRequest<{
      Querystring: { category?: string; limit?: number; offset?: number };
    }>,
    reply: FastifyReply
  ) {
    try {
      const { category, limit = 20, offset = 0 } = request.query;

      const whereClause: any = { status: 'ACTIVE' };
      if (category) {
        whereClause.category = category;
      }

      const [procedures, total] = await Promise.all([
        prisma.procedure.findMany({
          where: whereClause,
          include: {
            _count: {
              select: {
                steps: true,
                requirements: true,
                fees: true,
              },
            },
          },
          skip: offset,
          take: limit,
          orderBy: { title: 'asc' },
        }),
        prisma.procedure.count({ where: whereClause }),
      ]);

      const result = {
        procedures,
        total,
        pagination: {
          page: Math.floor(offset / limit) + 1,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      };

      return reply.send(createSuccessResponse('Procedures retrieved', result));
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

  private async generateSearchSuggestions(query: string): Promise<string[]> {
    try {
      // Get related keywords from existing procedures
      const procedures = await prisma.procedure.findMany({
        where: {
          OR: [
            { keywords: { hasSome: [query] } },
            { searchTags: { hasSome: [query.toLowerCase()] } },
          ],
        },
        select: {
          keywords: true,
          searchTags: true,
        },
        take: 10,
      });

      const suggestions = new Set<string>();
      procedures.forEach((p) => {
        p.keywords.forEach((k) => {
          if (k.toLowerCase().includes(query.toLowerCase()) && k !== query) {
            suggestions.add(k);
          }
        });
        p.searchTags.forEach((t) => {
          if (t.includes(query.toLowerCase()) && t !== query.toLowerCase()) {
            suggestions.add(t);
          }
        });
      });

      return Array.from(suggestions).slice(0, 5);
    } catch (error) {
      return [];
    }
  }
}
