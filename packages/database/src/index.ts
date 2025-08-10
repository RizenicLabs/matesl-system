export * from './client';
export * from './generated/client';

// Re-export shared types that are database-related
export type {
  User,
  Procedure,
  ChatMessage,
  ChatSession,
  ProcedureStep,
  Requirement,
  Fee,
  Office,
} from '@matesl/shared';