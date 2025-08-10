import { prisma } from '@matesl/database';
import { createSuccessResponse, createErrorResponse, detectLanguage } from '@matesl/shared';
import { Language, ProcedureCategory } from '@matesl/shared';
import axios from 'axios';

export class ChatService {
  private aiServiceUrl: string;

  constructor() {
    this.aiServiceUrl = process.env.AI_SERVICE_URL || 'http://localhost:3003';
  }

  async sendMessage(data: {
    message: string;
    sessionId?: string;
    userId?: string;
    language?: Language;
  }) {
    try {
      const { message, sessionId, userId, language } = data;

      // Detect language if not provided
      const detectedLanguage = language || this.mapLanguageCode(detectLanguage(message));

      // Get or create chat session
      const session = await this.getOrCreateSession(sessionId, userId);

      // Send message to AI service
      const aiResponse = await this.processWithAI({
        message,
        language: detectedLanguage,
        sessionId: session.id,
      });

      if (!aiResponse.success) {
        return createErrorResponse('Failed to process message with AI service');
      }

      // Save message and response to database
      const chatMessage = await prisma.chatMessage.create({
        data: {
          sessionId: session.id,
          message,
          response: aiResponse.response,
          confidence: aiResponse.confidence || 0.8,
          category: aiResponse.category || ProcedureCategory.OTHER,
          language: detectedLanguage,
          procedureId: aiResponse.procedureId,
          intent: aiResponse.intent,
          entities: aiResponse.entities,
        },
        include: {
          procedure: {
            select: {
              title: true,
              slug: true,
              category: true,
            },
          },
        },
      });

      return createSuccessResponse({
        messageId: chatMessage.id,
        sessionId: session.id,
        response: aiResponse.response,
        confidence: aiResponse.confidence,
        category: aiResponse.category,
        procedure: chatMessage.procedure,
        suggestions: aiResponse.suggestions,
      }, 'Message processed successfully');

    } catch (error) {
      console.error('Chat service error:', error);
      return createErrorResponse('Failed to process message');
    }
  }

  async getChatHistory(data: {
    userId: string;
    sessionId?: string;
    limit?: number;
    offset?: number;
  }) {
    try {
      const { userId, sessionId, limit = 50, offset = 0 } = data;

      const messages = await prisma.chatMessage.findMany({
        where: {
          session: {
            userId,
            ...(sessionId && { id: sessionId }),
          },
        },
        include: {
          procedure: {
            select: {
              title: true,
              slug: true,
              category: true,
            },
          },
        },
        orderBy: {
          timestamp: 'desc',
        },
        skip: offset,
        take: limit,
      });

      const total = await prisma.chatMessage.count({
        where: {
          session: {
            userId,
            ...(sessionId && { id: sessionId }),
          },
        },
      });

      return {
        messages: messages.reverse(), // Show oldest first
        total,
        hasMore: total > offset + limit,
      };
    } catch (error) {
      console.error('Get chat history error:', error);
      throw new Error('Failed to fetch chat history');
    }
  }

  async getChatSessions(data: {
    userId: string;
    limit?: number;
    offset?: number;
  }) {
    try {
      const { userId, limit = 20, offset = 0 } = data;

      const sessions = await prisma.chatSession.findMany({
        where: {
          userId,
          isActive: true,
        },
        include: {
          messages: {
            orderBy: { timestamp: 'desc' },
            take: 1,
            select: {
              message: true,
              timestamp: true,
              category: true,
            },
          },
          _count: {
            select: {
              messages: true,
            },
          },
        },
        orderBy: {
          updatedAt: 'desc',
        },
        skip: offset,
        take: limit,
      });

      // Format sessions with last message preview
      const formattedSessions = sessions.map(session => ({
        id: session.id,
        lastMessage: session.messages[0]?.message || '',
        lastActivity: session.messages[0]?.timestamp || session.updatedAt,
        messageCount: session._count.messages,
        category: session.messages[0]?.category,
        createdAt: session.createdAt,
      }));

      return formattedSessions;
    } catch (error) {
      console.error('Get chat sessions error:', error);
      throw new Error('Failed to fetch chat sessions');
    }
  }

  async deleteChatSession(sessionId: string, userId: string) {
    try {
      // Verify session ownership
      const session = await prisma.chatSession.findFirst({
        where: {
          id: sessionId,
          userId,
        },
      });

      if (!session) {
        return createErrorResponse('Session not found or access denied');
      }

      // Soft delete - mark as inactive
      await prisma.chatSession.update({
        where: { id: sessionId },
        data: { isActive: false },
      });

      return createSuccessResponse(null, 'Session deleted successfully');
    } catch (error) {
      console.error('Delete session error:', error);
      return createErrorResponse('Failed to delete session');
    }
  }

  async exportChatHistory(data: {
    userId: string;
    sessionId?: string;
    format?: 'json' | 'csv';
  }) {
    try {
      const { userId, sessionId, format = 'json' } = data;

      const messages = await prisma.chatMessage.findMany({
        where: {
          session: {
            userId,
            ...(sessionId && { id: sessionId }),
          },
        },
        include: {
          session: {
            select: {
              id: true,
              createdAt: true,
            },
          },
          procedure: {
            select: {
              title: true,
              slug: true,
            },
          },
        },
        orderBy: {
          timestamp: 'asc',
        },
      });

      if (format === 'csv') {
        const csvData = this.convertToCSV(messages);
        return createSuccessResponse(csvData);
      }

      return createSuccessResponse({
        exportDate: new Date().toISOString(),
        totalMessages: messages.length,
        sessions: this.groupMessagesBySession(messages),
      });
    } catch (error) {
      console.error('Export chat history error:', error);
      return createErrorResponse('Failed to export chat history');
    }
  }

  private async getOrCreateSession(sessionId?: string, userId?: string) {
    if (sessionId) {
      const existingSession = await prisma.chatSession.findUnique({
        where: { id: sessionId },
      });
      
      if (existingSession) {
        return existingSession;
      }
    }

    // Create new session
    return await prisma.chatSession.create({
      data: {
        userId,
        isActive: true,
      },
    });
  }

  private async processWithAI(data: {
    message: string;
    language: Language;
    sessionId: string;
  }) {
    try {
      const response = await axios.post(`${this.aiServiceUrl}/chat/process`, {
        message: data.message,
        language: data.language,
        context: {
          sessionId: data.sessionId,
        },
      }, {
        timeout: 30000, // 30 seconds timeout
      });

      return {
        success: true,
        response: response.data.data.response,
        confidence: response.data.data.confidence,
        category: response.data.data.category,
        procedureId: response.data.data.procedureId,
        intent: response.data.data.intent,
        entities: response.data.data.entities,
        suggestions: response.data.data.suggestions,
      };
    } catch (error) {
      console.error('AI service error:', error);
      return {
        success: false,
        error: 'AI service unavailable',
      };
    }
  }

  private mapLanguageCode(detected: 'EN' | 'SI' | 'TA'): Language {
    const mapping = {
      'EN': Language.EN,
      'SI': Language.SI,
      'TA': Language.TA,
    };
    return mapping[detected] || Language.EN;
  }

  private convertToCSV(messages: any[]): string {
    const headers = ['Timestamp', 'Session ID', 'Message', 'Response', 'Category', 'Confidence'];
    const rows = messages.map(msg => [
      msg.timestamp.toISOString(),
      msg.sessionId,
      `"${msg.message.replace(/"/g, '""')}"`,
      `"${msg.response.replace(/"/g, '""')}"`,
      msg.category,
      msg.confidence,
    ]);

    return [headers.join(','), ...rows.map(row => row.join(','))].join('\n');
  }

  private groupMessagesBySession(messages: any[]) {
    const sessions = new Map();
    
    messages.forEach(msg => {
      if (!sessions.has(msg.sessionId)) {
        sessions.set(msg.sessionId, {
          sessionId: msg.sessionId,
          createdAt: msg.session.createdAt,
          messages: [],
        });
      }
      sessions.get(msg.sessionId).messages.push({
        timestamp: msg.timestamp,
        message: msg.message,
        response: msg.response,
        category: msg.category,
        procedure: msg.procedure,
      });
    });

    return Array.from(sessions.values());
  }
}