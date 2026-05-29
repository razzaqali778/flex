export type ExtensionHost = 'web' | 'chrome' | 'vscode' | 'sidepanel';

export type ExtensionActionKind = 'consume' | 'produce' | 'navigate' | 'connect' | 'open-web';

export interface ExtensionAction {
  id: string;
  label: string;
  description: string;
  kind: ExtensionActionKind;
  category: string;
  hosts: ExtensionHost[];
  pluginId?: string;
  dataset?: string;
  records?: unknown[];
  route?: string;
  commandId?: string;
}

export interface ExtensionCatalogFile {
  version: string;
  defaultApiUrl: string;
  defaultWebUrl: string;
  actions: ExtensionAction[];
}
