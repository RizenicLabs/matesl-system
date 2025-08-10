import { FastifyRequest, FastifyReply } from 'fastify';
import { ChatService } from '../services/chat.service';
import { createSuccessResponse, createErrorResponse } from '@matesl/shared';

export class ChatController {
  private chatService: ChatService;

  constructor() {
    this.chatService = new ChatService();
  }

  async sendMessage(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { message, sessionId, language } = request.body as any;
      const userId = (request as any).user?.id;

      const result = await this.chatService.sendMessage({
        message,
        sessionId,
        language,
        userId,
      });

      if (!result.success) {
        reply.status(400);
        return createErrorResponse(result.error || 'Failed to process message');
      }

      return createSuccessResponse(result.data, 'Message processed successfully');
    } catch (error) {
      reply.status(500);
      return createErrorResponse('Internal server error');
    }
  }

  async getChatHistory(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { sessionId, limit, offset } = request.query as any;
      const userId = (request as any).user.id;

      const result = await this.chatService.getChatHistory({
        userId,
        sessionId,
        limit: parseInt(limit) || 50,
        offset: parseInt(offset) || 0,
      });

      return createSuccessResponse(result);
    } catch (error) {
      reply.status(500);
      return createErrorResponse('Internal server error');
    }
  }

  async getChatSessions(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { limit, offset } = request.query as any;
      const userId = (request as any).user.id;

      const result = await this.chatService.getChatSessions({
        userId,
        limit: parseInt(limit) || 20,
        offset: parseInt(offset) || 0,
      });

      return createSuccessResponse(result);
    } catch (error) {
      reply.status(500);
      return createErrorResponse('Internal server error');
    }
  }

  async deleteChatSession(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { sessionId } = request.params as any;
      const userId = (request as any).user.id;

      const result = await this.chatService.deleteChatSession(sessionId, userId);

      if (!result.success) {
        reply.status(404);
        return createErrorResponse(result.error || 'Session not found');
      }

      return createSuccessResponse(null, 'Session deleted successfully');
    } catch (error) {
      reply.status(500);
      return createErrorResponse('Internal server error');
    }
  }

  async exportChatHistory(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { format, sessionId } = request.query as any;
      const userId = (request as any).user.id;

      const result = await this.chatService.exportChatHistory({
        userId,
        sessionId,
        format: format || 'json',
      });

      if (!result.success) {
        reply.status(400);
        return createErrorResponse(result.error || 'Export failed');
      }

      const filename = `chat-history-${Date.now()}.${format || 'json'}`;
      reply.header('Content-Disposition', `attachment; filename="${filename}"`);
      
      if (format === 'csv') {
        reply.type('text/csv');
      } else {
        reply.type('application/json');
      }

      return result.data;
    } catch (error) {
      reply.status(500);
      return createErrorResponse('Internal server error');
    }
  }
}