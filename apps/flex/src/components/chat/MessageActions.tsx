import { Check, Copy, MessageSquare, RefreshCw, ThumbsDown, ThumbsUp } from 'lucide-react';
import { useState } from 'react';
import { stripMarkdownBold } from '../../lib/chat/sessionUtils';
import type { ChatMessage, MessageFeedback } from '../../types/chat';

interface MessageActionsProps {
  message: ChatMessage;
  onFeedback: (feedback: MessageFeedback, note?: string) => void;
  onComment: (comment: string) => void;
  onRegenerate?: () => void;
  isLastAssistant?: boolean;
}

export function MessageActions({
  message,
  onFeedback,
  onComment,
  onRegenerate,
  isLastAssistant,
}: MessageActionsProps) {
  const [copied, setCopied] = useState(false);
  const [showNote, setShowNote] = useState(false);
  const [note, setNote] = useState(message.feedbackNote ?? '');
  const [showComment, setShowComment] = useState(false);
  const [comment, setComment] = useState(message.userComment ?? '');
  const isAssistant = message.role === 'assistant';
  const canInteract = isAssistant && message.status === 'complete' && message.content;

  if (!canInteract) return null;

  return (
    <div className="mt-2 pt-2 border-t border-flex-border/30 space-y-2">
      <div className="flex flex-wrap items-center gap-1">
        <button
          type="button"
          onClick={async () => {
            const text = stripMarkdownBold(message.displayedContent ?? message.content);
            try {
              await navigator.clipboard.writeText(text);
              setCopied(true);
              setTimeout(() => setCopied(false), 2000);
            } catch {
              /* ignore */
            }
          }}
          className="flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] text-flex-muted hover:text-flex-accent hover:bg-flex-accent/10"
        >
          {copied ? <Check className="w-3 h-3 text-flex-success" /> : <Copy className="w-3 h-3" />}
          {copied ? 'Copied' : 'Copy'}
        </button>
        {isLastAssistant && onRegenerate && (
          <button
            type="button"
            onClick={onRegenerate}
            className="flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] text-flex-muted hover:text-flex-accent hover:bg-flex-accent/10"
          >
            <RefreshCw className="w-3 h-3" />
            Regenerate
          </button>
        )}
        <span className="text-[10px] text-flex-muted mx-1 hidden sm:inline">|</span>
        <span className="text-[10px] text-flex-muted mr-1">Feedback</span>
        <button
          type="button"
          onClick={() => onFeedback('up')}
          className={`p-1.5 rounded-lg transition-colors ${
            message.feedback === 'up'
              ? 'bg-flex-success/20 text-flex-success'
              : 'text-flex-muted hover:text-flex-success hover:bg-flex-success/10'
          }`}
          aria-label="Helpful"
        >
          <ThumbsUp className="w-3.5 h-3.5" />
        </button>
        <button
          type="button"
          onClick={() => {
            onFeedback('down');
            setShowNote(true);
          }}
          className={`p-1.5 rounded-lg transition-colors ${
            message.feedback === 'down'
              ? 'bg-flex-danger/20 text-flex-danger'
              : 'text-flex-muted hover:text-flex-danger hover:bg-flex-danger/10'
          }`}
          aria-label="Not helpful"
        >
          <ThumbsDown className="w-3.5 h-3.5" />
        </button>
        <button
          type="button"
          onClick={() => setShowComment((v) => !v)}
          className={`ml-2 flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] transition-colors ${
            message.userComment
              ? 'text-flex-accent bg-flex-accent/10'
              : 'text-flex-muted hover:text-slate-200 hover:bg-flex-surface/50'
          }`}
        >
          <MessageSquare className="w-3 h-3" />
          {message.userComment ? 'Edit note' : 'Add note'}
        </button>
      </div>

      {(showNote || message.feedback === 'down') && (
        <div className="flex gap-2">
          <input
            type="text"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="What was missing or wrong?"
            className="flex-1 text-xs px-2 py-1.5 rounded-lg bg-flex-surface/60 border border-flex-border/50 text-slate-200 placeholder:text-flex-muted focus:outline-none focus:border-flex-accent/40"
          />
          <button
            type="button"
            onClick={() => {
              onFeedback(message.feedback ?? 'down', note);
              setShowNote(false);
            }}
            className="text-xs px-2 py-1 rounded-lg bg-flex-accent/20 text-flex-accent"
          >
            Save
          </button>
        </div>
      )}

      {showComment && (
        <div className="space-y-1">
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows={2}
            placeholder="Your comment on this answer…"
            className="w-full text-xs px-2 py-1.5 rounded-lg bg-flex-surface/60 border border-flex-border/50 text-slate-200 placeholder:text-flex-muted resize-none focus:outline-none focus:border-flex-accent/40"
          />
          <button
            type="button"
            onClick={() => {
              onComment(comment);
              setShowComment(false);
            }}
            className="text-xs px-2 py-1 rounded-lg bg-flex-accent/20 text-flex-accent"
          >
            Save note
          </button>
        </div>
      )}
    </div>
  );
}
