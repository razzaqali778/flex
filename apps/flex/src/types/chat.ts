import type { RagPhase, RetrievedChunk } from '../lib/rag/types';
import type { ChatAction } from '../lib/chatActions';

export type MessageRole = 'user' | 'assistant';

export type AssistantStatus =
  | 'idle'
  | RagPhase
  | 'streaming'
  | 'complete'
  | 'error';

export type MessageFeedback = 'up' | 'down';

export interface ChatMessage {
  id: string;
  role: MessageRole;
  content: string;
  createdAt: string;
  status?: AssistantStatus;
  sources?: RetrievedChunk[];
  displayedContent?: string;
  feedback?: MessageFeedback;
  feedbackNote?: string;
  userComment?: string;
  actions?: ChatAction[];
}

export interface ChatSession {
  id: string;
  title: string;
  messages: ChatMessage[];
  updatedAt: string;
  pinned?: boolean;
}
