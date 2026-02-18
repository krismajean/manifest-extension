# Justification for `alarms` permission

Use this when the Chrome Web Store asks why the extension needs the **alarms** permission.

---

## Short (for store form / character limit)

**alarms:** Used only when the user enables "Auto-sync from Wikipedia" in the popup and has granted the optional Wikipedia host permission. A single alarm runs every 24 hours to refresh the cached name list from Wikipedia. If auto-sync is off, no alarm is created and there is no background scheduling.

---

## One-line version

The alarms permission is used only for an optional "Auto-sync from Wikipedia" feature: when the user turns it on and grants Wikipedia access, one alarm runs every 24 hours to refresh the cached name list; otherwise no alarms are used.

---

## Technical detail (for review or appeal)

- **API used:** `chrome.alarms.create`, `chrome.alarms.onAlarm`, `chrome.alarms.clear`
- **Single alarm name:** `refreshEpsteinNames`
- **Period:** 24 hours (1440 minutes)
- **When created:** Only if the user has (1) granted optional host permission for `https://en.wikipedia.org/*` and (2) enabled the "Auto-sync from Wikipedia" toggle in the popup. The alarm is also created/confirmed on browser startup when both conditions are true.
- **When cleared:** When the user turns off "Auto-sync from Wikipedia," the extension calls `chrome.alarms.clear(ALARM_NAME)` so no periodic work runs.
- **What runs on alarm:** The background service worker fetches the public Wikipedia API page for the Epstein files list, parses it, and updates `chrome.storage.local`. No user data or browsing history is involved.

Without the alarms permission, we could not offer the optional 24-hour refresh; the user would need to click "Sync from Wikipedia" manually to update the list.
