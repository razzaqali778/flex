import { useState } from 'react';
import { Check, Copy } from 'lucide-react';

export function OutputPanel({
  output,
  onClear,
  title = 'Last response',
}: {
  output: unknown;
  onClear?: () => void;
  title?: string;
}) {
  const [copied, setCopied] = useState(false);

  if (!output) return null;

  const json = JSON.stringify(output, null, 2);
  const summary =
    output && typeof output === 'object' && 'message' in output
      ? String((output as { message: string }).message)
      : null;

  const copyJson = async () => {
    try {
      await navigator.clipboard.writeText(json);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      /* clipboard unavailable */
    }
  };

  return (
    <section className="output-panel">
      <div className="output-panel-header">
        <span>{title}</span>
        <div className="output-panel-actions">
          <button type="button" className="btn btn-ghost" onClick={() => void copyJson()}>
            {copied ? <Check size={14} /> : <Copy size={14} />}
            {copied ? 'Copied' : 'Copy JSON'}
          </button>
          {onClear && (
            <button type="button" className="btn btn-ghost" onClick={onClear}>
              Clear
            </button>
          )}
        </div>
      </div>
      {summary && <p className="output-panel-summary">{summary}</p>}
      <details className="output-panel-details">
        <summary>Technical response</summary>
        <pre>{json}</pre>
      </details>
    </section>
  );
}
