import { Language, ProcedureCategory } from '../enums';

export interface AIRequest {
  message: string;
  sessionId?: string;
  userId?: string;
  language?: Language;
  context?: ChatContext;
}

export interface AIResponse {
  message: string;
  confidence: number;
  category: ProcedureCategory;
  intent: string;
  entities: ExtractedEntity[];
  suggestedActions: SuggestedAction[];
  procedureId?: string;
  language: Language;
}

export interface ChatContext {
  previousMessages: string[];
  userProfile?: {
    district?: string;
    preferredLanguage?: Language;
  };
  sessionData?: Record<string, any>;
}

export interface ExtractedEntity {
  type: EntityType;
  value: string;
  confidence: number;
  position: {
    start: number;
    end: number;
  };
}

export interface SuggestedAction {
  type: 'search' | 'procedure' | 'office' | 'requirement' | 'faq';
  label: string;
  labelSi?: string;
  labelTa?: string;
  data: any;
}

export enum EntityType {
  DOCUMENT_TYPE = 'document_type',
  LOCATION = 'location',
  DATE = 'date',
  PERSON_NAME = 'person_name',
  PHONE_NUMBER = 'phone_number',
  EMAIL = 'email',
  AMOUNT = 'amount',
}

export enum IntentType {
  PROCEDURE_INQUIRY = 'procedure_inquiry',
  DOCUMENT_REQUIREMENT = 'document_requirement',
  FEE_INQUIRY = 'fee_inquiry',
  OFFICE_LOCATION = 'office_location',
  STATUS_CHECK = 'status_check',
  GENERAL_HELP = 'general_help',
  GREETING = 'greeting',
  UNCLEAR = 'unclear',
}

export interface ModelConfig {
  name: string;
  provider: 'openai' | 'huggingface';
  endpoint?: string;
  maxTokens: number;
  temperature: number;
  enabled: boolean;
}

export interface ProcessingResult {
  success: boolean;
  response?: AIResponse;
  error?: string;
  processingTime: number;
  modelUsed: string;
}
