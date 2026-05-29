import { useRef, useState } from 'react';
import { FileJson, Link2, Upload } from 'lucide-react';
import {
  installFromPackage,
  installFromPackageUrl,
  parseExtensionPackage,
} from '../plugins/manager';

export function InstallExtensionPackage({ onInstalled }: { onInstalled: () => void }) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [url, setUrl] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFile = async (file: File) => {
    setBusy(true);
    setError(null);
    try {
      const text = await file.text();
      const parsed = parseExtensionPackage(text);
      if ('error' in parsed) {
        setError(parsed.error);
        return;
      }
      const result = installFromPackage(parsed, 'package', file.name);
      if ('error' in result) setError(result.error);
      else {
        onInstalled();
      }
    } finally {
      setBusy(false);
    }
  };

  const handleUrl = async () => {
    if (!url.trim()) return;
    setBusy(true);
    setError(null);
    try {
      const result = await installFromPackageUrl(url.trim());
      if ('error' in result) setError(result.error);
      else onInstalled();
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="glass rounded-xl p-4 border border-flex-border/40 space-y-4">
      <p className="text-sm font-medium flex items-center gap-2">
        <Upload className="w-4 h-4 text-flex-accent" />
        Install like VS Code (from package file)
      </p>
      <p className="text-xs text-flex-muted">
        VS Code uses <code className="text-slate-300">.vsix</code> files. Flex uses{' '}
        <code className="text-slate-300">.flexext.json</code> — try{' '}
        <code className="text-slate-300">packages/plugin-manifests/snowflake.flexext.json</code> in this repo.
      </p>

      <div className="flex flex-wrap gap-2">
        <input
          ref={fileRef}
          type="file"
          accept=".json,.flexext.json,application/json"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) void handleFile(f);
            e.target.value = '';
          }}
        />
        <button
          type="button"
          disabled={busy}
          onClick={() => fileRef.current?.click()}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-flex-accent/15 text-flex-accent border border-flex-accent/40 text-sm font-medium hover:bg-flex-accent/25 disabled:opacity-50"
        >
          <FileJson className="w-4 h-4" />
          Install from file…
        </button>
      </div>

      <div className="flex flex-col sm:flex-row gap-2">
        <input
          type="url"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://…/my-extension.flexext.json"
          className="flex-1 px-3 py-2 rounded-lg bg-flex-surface border border-flex-border text-sm"
        />
        <button
          type="button"
          disabled={busy || !url.trim()}
          onClick={() => void handleUrl()}
          className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg border border-flex-border/50 text-sm hover:bg-flex-surface/40 disabled:opacity-50 shrink-0"
        >
          <Link2 className="w-4 h-4" />
          Install from URL
        </button>
      </div>

      {error && (
        <p className="text-xs text-flex-danger">{error}</p>
      )}
    </div>
  );
}
