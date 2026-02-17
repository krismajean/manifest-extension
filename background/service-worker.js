// background/service-worker.js
// Fetches the name list from Wikipedia and caches it in chrome.storage.local.
// Content scripts use this cache; falls back to hardcoded names if unavailable.

const WIKI_API =
  'https://en.wikipedia.org/w/api.php' +
  '?action=parse' +
  '&page=List_of_people_named_in_the_Epstein_files' +
  '&prop=sections' +
  '&format=json' +
  '&origin=*';

const CACHE_MAX_AGE_MS = 24 * 60 * 60 * 1000;

// Single-letter headers (A, B, C...) and navigation sections to skip
const SKIP_SECTIONS = new Set(['References', 'External links', 'Contents', 'See also', 'Notes']);

async function fetchAndCacheNames() {
  try {
    const resp = await fetch(WIKI_API);
    if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
    const data = await resp.json();

    const sections = data?.parse?.sections ?? [];
    const names = [];

    for (const s of sections) {
      const name = s.line?.trim();
      const anchor = s.anchor?.trim();
      if (!name || !anchor) continue;
      // Skip single-letter alphabet grouping headers (A, B, C, ...)
      if (/^[A-Za-z]$/.test(name)) continue;
      if (SKIP_SECTIONS.has(name)) continue;
      names.push({ name, anchor });
    }

    // Sanity check — reject obviously broken responses
    if (names.length > 50) {
      await chrome.storage.local.set({
        epsteinNames: names,
        namesFetchedAt: Date.now(),
      });
      console.log(`[Epstein Highlighter] Cached ${names.length} names from Wikipedia`);
    }
  } catch (err) {
    console.warn('[Epstein Highlighter] Failed to refresh names from Wikipedia:', err.message);
    // Non-fatal: content scripts will use HARDCODED_NAMES as fallback
  }
}

chrome.runtime.onInstalled.addListener(async ({ reason }) => {
  if (reason === 'install' || reason === 'update') {
    await fetchAndCacheNames();
  }
  // Schedule a daily refresh
  chrome.alarms.create('refreshEpsteinNames', { periodInMinutes: 1440 });
});

chrome.runtime.onStartup.addListener(async () => {
  const { namesFetchedAt } = await chrome.storage.local.get('namesFetchedAt');
  if (!namesFetchedAt || Date.now() - namesFetchedAt > CACHE_MAX_AGE_MS) {
    await fetchAndCacheNames();
  }
});

chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === 'refreshEpsteinNames') {
    fetchAndCacheNames();
  }
});

// ── Badge ─────────────────────────────────────────────────────────────────────
chrome.runtime.onMessage.addListener((msg, sender) => {
  if (msg.type !== 'setBadge') return;
  const tabId = sender.tab?.id;
  if (!tabId) return;

  if (msg.count > 0) {
    const label = msg.count > 999 ? '999+' : String(msg.count);
    chrome.action.setBadgeText({ text: label, tabId });
    chrome.action.setBadgeBackgroundColor({ color: '#1a3a5c', tabId });
    chrome.action.setBadgeTextColor({ color: '#ffe066', tabId });
  } else {
    chrome.action.setBadgeText({ text: '', tabId });
  }
});

// Clear badge when navigating to a new page
chrome.tabs.onUpdated.addListener((tabId, changeInfo) => {
  if (changeInfo.status === 'loading') {
    chrome.action.setBadgeText({ text: '', tabId });
  }
});
