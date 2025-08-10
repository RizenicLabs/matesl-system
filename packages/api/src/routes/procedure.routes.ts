import { FastifyPluginAsync } from 'fastify';
import { ProcedureController } from '../controllers/procedure.controller';
import { SearchRequestSchema } from '@matesl/shared';

export const procedureRoutes: FastifyPluginAsync = async (fastify) => {
  const procedureController = new ProcedureController();

  // Search procedures
  fastify.get('/search', {
    schema: {
      querystring: SearchRequestSchema,
    },
    handler: procedureController.searchProcedures.bind(procedureController),
  });

  // Get procedure by ID
  fastify.get('/:id', {
    schema: {
      params: {
        type: 'object',
        required: ['id'],
        properties: {
          id: { type: 'string' },
        },
      },
    },
    handler: procedureController.getProcedureById.bind(procedureController),
  });

  // Get procedures by category
  fastify.get('/category/:category', {
    schema: {
      params: {
        type: 'object',
        required: ['category'],
        properties: {
          category: { type: 'string' },
        },
      },
      querystring: {
        type: 'object',
        properties: {
          limit: { type: 'number', default: 10 },
          offset: { type: 'number', default: 0 },
        },
      },
    },
    handler: procedureController.getProceduresByCategory.bind(procedureController),
  });

  // Get all categories
  fastify.get('/categories/list', {
    handler: procedureController.getCategories.bind(procedureController),
  });

  // Get popular procedures
  fastify.get('/popular', {
    schema: {
      querystring: {
        type: 'object',
        properties: {
          limit: { type: 'number', default: 10 },
        },
      },
    },
    handler: procedureController.getPopularProcedures.bind(procedureController),
  });

  // Get related procedures
  fastify.get('/:id/related', {
    schema: {
      params: {
        type: 'object',
        required: ['id'],
        properties: {
          id: { type: 'string' },
        },
      },
      querystring: {
        type: 'object',
        properties: {
          limit: { type: 'number', default: 5 },
        },
      },
    },
    handler: procedureController.getRelatedProcedures.bind(procedureController),
  });

  // Get offices for procedure
  fastify.get('/:id/offices', {
    schema: {
      params: {
        type: 'object',
        required: ['id'],
        properties: {
          id: { type: 'string' },
        },
      },
    },
    handler: procedureController.getProcedureOffices.bind(procedureController),
  });
};