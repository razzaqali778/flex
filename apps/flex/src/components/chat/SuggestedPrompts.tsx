import { MessageSquarePlus } from 'lucide-react';

const PROMPTS = [
  'What is FinOps and how does Flex help?',
  'What tools does EzTrac use and how is it built?',
  'What is dhub-rpt (RTP) and the squad/platform hierarchy?',
  'Which teams work under which squads on Digital Hub?',
  'How does Flex solve data governance with EzTrac and dhub-rpt?',
  'What are our open anomalies and what should we prioritize?',
  'Summarize EzTrac initiatives and budgets for FY2026',
  'Which dhub-rpt squads are over-allocated?',
];

interface SuggestedPromptsProps {
  onSelect: (prompt: string) => void;
  disabled?: boolean;
}

export function SuggestedPrompts({ onSelect, disabled }: SuggestedPromptsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-w-2xl mx-auto w-full">
      {PROMPTS.map((prompt, i) => (
        <button
          key={prompt}
          type="button"
          disabled={disabled}
          onClick={() => onSelect(prompt)}
          className="group flex items-start gap-2 text-left px-4 py-3 rounded-xl border border-flex-border/50 bg-flex-surface/30 hover:border-flex-accent/40 hover:bg-flex-accent/5 transition-all duration-300 disabled:opacity-40 animate-chat-fade-in"
          style={{ animationDelay: `${i * 60}ms` }}
        >
          <MessageSquarePlus className="w-4 h-4 mt-0.5 text-flex-muted group-hover:text-flex-accent shrink-0 transition-colors" />
          <span className="text-sm text-slate-300 group-hover:text-slate-100">{prompt}</span>
        </button>
      ))}
    </div>
  );
}
