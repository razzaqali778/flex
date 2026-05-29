const BADGE_COLOR = '#fbbf24';
const BADGE_RISK = '#f87171';

function formatRisk(snapshot) {
  const pending = snapshot?.pendingCount ?? 0;
  const spend = snapshot?.totalSpend ?? 0;
  if (pending > 0 && spend > 0) {
    const riskK = Math.round((spend * 0.015 * pending) / 1000);
    return riskK > 0 ? `${pending}·$${riskK}K` : String(pending);
  }
  return pending > 0 ? String(pending) : '';
}

function updateBadge(snapshot) {
  const pending = snapshot?.pendingCount ?? 0;
  const anomalies = snapshot?.openAnomalies ?? 0;
  const text =
    pending > 0 ? formatRisk(snapshot) : anomalies > 0 ? '!' : '';
  chrome.action.setBadgeText({ text });
  chrome.action.setBadgeBackgroundColor({
    color: pending > 0 ? BADGE_COLOR : anomalies > 0 ? BADGE_RISK : '#00000000',
  });
}

async function loadSnapshot() {
  const data = await chrome.storage.local.get(['flex_snapshot', 'flex_state_v2']);
  if (data.flex_snapshot) {
    updateBadge(data.flex_snapshot);
    return;
  }
  try {
    const state = JSON.parse(data.flex_state_v2 || '{}');
    const pending = (state.dataRequests || []).filter((r) => r.status === 'pending').length;
    updateBadge({
      pendingCount: pending,
      openAnomalies: state.kpis?.openAnomalies ?? 0,
    });
  } catch {
    updateBadge({ pendingCount: 0, openAnomalies: 0 });
  }
}

chrome.runtime.onInstalled.addListener((details) => {
  chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: false });

  chrome.contextMenus.removeAll(() => {
    chrome.contextMenus.create({
      id: 'flex-open-panel',
      title: 'Open Flex command center',
      contexts: ['page', 'action'],
    });
    chrome.contextMenus.create({
      id: 'flex-open-alignment',
      title: 'Flex: Cross-App Alignment',
      contexts: ['page', 'action'],
    });
    chrome.contextMenus.create({
      id: 'flex-open-ai',
      title: 'Flex: Ask AI',
      contexts: ['page', 'action'],
    });
    chrome.contextMenus.create({
      id: 'flex-open-exchange',
      title: 'Flex: Data Exchange',
      contexts: ['page', 'action'],
    });
    chrome.contextMenus.create({
      id: 'flex-open-chargeback',
      title: 'Flex: Chargeback',
      contexts: ['page', 'action'],
    });
    chrome.contextMenus.create({
      id: 'flex-open-workforce',
      title: 'Flex: Workforce',
      contexts: ['page', 'action'],
    });
    chrome.contextMenus.create({
      id: 'flex-open-anomalies',
      title: 'Flex: Anomalies',
      contexts: ['page', 'action'],
    });
  });

  loadSnapshot();

  if (details.reason === 'install') {
    chrome.notifications.create('flex-welcome', {
      type: 'basic',
      iconUrl: 'icons/icon48.png',
      title: 'Flex FinOps is ready',
      message: 'Click the icon for quick view, or open the side panel for the full command center.',
    });
  }
});

chrome.storage.onChanged.addListener((changes, area) => {
  if (area !== 'local') return;
  if (changes.flex_snapshot?.newValue) {
    updateBadge(changes.flex_snapshot.newValue);
  }
});

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message.type === 'FLEX_STATE_UPDATED') {
    updateBadge(message.snapshot);
    sendResponse({ ok: true });
    return true;
  }

  if (message.type === 'FLEX_NOTIFY') {
    chrome.notifications.create({
      type: 'basic',
      iconUrl: 'icons/icon48.png',
      title: message.title || 'Flex',
      message: message.body || '',
    });
    sendResponse({ ok: true });
    return true;
  }

  if (message.type === 'FLEX_OPEN_PANEL') {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const windowId = tabs[0]?.windowId;
      if (windowId != null) chrome.sidePanel.open({ windowId });
    });
    sendResponse({ ok: true });
    return true;
  }

  if (message.type === 'FLEX_NAVIGATE') {
    chrome.storage.local.set({ flex_pending_route: message.route || '/' });
    sendResponse({ ok: true });
    return true;
  }

  return false;
});

chrome.contextMenus.onClicked.addListener((info) => {
  const routes = {
    'flex-open-panel': '/',
    'flex-open-alignment': '/govern/alignment',
    'flex-open-ai': '/assistant',
    'flex-open-exchange': '/govern/exchange',
    'flex-open-chargeback': '/chargeback',
    'flex-open-workforce': '/workforce',
    'flex-open-anomalies': '/anomalies',
  };
  const route = routes[info.menuItemId] || '/';
  chrome.storage.local.set({ flex_pending_route: route });
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    const windowId = tabs[0]?.windowId;
    if (windowId != null) chrome.sidePanel.open({ windowId });
  });
});

chrome.commands.onCommand.addListener((command) => {
  const routes = {
    'open-dashboard': '/',
    'open-exchange': '/govern/exchange',
    'open-ai': '/assistant',
    'open-insights': '/govern/alignment',
    'open-anomalies': '/anomalies',
    'open-chargeback': '/chargeback',
    'open-workforce': '/workforce',
  };
  const actions = {
    'open-global-search': 'global-search',
    'open-command-palette': 'command-palette',
  };

  if (actions[command]) {
    chrome.storage.local.set({ flex_pending_action: actions[command] });
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const windowId = tabs[0]?.windowId;
      if (windowId != null) chrome.sidePanel.open({ windowId });
    });
    return;
  }

  const route = routes[command] || '/';
  chrome.storage.local.set({ flex_pending_route: route });
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    const windowId = tabs[0]?.windowId;
    if (windowId != null) chrome.sidePanel.open({ windowId });
  });
});

loadSnapshot();
