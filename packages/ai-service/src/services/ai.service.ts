import { OpenAIService } from './openai.service';
import { HuggingFaceService } from './huggingface.service';
import { AIRequest, ProcessingResult, ModelConfig } from '@matesl/shared';
import Redis from 'ioredis';

export class AIService {
  private openaiService: OpenAIService;
  private huggingfaceService: HuggingFaceService;
  private redis: Redis;
  private modelConfigs: ModelConfig[];

  constructor() {
    this.openaiService = new OpenAIService();
    this.huggingfaceService = new HuggingFaceService();
    this.redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');

    this.modelConfigs = [
      {
        name: 'gpt-4',
        provider: 'openai',
        maxTokens: 200,
        temperature: 0.7,
        enabled: !!process.env.OPENAI_API_KEY,
      },
      {
        name: 'huggingface-multilingual',
        provider: 'huggingface',
        maxTokens: 150,
        temperature: 0.7,
        enabled: !!process.env.HUGGINGFACE_API_KEY,
      },
    ];
  }

  async processMessage(request: AIRequest): Promise<ProcessingResult> {
    const cacheKey = `ai:${JSON.stringify({ message: request.message, language: request.language })}`;

    // Check cache first
    try {
      const cached = await this.redis.get(cacheKey);
      if (cached) {
        const result = JSON.parse(cached) as ProcessingResult;
        result.modelUsed += ' (cached)';
        return result;
      }
    } catch (error) {
      console.warn('Cache read error:', error);
    }

    // Try primary model (OpenAI) first
    let result: ProcessingResult;

    if (this.modelConfigs[0].enabled) {
      result = await this.openaiService.processMessage(request);

      // If OpenAI fails, fallback to Hugging Face
      if (!result.success && this.modelConfigs[1].enabled) {
        console.log('Falling back to Hugging Face...');
        result = await this.huggingfaceService.processMessage(request);
      }
    } else if (this.modelConfigs[1].enabled) {
      // Use Hugging Face as primary if OpenAI not available
      result = await this.huggingfaceService.processMessage(request);
    } else {
      result = {
        success: false,
        error: 'No AI models available',
        processingTime: 0,
        modelUsed: 'none',
      };
    }

    // Cache successful results
    if (result.success) {
      try {
        await this.redis.setex(cacheKey, 3600, JSON.stringify(result)); // 1 hour cache
      } catch (error) {
        console.warn('Cache write error:', error);
      }
    }

    return result;
  }

  async getModelStatus() {
    return this.modelConfigs.map((config) => ({
      name: config.name,
      provider: config.provider,
      enabled: config.enabled,
      status: config.enabled ? 'available' : 'disabled',
    }));
  }

  async clearCache(pattern = 'ai:*') {
    try {
      const keys = await this.redis.keys(pattern);
      if (keys.length > 0) {
        await this.redis.del(...keys);
      }
      return { cleared: keys.length };
    } catch (error) {
      console.error('Cache clear error:', error);
      return { error: 'Failed to clear cache' };
    }
  }
}
