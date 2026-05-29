import { ArrowUp, Square } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

interface ChatComposerProps {
  onSend: (text: string) => void;
  onStop: () => void;
  disabled?: boolean;
  isProcessing?: boolean;
  placeholder?: string;
}

export function ChatComposer({
  onSend,
  onStop,
  disabled,
  isProcessing,
  placeholder = 'Ask about spend, anomalies, datasets, integrations…',
}: ChatComposerProps) {
  const [value, setValue] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${Math.min(el.scrollHeight, 160)}px`;
  }, [value]);

  const submit = () => {
    if (!value.trim() || disabled) return;
    onSend(value);
    setValue('');
  };

  return (
    <div className="relative rounded-2xl glass border border-flex-border/60 shadow-card p-2 focus-within:border-flex-accent/40 focus-within:shadow-glow transition-all duration-300">
      <textarea
        ref={textareaRef}
        rows={1}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            submit();
          }
          if (e.key === 'Escape' && isProcessing) {
            e.preventDefault();
            onStop();
          }
        }}
        disabled={disabled && !isProcessing}
        placeholder={placeholder}
        className="w-full resize-none bg-transparent px-3 py-2.5 text-[15px] text-slate-100 placeholder:text-flex-muted focus:outline-none disabled:opacity-50"
      />
      <div className="flex items-center justify-between gap-2 px-2 pb-1">
        <p className="text-[10px] text-flex-muted min-w-0 truncate">
          <span className="hidden sm:inline">
            Grounded answers only ·{' '}
            {isProcessing ? 'Stop to cancel' : 'Enter to send · Shift+Enter for newline'}
          </span>
          <span className="sm:hidden">
            {isProcessing ? 'Tap stop to cancel' : 'Enter to send'}
          </span>
        </p>
        {isProcessing ? (
          <button
            type="button"
            onClick={onStop}
            className="flex items-center justify-center w-9 h-9 rounded-xl bg-flex-danger/20 text-flex-danger border border-flex-danger/30 hover:bg-flex-danger/30 transition-colors"
            aria-label="Stop generating"
          >
            <Square className="w-4 h-4 fill-current" />
          </button>
        ) : (
          <button
            type="button"
            onClick={submit}
            disabled={!value.trim() || disabled}
            className="flex items-center justify-center w-9 h-9 rounded-xl bg-flex-accent text-flex-bg disabled:opacity-30 disabled:cursor-not-allowed hover:brightness-110 transition-all"
            aria-label="Send message"
          >
            <ArrowUp className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
}
