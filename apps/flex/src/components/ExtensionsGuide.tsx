import { Link } from 'react-router-dom';
import { MousePointerClick } from 'lucide-react';

export function ExtensionsGuide() {
  return (
    <details className="rounded-xl border border-flex-border/40 bg-flex-surface/20 text-sm group">
      <summary className="cursor-pointer list-none flex items-center gap-2 px-4 py-3 font-medium text-slate-200">
        <MousePointerClick className="w-4 h-4 text-flex-accent shrink-0" />
        How Flex plugins work
        <span className="ml-auto text-xs text-flex-muted group-open:hidden">Show</span>
      </summary>
      <div className="px-4 pb-4 space-y-3 text-flex-muted text-xs border-t border-flex-border/30 pt-3">
        <p>
          <strong className="text-slate-300">Core</strong> — built-in screens.{' '}
          <strong className="text-slate-300">Partner</strong> — EzTrac / dhub-rpt contracts.{' '}
          <strong className="text-slate-300">Extensions</strong> — optional add-ons below.
        </p>
      <ol className="list-decimal list-inside space-y-1 text-slate-400">
        <li>
          <Link to="/plugins" className="text-flex-accent underline">
            Publisher
          </Link>
        </li>
        <li>
          Open <strong>Partner plugins</strong> to test EzTrac or dhub-rpt
        </li>
        <li>Open <strong>All plugin APIs</strong> to see plugin IDs and datasets</li>
        <li>Open <strong>Extension add-ons</strong> to install Snowflake or Jira</li>
      </ol>
      </div>
    </details>
  );
}
