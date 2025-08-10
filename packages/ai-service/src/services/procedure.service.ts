import { prisma } from '@matesl/database';
import natural from 'natural';

export class ProcedureService {
  private stemmer = natural.PorterStemmer;

  async searchProcedures(query: string, options: { limit?: number } = {}) {
    const { limit = 5 } = options;

    // Tokenize and stem the query
    const tokens = natural.WordTokenizer.prototype.tokenize(query.toLowerCase());
    const stemmedTokens = tokens.map(token => this.stemmer.stem(token));

    try {
      // Full-text search using PostgreSQL
      const procedures = await prisma.procedure.findMany({
        where: {
          AND: [
            { status: 'ACTIVE' },
            {
              OR: [
                {
                  title: {
                    contains: query,
                    mode: 'insensitive',
                  },
                },
                {
                  searchTags: {
                    hasSome: stemmedTokens,
                  },
                },
                {
                  keywords: {
                    hasSome: tokens,
                  },
                },
              ],
            },
          ],
        },
        include: {
          steps: {
            orderBy: { order: 'asc' },
            take: 5,
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
        take: limit,
      });

      return procedures;
    } catch (error) {
      console.error('Procedure search error:', error);
      return [];
    }
  }

  async getProcedureById(id: string) {
    try {
      return await prisma.procedure.findUnique({
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
    } catch (error) {
      console.error('Get procedure error:', error);
      return null;
    }
  }

  async getProceduresByCategory(category: string, limit = 10) {
    try {
      return await prisma.procedure.findMany({
        where: {
          category: category as any,
          status: 'ACTIVE',
        },
        include: {
          steps: {
            take: 3,
            orderBy: { order: 'asc' },
          },
          fees: true,
        },
        take: limit,
      });
    } catch (error) {
      console.error('Get procedures by category error:', error);
      return [];
    }
  }
}