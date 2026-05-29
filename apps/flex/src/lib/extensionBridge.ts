const STORAGE_KEY = 'flex_state_v2';

export function isExtensionContext(): boolean {
  return typeof chrome !== 'undefined' && !!chrome.runtime?.id;
}

export interface ExtensionSnapshot {
  pendingCount: number;
  openAnomalies: number;
  totalSpend: number;
  spendChange: number;
  utilization: number;
  lastUpdated: string;
}

export function snapshotFromState(raw: string | null): ExtensionSnapshot | null {
  if (!raw) return null;
  try {
    const s = JSON.parse(raw) as {
      kpis?: {
        totalSpend?: number;
        spendChange?: number;
        utilization?: number;
        openAnomalies?: number;
      };
      dataRequests?: { status: string }[];
    };
    const pending = (s.dataRequests ?? []).filter((r) => r.status === 'pending').length;
    return {
      pendingCount: pending,
      openAnomalies: s.kpis?.openAnomalies ?? 0,
      totalSpend: s.kpis?.totalSpend ?? 0,
      spendChange: s.kpis?.spendChange ?? 0,
      utilization: s.kpis?.utilization ?? 0,
      lastUpdated: new Date().toISOString(),
    };
  } catch {
    return null;
  }
}

/** Mirror flex state to chrome.storage for popup + badge */
export function syncToExtensionStorage(stateJson: string): void {
  if (!isExtensionContext()) return;
  const c = chrome;
  if (!c?.storage?.local || !c.runtime) return;

  const snapshot = snapshotFromState(stateJson);
  c.storage.local.set({
    [STORAGE_KEY]: stateJson,
    flex_snapshot: snapshot,
  });

  const send = c.runtime.sendMessage?.({ type: 'FLEX_STATE_UPDATED', snapshot });
  if (send) void send.catch(() => {});
}

export function notifyExtension(title: string, body: string): void {
  if (!isExtensionContext()) return;
  const send = chrome?.runtime?.sendMessage?.({ type: 'FLEX_NOTIFY', title, body });
  if (send) void send.catch(() => {});
}

export interface StoredWorkflowNotification {
  outcome: 'approved' | 'rejected';
  dataset: string;
  fromApp: string;
  recordCount: number;
  channel: string;
  audienceLabel: string;
  audience: 'finance' | 'platform';
  at: string;
  slackSent: boolean;
}

const WORKFLOW_NOTIFY_KEY = 'flex_workflow_notification';

/** Mirror latest approve/reject for popup + badge context */
export function syncWorkflowNotification(record: StoredWorkflowNotification): void {
  if (!isExtensionContext()) return;
  const c = chrome;
  if (!c?.storage?.local) return;
  void c.storage.local.set({ [WORKFLOW_NOTIFY_KEY]: record });
}

export function openSidePanel(): void {
  if (!isExtensionContext()) return;
  const send = chrome?.runtime?.sendMessage?.({ type: 'FLEX_OPEN_PANEL' });
  if (send) void send.catch(() => {});
}

export function openFullApp(route = ''): void {
  if (!isExtensionContext() || !chrome?.runtime?.getURL || !chrome?.tabs?.create) return;
  const path = route ? `app/index.html#${route}` : 'app/index.html';
  chrome.tabs.create({ url: chrome.runtime.getURL(path) });
}
