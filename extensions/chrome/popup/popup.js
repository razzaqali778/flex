const STORAGE_KEY = 'flex_state_v2';
const WORKFLOW_KEY = 'flex_workflow_notification';
const API_URL_KEY = 'flex_api_url';
const DEFAULT_API = 'http://localhost:3847';

function formatSpend(n) {
  if (!n) return '$0';
  return `$${(n / 1000).toFixed(1)}K`;
}

function statusClass(status) {
  if (status === 'approved' || status === 'delivered') return 'status-approved';
  if (status === 'rejected') return 'status-rejected';
  return '';
}

async function getApiUrl() {
  const data = await chrome.storage.local.get([API_URL_KEY]);
  return data[API_URL_KEY] || DEFAULT_API;
}

async function runCatalogAction(action, apiUrl) {
  const base = apiUrl.replace(/\/$/, '');
  if (action.kind === 'connect') {
    const res = await fetch(`${base}/health`);
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || `HTTP ${res.status}`);
    return data;
  }
  if (action.kind === 'consume') {
    const res = await fetch(`${base}/api/v1/consume`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pluginId: action.pluginId, dataset: action.dataset }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || `HTTP ${res.status}`);
    return data;
  }
  if (action.kind === 'produce') {
    const res = await fetch(`${base}/api/v1/produce`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        pluginId: action.pluginId,
        dataset: action.dataset,
        records: action.records || [],
        sourceApp: 'eztrac',
      }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || `HTTP ${res.status}`);
    return data;
  }
  throw new Error(`Unsupported: ${action.kind}`);
}

function renderWorkflowBanner(notification) {
  const banner = document.getElementById('workflow-banner');
  const badge = document.getElementById('workflow-badge');
  const title = document.getElementById('workflow-title');
  const sub = document.getElementById('workflow-sub');
  if (!banner || !badge || !title || !sub) return;

  if (!notification) {
    banner.classList.add('hidden');
    banner.classList.remove('approved', 'rejected');
    return;
  }

  const ageMs = Date.now() - new Date(notification.at).getTime();
  if (ageMs > 30 * 60 * 1000) {
    banner.classList.add('hidden');
    return;
  }

  banner.classList.remove('hidden', 'approved', 'rejected');
  banner.classList.add(notification.outcome === 'approved' ? 'approved' : 'rejected');
  badge.textContent = notification.outcome === 'approved' ? 'Approved' : 'Rejected';
  title.textContent = `${notification.dataset} · ${notification.fromApp}`;
  sub.textContent = notification.slackSent
    ? `Slack sent to #${notification.channel}`
    : `Notify ${notification.audienceLabel} · #${notification.channel}`;
}

function render(snapshot, state, workflowNotification) {
  document.getElementById('spend').textContent = formatSpend(snapshot?.totalSpend);
  const change = snapshot?.spendChange ?? 0;
  const changeEl = document.getElementById('spend-change');
  changeEl.textContent = `${change >= 0 ? '+' : ''}${change}% vs last month`;
  changeEl.className = 'kpi-sub' + (change > 0 ? ' negative' : '');

  document.getElementById('util').textContent =
    snapshot?.utilization != null ? `${snapshot.utilization}%` : '—';

  const pending = snapshot?.pendingCount ?? 0;
  document.getElementById('pending').textContent = String(pending);
  const pendingBox = document.getElementById('pending-box');
  pendingBox.classList.toggle('has-pending', pending > 0);

  document.getElementById('anomalies').textContent = String(snapshot?.openAnomalies ?? 0);

  renderWorkflowBanner(workflowNotification);

  const activity = document.getElementById('activity');
  activity.innerHTML = '';
  const logs = state?.transferLog?.slice(0, 4) ?? [];
  if (logs.length === 0) {
    activity.innerHTML = '<li>Open side panel to sync activity</li>';
  } else {
    logs.forEach((t) => {
      const li = document.createElement('li');
      li.className = statusClass(t.status);
      li.innerHTML = `<strong>${t.status}</strong> ${t.message}`;
      activity.appendChild(li);
    });
  }

  const updated = document.getElementById('updated');
  if (snapshot?.lastUpdated) {
    updated.textContent = 'Updated ' + new Date(snapshot.lastUpdated).toLocaleTimeString();
  }
}

async function checkApiStatus() {
  const el = document.getElementById('api-status');
  if (!el) return;
  try {
    const apiUrl = await getApiUrl();
    const res = await fetch(`${apiUrl.replace(/\/$/, '')}/health`);
    if (res.ok) {
      el.textContent = 'API on';
      el.className = 'api-status online';
    } else {
      el.textContent = 'API err';
      el.className = 'api-status offline';
    }
  } catch {
    el.textContent = 'API off';
    el.className = 'api-status offline';
  }
}

async function renderPluginActions(catalog) {
  const container = document.getElementById('plugin-actions');
  if (!container || !catalog?.actions) return;

  const actions = catalog.actions.filter(
    (a) =>
      a.hosts.includes('chrome') &&
      (a.kind === 'consume' || a.kind === 'produce' || a.kind === 'connect')
  );

  container.innerHTML = '';
  const apiUrl = await getApiUrl();

  for (const action of actions.slice(0, 6)) {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'plugin-action-btn';
    btn.textContent = action.label;
    btn.title = action.description;
    btn.addEventListener('click', async () => {
      btn.disabled = true;
      try {
        const data = await runCatalogAction(action, apiUrl);
        chrome.notifications.create({
          type: 'basic',
          iconUrl: '../icons/icon48.png',
          title: action.label,
          message:
            action.kind === 'produce'
              ? 'Sent to Flex — open Governance to approve'
              : `OK — ${action.dataset || 'done'}`,
        });
        if (action.route) {
          chrome.runtime.sendMessage({ type: 'FLEX_NAVIGATE', route: action.route });
          chrome.runtime.sendMessage({ type: 'FLEX_OPEN_PANEL' });
        }
        console.info('[Flex popup]', action.id, data);
      } catch (e) {
        chrome.notifications.create({
          type: 'basic',
          iconUrl: '../icons/icon48.png',
          title: `${action.label} failed`,
          message: e.message || String(e),
        });
      } finally {
        btn.disabled = false;
      }
    });
    container.appendChild(btn);
  }
}

async function loadCatalog() {
  try {
    const url = chrome.runtime.getURL('../shared/extensionCatalog.json');
    const res = await fetch(url);
    return res.json();
  } catch {
    return { actions: [] };
  }
}

async function load() {
  const data = await chrome.storage.local.get([STORAGE_KEY, 'flex_snapshot', WORKFLOW_KEY]);
  let state = null;
  try {
    if (data[STORAGE_KEY]) state = JSON.parse(data[STORAGE_KEY]);
  } catch {
    /* ignore */
  }
  const snapshot =
    data.flex_snapshot ||
    (state
      ? {
          pendingCount: (state.dataRequests || []).filter((r) => r.status === 'pending').length,
          openAnomalies: state.kpis?.openAnomalies ?? 0,
          totalSpend: state.kpis?.totalSpend ?? 0,
          spendChange: state.kpis?.spendChange ?? 0,
          utilization: state.kpis?.utilization ?? 0,
        }
      : null);
  render(snapshot, state, data[WORKFLOW_KEY] ?? null);

  const catalog = await loadCatalog();
  await renderPluginActions(catalog);
  await checkApiStatus();
}

function openPanel() {
  chrome.runtime.sendMessage({ type: 'FLEX_OPEN_PANEL' });
  window.close();
}

function openApp(route) {
  const hash = route ? `#${route}` : '';
  chrome.tabs.create({ url: chrome.runtime.getURL(`app/index.html${hash}`) });
  window.close();
}

document.getElementById('open-panel').addEventListener('click', openPanel);
document.getElementById('open-full').addEventListener('click', () => openApp(''));
const fullQuick = document.getElementById('open-full-quick');
if (fullQuick) fullQuick.addEventListener('click', () => openApp(''));

document.querySelectorAll('[data-route]').forEach((btn) => {
  btn.addEventListener('click', () => {
    openPanel();
    chrome.runtime.sendMessage({
      type: 'FLEX_NAVIGATE',
      route: btn.getAttribute('data-route'),
    });
  });
});

const workflowBanner = document.getElementById('workflow-banner');
if (workflowBanner) {
  workflowBanner.addEventListener('click', () => {
    openPanel();
    chrome.runtime.sendMessage({ type: 'FLEX_NAVIGATE', route: '/govern/exchange' });
  });
  workflowBanner.style.cursor = 'pointer';
}

chrome.storage.onChanged.addListener((changes, area) => {
  if (
    area === 'local' &&
    (changes.flex_snapshot || changes[STORAGE_KEY] || changes[WORKFLOW_KEY])
  ) {
    load();
  }
});

load();
