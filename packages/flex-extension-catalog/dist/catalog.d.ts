export type ExtensionHost = 'web' | 'chrome' | 'vscode' | 'sidepanel';
export type ExtensionActionKind = 'consume' | 'produce' | 'navigate' | 'connect' | 'open-web';
export type ExtensionActionCategory = 'overview' | 'governance' | 'cost' | 'partner' | 'navigation' | 'tools';
export interface ExtensionAction {
    id: string;
    label: string;
    description: string;
    kind: ExtensionActionKind;
    category: ExtensionActionCategory;
    hosts: ExtensionHost[];
    pluginId?: string;
    dataset?: string;
    /** Static produce payload (demo) */
    records?: unknown[];
    /** Side panel / browser route */
    route?: string;
    /** VS Code command id suffix (flex.<id>) */
    commandId?: string;
}
/** Single catalog — same plugin contracts across Chrome, VS Code, and web */
export declare const EXTENSION_ACTIONS: ExtensionAction[];
export declare function getActionsForHost(host: ExtensionHost): ExtensionAction[];
export declare function getActionById(id: string): ExtensionAction | undefined;
export declare const DEFAULT_API_URL = "http://localhost:3847";
export declare const DEFAULT_WEB_URL = "http://localhost:5173";
