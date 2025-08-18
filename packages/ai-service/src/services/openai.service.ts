import OpenAI from 'openai';
import {
  AIRequest,
  AIResponse,
  detectLanguage,
  ProcedureCategory,
  ProcessingResult,
  SuggestedAction,
} from '@matesl/shared';
import {} from '@matesl/shared';
import { ProcedureService } from './procedure.service';

export class OpenAIService {
  private client: OpenAI;
  private procedureService: ProcedureService;

  constructor() {
    this.client = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
    this.procedureService = new ProcedureService();
  }

  async processMessage(request: AIRequest): Promise<ProcessingResult> {
    const startTime = Date.now();

    try {
      const { message, language = detectLanguage(message), context } = request;

      // Get relevant procedures for context
      const relevantProcedures = await this.procedureService.searchProcedures(
        message,
        { limit: 3 }
      );

      const systemPrompt = this.buildSystemPrompt(language, relevantProcedures);
      const userPrompt = this.buildUserPrompt(message, context);

      const completion = await this.client.chat.completions.create({
        model: 'gpt-4',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        max_tokens: 200,
        temperature: 0.7,
        functions: [
          {
            name: 'extract_intent_and_entities',
            description: 'Extract intent and entities from user message',
            parameters: {
              type: 'object',
              properties: {
                intent: {
                  type: 'string',
                  enum: [
                    'procedure_inquiry',
                    'document_requirement',
                    'fee_inquiry',
                    'office_location',
                    'status_check',
                    'general_help',
                    'greeting',
                    'unclear',
                  ],
                },
                category: {
                  type: 'string',
                  enum: [
                    'IDENTITY_DOCUMENTS',
                    'BIRTH_CERTIFICATES',
                    'PASSPORTS',
                    'EDUCATION',
                    'BUSINESS',
                    'PROPERTY',
                    'VEHICLE',
                    'HEALTH',
                    'SOCIAL_SERVICES',
                    'OTHER',
                  ],
                },
                entities: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      type: { type: 'string' },
                      value: { type: 'string' },
                      confidence: { type: 'number' },
                    },
                  },
                },
                confidence: { type: 'number' },
              },
              required: ['intent', 'category', 'confidence'],
            },
          },
        ],
        function_call: { name: 'extract_intent_and_entities' },
      });

      const functionCall = completion.choices[0].message.function_call;
      const extractedData = JSON.parse(functionCall?.arguments || '{}');

      const response: AIResponse = {
        message: await this.generateResponse(
          extractedData,
          relevantProcedures,
          language
        ),
        confidence: extractedData.confidence || 0.5,
        category: extractedData.category || ProcedureCategory.OTHER,
        intent: extractedData.intent || 'unclear',
        entities: extractedData.entities || [],
        suggestedActions: this.generateSuggestedActions(
          extractedData,
          relevantProcedures
        ),
        language,
        procedureId: relevantProcedures[0]?.id,
      };

      return {
        success: true,
        response,
        processingTime: Date.now() - startTime,
        modelUsed: 'gpt-4',
      };
    } catch (error) {
      console.error('OpenAI processing error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        processingTime: Date.now() - startTime,
        modelUsed: 'gpt-4',
      };
    }
  }

  private buildSystemPrompt(language: string, procedures: any[]): string {
    const procedureContext = procedures
      .map(
        (p) => `${p.title}: ${p.steps[0]?.instruction || 'No steps available'}`
      )
      .join('\n');

    return `You are an AI assistant for Sri Lankan government services. Help users with:
    - Government procedures and requirements
    - Document applications (NIC, Passport, Birth Certificate, etc.)
    - Office locations and contact information
    - Fees and processing times

    Language: ${language}
    Available procedures context:
    ${procedureContext}

    Guidelines:
    - Be helpful, accurate, and concise
    - Always provide step-by-step guidance
    - Include relevant fees and requirements
    - Suggest nearest offices when applicable
    - If unsure, ask for clarification
    - Respond in the user's preferred language`;
  }

  private buildUserPrompt(message: string, context?: any): string {
    let prompt = `User question: ${message}`;

    if (context?.previousMessages?.length) {
      prompt += `\n\nPrevious conversation context:\n${context.previousMessages.join('\n')}`;
    }

    return prompt;
  }

  private async generateResponse(
    extractedData: any,
    procedures: any[],
    language: string
  ): Promise<string> {
    if (!procedures.length) {
      return this.getGenericHelpMessage(language);
    }

    const procedure = procedures[0];
    const steps = procedure.steps.slice(0, 3); // First 3 steps

    let response = `To ${procedure.title.toLowerCase()}:\n\n`;

    steps.forEach((step: any, index: number) => {
      const instruction =
        language === 'si'
          ? step.instructionSi
          : language === 'ta'
            ? step.instructionTa
            : step.instruction;
      response += `${index + 1}. ${instruction}\n`;
    });

    if (procedure.fees?.length) {
      response += `\nFees: LKR ${procedure.fees[0].amount}`;
    }

    return response;
  }

  private generateSuggestedActions(extractedData: any, procedures: any[]) {
    const actions: SuggestedAction[] = [];

    if (procedures.length) {
      actions.push({
        type: 'procedure',
        label: 'View complete procedure',
        data: { procedureId: procedures[0].id },
      });
    }

    if (extractedData.intent === 'office_location') {
      actions.push({
        type: 'office',
        label: 'Find nearest office',
        data: { category: extractedData.category },
      });
    }

    return actions;
  }

  private getGenericHelpMessage(language: string): string {
    const messages = {
      en: 'I can help you with Sri Lankan government procedures. What do you need assistance with?',
      si: 'මම ශ්‍රී ලංකාවේ රාජ්‍ය ක්‍රියාවලි සම්බන්ධයෙන් ඔබට උදව් කළ හැකියි. ඔබට කුමක් සඳහා සහාය අවශ්‍යද?',
      ta: 'இலங்கை அரசாங்க நடைமுறைகளில் நான் உங்களுக்கு உதவ முடியும். உங்களுக்கு என்ன உதவி தேவை?',
    };
    return messages[language as keyof typeof messages] || messages.en;
  }
}
