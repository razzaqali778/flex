import type { ReactNode } from 'react';

interface TypewriterTextProps {
  text: string;
  isStreaming?: boolean;
}

function renderInline(text: string): ReactNode[] {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return (
        <strong key={i} className="font-semibold text-slate-100">
          {part.slice(2, -2)}
        </strong>
      );
    }
    return <span key={i}>{part}</span>;
  });
}

export function TypewriterText({ text, isStreaming }: TypewriterTextProps) {
  const paragraphs = text.split('\n\n');

  return (
    <div className="space-y-3 text-[15px] leading-relaxed text-slate-200">
      {paragraphs.map((para, i) => {
        const lines = para.split('\n');
        const isList = lines.some((l) => l.startsWith('• '));

        if (isList) {
          return (
            <ul key={i} className="list-none space-y-1.5 animate-chat-fade-in pl-0">
              {lines.map((line, j) =>
                line.startsWith('• ') ? (
                  <li key={j} className="flex gap-2">
                    <span className="text-flex-accent shrink-0">•</span>
                    <span>{renderInline(line.slice(2))}</span>
                  </li>
                ) : line ? (
                  <li key={j} className="list-none">{renderInline(line)}</li>
                ) : null
              )}
              {isStreaming && i === paragraphs.length - 1 && (
                <span className="inline-block w-0.5 h-[1.1em] ml-0.5 bg-flex-accent animate-blink" />
              )}
            </ul>
          );
        }

        return (
          <p key={i} className="animate-chat-fade-in">
            {renderInline(para)}
            {isStreaming && i === paragraphs.length - 1 && (
              <span className="inline-block w-0.5 h-[1.1em] ml-0.5 bg-flex-accent align-middle animate-blink" />
            )}
          </p>
        );
      })}
    </div>
  );
}
