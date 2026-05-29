import type { ExtensionAction } from './catalog.js';
export interface RunActionResult {
    ok: boolean;
    title: string;
    data?: unknown;
    error?: string;
    hint?: string;
}
export declare function runExtensionAction(action: ExtensionAction, options: {
    apiUrl: string;
    fetchFn?: typeof fetch;
}): Promise<RunActionResult>;
