// popup.js
const WIKI_BASE = 'https://en.wikipedia.org/wiki/List_of_people_named_in_the_Epstein_files#';

// ── Storage: prefs + status ───────────────────────────────────────────────────
chrome.storage.local.get(
  ['epsteinNames', 'namesFetchedAt', 'enabled', 'showIcon', 'showHighlight'],
  (result) => {
    const count = result.epsteinNames?.length ?? 155;
    const fetched = result.namesFetchedAt;

    let sourceStr;
    if (!fetched) {
      sourceStr = 'using built-in list';
    } else {
      const mins = Math.round((Date.now() - fetched) / 60_000);
      sourceStr = mins < 60 ? `updated ${mins}m ago` : `updated ${Math.round(mins / 60)}h ago`;
    }

    document.getElementById('status').textContent = `${count} names tracked · ${sourceStr}`;
    document.getElementById('count').textContent = `${count} names`;

    // Main enable toggle
    const cbEnabled = document.getElementById('enabled');
    cbEnabled.checked = result.enabled !== false;
    updateSubToggles(cbEnabled.checked);
    cbEnabled.addEventListener('change', () => {
      chrome.storage.local.set({ enabled: cbEnabled.checked });
      updateSubToggles(cbEnabled.checked);
    });

    // Show icon toggle
    const cbIcon = document.getElementById('showIcon');
    cbIcon.checked = result.showIcon !== false;
    cbIcon.addEventListener('change', () => {
      chrome.storage.local.set({ showIcon: cbIcon.checked });
    });

    // Highlight name toggle
    const cbHL = document.getElementById('showHighlight');
    cbHL.checked = result.showHighlight !== false;
    cbHL.addEventListener('change', () => {
      chrome.storage.local.set({ showHighlight: cbHL.checked });
    });
  }
);

function updateSubToggles(enabled) {
  document.getElementById('subToggles').classList.toggle('disabled', !enabled);
}

// ── Page hits: ask the active tab's content script ────────────────────────────
chrome.tabs.query({ active: true, currentWindow: true }, ([tab]) => {
  if (!tab?.id) return showNone('No active tab');

  chrome.tabs.sendMessage(tab.id, { type: 'getPageCounts' }, (response) => {
    if (chrome.runtime.lastError || !response) {
      return showNone('Not available on this page');
    }
    renderHits(response.entries);
  });
});

function renderHits(entries) {
  const list = document.getElementById('hitsList');

  if (!entries || entries.length === 0) {
    list.innerHTML = '<span class="none">No matches on this page</span>';
    return;
  }

  list.innerHTML = '';
  for (const { name, anchor, count } of entries) {
    const row = document.createElement('div');
    row.className = 'hit-row';

    const link = document.createElement('a');
    link.className = 'hit-name';
    link.href = WIKI_BASE + anchor;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    link.textContent = name;

    const badge = document.createElement('span');
    badge.className = 'hit-badge';
    badge.textContent = count;

    row.appendChild(link);
    row.appendChild(badge);
    list.appendChild(row);
  }
}

function showNone(msg) {
  document.getElementById('hitsList').innerHTML = `<span class="none">${msg}</span>`;
}
