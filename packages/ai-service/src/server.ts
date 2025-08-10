import Fastify from 'fastify';
import cors from '@fastify/cors';
import { AIService } from './services/ai.service';
import { AIRequest } from './types';
import dotenv from 'dotenv';

dotenv.config();

const fastify = Fastify({ logger: true });

// Register CORS
fastify.register(cors, {
  origin: [
    'http://localhost:3000',
    'http://localhost:3001',
    process.env.FRONTEND_URL || 'http://localhost:3000',
  ],
  credentials: true,
});

const aiService = new AIService();

// Health check
fastify.get('/health', async () => {
  return { status: 'healthy', timestamp: new Date().toISOString() };
});

// Model status
fastify.get('/models/status', async () => {
  return await aiService.getModelStatus();
});

// Process chat message
fastify.post('/chat/process', async (request, reply) => {
  try {
    const aiRequest = request.body as AIRequest;
    
    if (!aiRequest.message?.trim()) {
      reply.status(400);
      return { error: 'Message is required' };
    }

    const result = await aiService.processMessage(aiRequest);
    
    if (!result.success) {
      reply.status(500);
      return { error: result.error || 'Processing failed' };
    }

    return {
      success: true,
      data: result.response,
      meta: {
        processingTime: result.processingTime,
        modelUsed: result.modelUsed,
      },
    };
  } catch (error) {
    reply.status(500);
    return { error: 'Internal server error' };
  }
});

// Clear cache (admin only)
fastify.delete('/cache', async (request) => {
  const { pattern } = request.query as { pattern?: string };
  return await aiService.clearCache(pattern);
});

// Start server
const start = async () => {
  try {
    const port = parseInt(process.env.AI_SERVICE_PORT || '3003');
    await fastify.listen({ port, host: '0.0.0.0' });
    console.log(`🤖 AI Service running on port ${port}`);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();