import { Bot, User } from 'lucide-react';
import type { ChatMessage, MessageFeedback } from '../../types/chat';
import { ActionCards } from './ActionCards';
import { MessageActions } from './MessageActions';
import { PhaseIndicator } from './PhaseIndicator';
import { SourceCitations } from './SourceCitations';
import { TypewriterText } from './TypewriterText';

interface ChatBubbleProps {
  message: ChatMessage;
  onFeedback?: (feedback: MessageFeedback, note?: string) => void;
  onComment?: (comment: string) => void;
  onRegenerate?: () => void;
  onExecuteAction?: (actionId: string) => void;
  isLastAssistant?: boolean;
}

const ACTIVE_PHASES = new Set(['thinking', 'retrieving', 'analyzing', 'composing']);

export function ChatBubble({
  message,
  onFeedback,
  onComment,
  onRegenerate,
  onExecuteAction,
  isLastAssistant,
}: ChatBubbleProps) {
  const isUser = message.role === 'user';
  const status = message.status ?? 'complete';
  const showPhase = !isUser && status && ACTIVE_PHASES.has(status);
  const displayText =
    message.role === 'assistant'
      ? message.displayedContent ?? message.content
      : message.content;
  const isStreaming = status === 'streaming';
  const showSources =
    !isUser &&
    message.sources &&
    message.sources.length > 0 &&
    (status === 'analyzing' || status === 'composing' || status === 'streaming' || status === 'complete');

  return (
    <div
      className={`flex gap-3 animate-chat-slide-up ${isUser ? 'flex-row-reverse' : ''}`}
    >
      <div
        className={`shrink-0 w-9 h-9 rounded-xl flex items-center justify-center ${
          isUser
            ? 'bg-flex-accent2/20 border border-flex-accent2/30'
            : 'bg-gradient-to-br from-flex-accent/25 to-flex-accent2/25 border border-flex-accent/30 shadow-glow'
        }`}
      >
        {isUser ? (
          <User className="w-4 h-4 text-flex-accent2" />
        ) : (
          <Bot className="w-4 h-4 text-flex-accent" />
        )}
      </div>
      <div className={`flex-1 min-w-0 max-w-[92%] sm:max-w-[85%] ${isUser ? 'text-right' : ''}`}>
        <div
          className={`inline-block text-left rounded-2xl px-4 py-3 ${
            isUser
              ? 'bg-flex-accent2/15 border border-flex-accent2/25 rounded-tr-md'
              : 'glass rounded-tl-md'
          }`}
        >
          {isUser ? (
            <p className="text-[15px] text-slate-100 whitespace-pre-wrap">{message.content}</p>
          ) : (
            <>
              {showPhase && status && <PhaseIndicator status={status} />}
              {displayText ? (
                <TypewriterText text={displayText} isStreaming={isStreaming} />
              ) : null}
              {showSources && message.sources && (
                <SourceCitations
                  sources={message.sources}
                  expanded={status === 'complete' || status === 'streaming'}
                />
              )}
              {status === 'complete' && message.actions && message.actions.length > 0 && onExecuteAction && (
                <ActionCards
                  actions={message.actions}
                  onExecute={onExecuteAction}
                />
              )}
              {onFeedback && onComment && (
                <MessageActions
                  message={message}
                  onFeedback={onFeedback}
                  onComment={onComment}
                  onRegenerate={onRegenerate}
                  isLastAssistant={isLastAssistant}
                />
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
