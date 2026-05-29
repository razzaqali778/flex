/// <reference types="vite/client" />

interface ChromeRuntime {
  id?: string;
  getURL?: (path: string) => string;
  sendMessage?: (message: unknown) => Promise<unknown>;
  onMessage?: {
    addListener: (
      cb: (
        message: unknown,
        sender: unknown,
        sendResponse: (r?: unknown) => void
      ) => boolean | void
    ) => void;
    removeListener?: (cb: (message: unknown) => void) => void;
  };
  onInstalled?: { addListener: (cb: (details: { reason: string }) => void) => void };
  openOptionsPage?: () => void;
}

interface ChromeTabs {
  create: (props: { url: string }) => void;
}

interface ChromeAction {
  setBadgeText: (details: { text: string }) => void;
  setBadgeBackgroundColor: (details: { color: string }) => void;
}

interface ChromeSidePanel {
  open: (opts: { windowId?: number }) => void;
  setPanelBehavior: (opts: { openPanelOnActionClick: boolean }) => void;
}

interface ChromeNotifications {
  create: (id: string | object, opts?: object) => void;
}

interface ChromeCommands {
  onCommand?: { addListener: (cb: (command: string) => void) => void };
}

interface Chrome {
  runtime?: ChromeRuntime;
  tabs?: ChromeTabs;
  action?: ChromeAction;
  sidePanel?: ChromeSidePanel;
  notifications?: ChromeNotifications;
  commands?: ChromeCommands;
  storage?: {
    local: {
      get: (keys: string | string[] | null) => Promise<Record<string, unknown>>;
      set: (items: Record<string, unknown>) => Promise<void>;
      remove?: (keys: string | string[]) => Promise<void>;
      onChanged?: {
        addListener: (
          cb: (
            changes: Record<string, { newValue?: unknown }>,
            area: string
          ) => void
        ) => void;
      };
    };
  };
}

declare const chrome: Chrome | undefined;
