import { HfInference } from '@huggingface/inference';
import {
  AIRequest,
  AIResponse,
  detectLanguage,
  ExtractedEntity,
  ProcedureCategory,
  ProcessingResult,
  SuggestedAction,
} from '@matesl/shared';
import { ProcedureService } from './procedure.service';
import natural from 'natural';

export class HuggingFaceService {
  private client: HfInference;
  private procedureService: ProcedureService;
  private tokenizer: any;

  constructor() {
    this.client = new HfInference(process.env.HUGGINGFACE_API_KEY);
    this.procedureService = new ProcedureService();
    this.tokenizer = new natural.WordTokenizer();
  }

  async processMessage(request: AIRequest): Promise<ProcessingResult> {
    const startTime = Date.now();

    try {
      const { message, language = detectLanguage(message) } = request;

      // Use sentence-transformers for embedding and similarity
      const embedding = await this.getTextEmbedding(message);
      const relevantProcedures = await this.procedureService.searchProcedures(
        message,
        { limit: 3 }
      );

      // Use classification model for intent recognition
      const intent = await this.classifyIntent(message);
      const category = this.categorizeRequest(message, intent);

      // Generate response using text generation model
      const response = await this.generateResponse(
        message,
        relevantProcedures,
        language
      );
      const confidence = this.calculateConfidence(message, relevantProcedures);

      const aiResponse: AIResponse = {
        message: response,
        confidence,
        category,
        intent: intent.label || 'general_help',
        entities: this.extractEntities(message),
        suggestedActions: this.generateSuggestedActions(
          intent,
          relevantProcedures
        ),
        language,
        procedureId: relevantProcedures[0]?.id,
      };

      return {
        success: true,
        response: aiResponse,
        processingTime: Date.now() - startTime,
        modelUsed: 'huggingface-multilingual',
      };
    } catch (error) {
      console.error('Hugging Face processing error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        processingTime: Date.now() - startTime,
        modelUsed: 'huggingface-multilingual',
      };
    }
  }

  private async getTextEmbedding(text: string): Promise<number[]> {
    try {
      const response = await this.client.featureExtraction({
        model: 'sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2',
        inputs: text,
      });
      return Array.isArray(response[0]) ? (response[0] as number[]) : [];
    } catch (error) {
      console.error('Embedding error:', error);
      return [];
    }
  }

  private async classifyIntent(
    message: string
  ): Promise<{ label: string; score: number }> {
    try {
      // Define government service intents
      const candidates = [
        'procedure inquiry',
        'document requirement',
        'fee inquiry',
        'office location',
        'status check',
        'general help',
        'greeting',
      ];

      const result = await this.client.zeroShotClassification({
        model: 'facebook/bart-large-mnli',
        inputs: message,
        parameters: {
          candidate_labels: candidates,
        },
      });

      return {
        label: result?.[0]?.label.replace(' ', '_'),
        score: result?.[0]?.score,
      };
    } catch (error) {
      console.error('Intent classification error:', error);
      return { label: 'general_help', score: 0.5 };
    }
  }

  private categorizeRequest(message: string, intent: any): ProcedureCategory {
    const keywords = {
      [ProcedureCategory.IDENTITY_DOCUMENTS]: [
        'nic',
        'national identity',
        'id card',
        'identity card',
      ],
      [ProcedureCategory.PASSPORTS]: ['passport', 'travel document', 'visa'],
      [ProcedureCategory.BIRTH_CERTIFICATES]: [
        'birth certificate',
        'birth cert',
        'born',
      ],
      [ProcedureCategory.EDUCATION]: [
        'degree',
        'certificate',
        'school',
        'university',
        'education',
      ],
      [ProcedureCategory.BUSINESS]: [
        'business',
        'company',
        'registration',
        'license',
      ],
      [ProcedureCategory.VEHICLE]: ['vehicle', 'car', 'license', 'driving'],
      [ProcedureCategory.PROPERTY]: ['property', 'land', 'deed', 'ownership'],
    };

    const lowerMessage = message.toLowerCase();

    for (const [category, terms] of Object.entries(keywords)) {
      if (terms.some((term) => lowerMessage.includes(term))) {
        return category as ProcedureCategory;
      }
    }

    return ProcedureCategory.OTHER;
  }

  private async generateResponse(
    message: string,
    procedures: any[],
    language: string
  ): Promise<string> {
    if (!procedures.length) {
      return this.getGenericHelpMessage(language);
    }

    try {
      const procedure = procedures[0];
      const context = `Procedure: ${procedure.title}\nSteps: ${procedure.steps
        .slice(0, 3)
        .map((s: any, i: number) => `${i + 1}. ${s.instruction}`)
        .join('\n')}`;

      // Use text generation for response
      const prompt = `Based on this government procedure information:
${context}

User question: ${message}

Provide a helpful, concise response in ${language} language:`;

      const response = await this.client.textGeneration({
        model: 'microsoft/DialoGPT-medium',
        inputs: prompt,
        parameters: {
          max_new_tokens: 150,
          temperature: 0.7,
          do_sample: true,
        },
      });

      return (
        response.generated_text || this.getFallbackResponse(procedure, language)
      );
    } catch (error) {
      console.error('Text generation error:', error);
      return this.getFallbackResponse(procedures[0], language);
    }
  }

  private calculateConfidence(message: string, procedures: any[]): number {
    if (!procedures.length) return 0.3;

    const tokens = this.tokenizer.tokenize(message.toLowerCase());
    const procedure = procedures[0];

    // Calculate keyword matches
    const procedureTokens = this.tokenizer.tokenize(
      `${procedure.title} ${procedure.steps?.[0]?.instruction || ''}`.toLowerCase()
    );

    const matches = tokens.filter((token: any) =>
      procedureTokens.includes(token)
    );
    const confidence = Math.min(matches.length / Math.max(tokens.length, 1), 1);

    return Math.max(confidence, 0.4); // Minimum confidence
  }

  private extractEntities(message: string): any[] {
    const entities: ExtractedEntity[] = [];

    // Simple regex-based entity extraction
    const phoneRegex = /(\+94|0)[1-9][0-9]{8}/g;
    const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
    const amountRegex = /(LKR|Rs\.?)\s*(\d+(?:,\d{3})*(?:\.\d{2})?)/gi;

    // Extract phone numbers
    const phones = message.match(phoneRegex);
    if (phones) {
      phones.forEach((phone) => {
        entities.push({
          type: 'phone_number',
          value: phone,
          confidence: 0.9,
          position: {
            start: message.indexOf(phone),
            end: message.indexOf(phone) + phone.length,
          },
        });
      });
    }

    // Extract emails
    const emails = message.match(emailRegex);
    if (emails) {
      emails.forEach((email) => {
        entities.push({
          type: 'email',
          value: email,
          confidence: 0.95,
          position: {
            start: message.indexOf(email),
            end: message.indexOf(email) + email.length,
          },
        });
      });
    }

    // Extract amounts
    const amounts = message.match(amountRegex);
    if (amounts) {
      amounts.forEach((amount) => {
        entities.push({
          type: 'amount',
          value: amount,
          confidence: 0.85,
          position: {
            start: message.indexOf(amount),
            end: message.indexOf(amount) + amount.length,
          },
        });
      });
    }

    return entities;
  }

  private generateSuggestedActions(intent: any, procedures: any[]) {
    const actions = [];

    if (procedures.length) {
      actions.push({
        type: 'procedure',
        label: 'View complete steps',
        data: { procedureId: procedures[0].id },
      } as SuggestedAction);
    }

    if (intent.label === 'office_location') {
      actions.push({
        type: 'office',
        label: 'Find offices nearby',
        data: { search: true },
      } as SuggestedAction);
    }

    if (intent.label === 'fee_inquiry') {
      actions.push({
        type: 'search',
        label: 'Check all fees',
        data: { query: 'fees charges' },
      } as SuggestedAction);
    }

    return actions;
  }

  private getFallbackResponse(procedure: any, language: string): string {
    if (!procedure) return this.getGenericHelpMessage(language);

    const templates = {
      en: `For ${procedure.title}, you need to: ${procedure.steps?.[0]?.instruction || 'visit the relevant office'}`,
      si: `${procedure.titleSi || procedure.title} සඳහා, ඔබට: ${procedure.steps?.[0]?.instructionSi || 'අදාළ කාර්යාලයට යන්න'} අවශ්‍යයි`,
      ta: `${procedure.titleTa || procedure.title} க்கு, நீங்கள்: ${procedure.steps?.[0]?.instructionTa || 'சம்பந்தப்பட்ட அலுவலகத்திற்கு செல்ல'} வேண்டும்`,
    };

    return templates[language as keyof typeof templates] || templates.en;
  }

  private getGenericHelpMessage(language: string): string {
    const messages = {
      en: 'I can help you with government procedures. Please specify what you need help with.',
      si: 'මට රජයේ ක්‍රියාවලි සම්බන්ධයෙන් ඔබට උදව් කළ හැකිය. කරුණාකර ඔබට කුමක් සඳහා උදව් අවශ්‍ය දැයි සඳහන් කරන්න.',
      ta: 'அரசாங்க நடைமுறைகளில் என்னால் உங்களுக்கு உதவ முடியும். உங்களுக்கு என்ன உதவி தேவை என்பதைக் குறிப்பிடுங்கள்.',
    };
    return messages[language as keyof typeof messages] || messages.en;
  }
}
