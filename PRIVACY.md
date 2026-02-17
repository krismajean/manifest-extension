# Privacy Policy — Manifest

*Last updated: February 2026*

## Overview

Manifest is a free, open-source Chrome extension built for public interest. This policy explains what data the extension accesses, how it is used, and what is never collected.

---

## What the extension accesses

When you visit a webpage, Manifest reads the **text content of that page** locally in your browser to check whether any names from the Epstein files Wikipedia list appear on it. This processing happens entirely on your device.

---

## What the extension does NOT do

- Does not collect, store, or transmit any personal data
- Does not track your browsing history
- Does not send page content to any server
- Does not use analytics or telemetry of any kind
- Does not display advertising
- Does not sell or share any data with third parties

---

## External network requests

The only external request Manifest makes is to the **Wikipedia API** to fetch and locally cache the list of names from the article *List of people named in the Epstein files*. This request:

- Contains no personal information
- Is made once on install and then refreshed once every 24 hours
- Is made directly to Wikipedia's public API (`en.wikipedia.org`)

No other network requests are made.

---

## Local storage

Manifest stores the following in your browser's local extension storage (`chrome.storage.local`):

- The cached name list fetched from Wikipedia
- Your display preferences (highlight color, icon visibility, etc.)

This data never leaves your device.

---

## Permissions explained

| Permission | Why it's needed |
|---|---|
| `<all_urls>` | To scan text on any webpage you visit for matching names |
| `storage` | To save the name list cache and your preferences locally |
| `tabs` | To send the match count from the current tab to the popup |
| `alarms` | To schedule the daily Wikipedia name list refresh |
| `scripting` | To update the toolbar badge count |

---

## Open source

Manifest is fully open source. You can inspect all code at:
[https://github.com/krismajean/manifest-extension](https://github.com/krismajean/manifest-extension)

---

## Contact

If you have questions about this privacy policy, please open an issue on the GitHub repository above.
