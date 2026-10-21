"use strict";

const BASE = browser.runtime.getURL("");
const NEWTAB = browser.runtime.getURL("newtab.html");

// Is this request a frame loaded (directly or nested) inside our new tab page?
function insideOurNewTab(details) {
  if (details.documentUrl && details.documentUrl.startsWith(BASE)) return true;
  return (details.frameAncestors || []).some(a => a.url && a.url.startsWith(BASE));
}

// Many sites forbid being shown inside a frame. Only for frames inside our
// new tab page, drop those restrictions so the page can be displayed.
browser.webRequest.onHeadersReceived.addListener(
  details => {
    if (!insideOurNewTab(details)) return;

    const out = [];
    for (const h of details.responseHeaders) {
      const name = h.name.toLowerCase();

      if (name === "x-frame-options") continue;

      if (name === "content-security-policy" && h.value) {
        const cleaned = h.value
          .split(",")
          .map(policy =>
            policy
              .split(";")
              .filter(dir => !/^\s*frame-ancestors\b/i.test(dir))
              .join(";")
          )
          .filter(policy => policy.trim())
          .join(",");
        if (cleaned.replace(/[\s;,]/g, "")) out.push({ name: h.name, value: cleaned });
        continue;
      }

      out.push(h);
    }
    return { responseHeaders: out };
  },
  { urls: ["<all_urls>"], types: ["sub_frame"] },
  ["blocking", "responseHeaders"]
);

function isOurNewTab(tab) {
  return !!tab && !!tab.url && (tab.url.startsWith(NEWTAB) || tab.url === "about:newtab");
}

// The helper script inside the framed page asks whether it is in our new tab,
// and asks us to open clicked links in the real tab (so the address bar updates).
browser.runtime.onMessage.addListener((msg, sender) => {
  if (!msg || sender.frameId === 0 || !isOurNewTab(sender.tab)) {
    return Promise.resolve(false);
  }
  if (msg.type === "check") return Promise.resolve(true);
  if (msg.type === "go" && typeof msg.url === "string" && /^https?:/i.test(msg.url)) {
    return browser.tabs.update(sender.tab.id, { url: msg.url }).then(() => true);
  }
  return Promise.resolve(false);
});
