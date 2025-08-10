import { FastifyPluginAsync } from 'fastify';
import { ChatController } from '../controllers/chat.controller';
import { ChatRequestSchema } from '@matesl/shared';

export const chatRoutes: FastifyPluginAsync = async (fastify) => {
  const chatController = new ChatController();

  // Send message (public or authenticated)
  fastify.post('/send', {
    preHandler: [fastify.optionalAuthenticate], // Custom middleware for optional auth
    schema: {
      body: ChatRequestSchema,
      response: {
        200: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            data: {
              type: 'object',
              properties: {
                id: { type: 'string' },
                response: { type: 'string' },
                confidence: { type: 'number' },
                category: { type: 'string' },
                sessionId: { type: 'string' },
                suggestedActions: { type: 'array' },
              },
            },
            meta: {
              type: 'object',
              properties: {
                processingTime: { type: 'number' },
                modelUsed: { type: 'string' },
              },
            },
          },
        },
      },
    },
    handler: chatController.sendMessage.bind(chatController),
  });

  // Get chat history (authenticated only)
  fastify.get('/history', {
    preHandler: [fastify.authenticate],
    schema: {
      querystring: {
        type: 'object',
        properties: {
          sessionId: { type: 'string' },
          limit: { type: 'number', default: 50 },
          offset: { type: 'number', default: 0 },
        },
      },
    },
    handler: chatController.getChatHistory.bind(chatController),
  });

  // Get user's chat sessions
  fastify.get('/sessions', {
    preHandler: [fastify.authenticate],
    schema: {
      querystring: {
        type: 'object',
        properties: {
          limit: { type: 'number', default: 20 },
          offset: { type: 'number', default: 0 },
        },
      },
    },
    handler: chatController.getChatSessions.bind(chatController),
  });

  // Delete chat session
  fastify.delete('/sessions/:sessionId', {
    preHandler: [fastify.authenticate],
    handler: chatController.deleteChatSession.bind(chatController),
  });

  // Export chat history
  fastify.get('/export', {
    preHandler: [fastify.authenticate],
    schema: {
      querystring: {
        type: 'object',
        properties: {
          format: { type: 'string', enum: ['json', 'csv'], default: 'json' },
          sessionId: { type: 'string' },
        },
      },
    },
    handler: chatController.exportChatHistory.bind(chatController),
  });
};