(function () {
  const HOST = location.hostname;
  const PATH = location.pathname + location.search;

  function detectContext() {
    if (/console\.aws\.amazon\.com|\.console\.aws\.amazon\.com/.test(HOST)) {
      if (/cost-management|costexplorer|billing|ce\//.test(PATH)) {
        return { label: 'Cost Explorer detected', route: '/cloud', hint: 'Open Flex cloud usage' };
      }
      if (/ec2|compute/.test(PATH)) {
        return { label: 'EC2 console', route: '/anomalies', hint: 'Check compute anomalies' };
      }
      return { label: 'AWS console', route: '/', hint: 'Open Flex dashboard' };
    }
    if (/portal\.azure\.com/.test(HOST)) {
      return { label: 'Azure portal', route: '/cloud', hint: 'Compare with Flex spend' };
    }
    if (/console\.cloud\.google\.com/.test(HOST)) {
      return { label: 'GCP console', route: '/cloud', hint: 'Open Flex cloud usage' };
    }
    return null;
  }

  const ctx = detectContext();
  if (!ctx) return;

  const storageKey = `flex_chip_dismiss_${HOST}`;
  if (sessionStorage.getItem(storageKey)) return;

  const root = document.createElement('div');
  root.id = 'flex-page-sense';

  root.innerHTML = `
    <button type="button" class="flex-chip-btn" id="flex-chip-open">
      <span class="flex-chip-icon">⚡</span>
      <span>
        <span style="display:block;font-size:11px;color:#94a3b8;font-weight:500">${ctx.label}</span>
        ${ctx.hint}
      </span>
      <button type="button" class="flex-chip-dismiss" id="flex-chip-dismiss" aria-label="Dismiss">×</button>
    </button>
  `;

  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = chrome.runtime.getURL('content/pageSense.css');
  document.head.appendChild(link);
  document.body.appendChild(root);

  document.getElementById('flex-chip-open').addEventListener('click', (e) => {
    if (e.target.closest('#flex-chip-dismiss')) return;
    chrome.storage.local.set({ flex_pending_route: ctx.route });
    chrome.runtime.sendMessage({ type: 'FLEX_OPEN_PANEL' });
  });

  document.getElementById('flex-chip-dismiss').addEventListener('click', (e) => {
    e.stopPropagation();
    sessionStorage.setItem(storageKey, '1');
    root.classList.add('hidden');
  });
})();
