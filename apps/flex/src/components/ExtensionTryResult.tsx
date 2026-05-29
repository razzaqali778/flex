import type { PluginConsumeResult } from '../plugins/types';

export function ExtensionTryResult({
  result,
  error,
}: {
  result: PluginConsumeResult | null;
  error: string | null;
}) {
  if (error) {
    return (
      <div className="p-3 rounded-lg border border-flex-danger/40 bg-flex-danger/10 text-xs text-flex-danger">
        {error}
      </div>
    );
  }
  if (!result?.ok) return null;

  return (
    <div className="p-3 rounded-lg border border-flex-success/30 bg-flex-success/5 text-xs">
      <p className="text-flex-success font-medium mb-2">
        API worked — {result.meta.recordCount} record(s) from <code className="font-mono">{result.dataset}</code>
      </p>
      <pre className="text-slate-300 overflow-x-auto max-h-40 font-mono">
        {JSON.stringify(result.records.slice(0, 3), null, 2)}
        {result.records.length > 3 ? '\n…' : ''}
      </pre>
    </div>
  );
}
