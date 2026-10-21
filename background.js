"use strict";

const NEWTAB = browser.runtime.getURL("newtab.html");

// Is this request the page shown directly in our new tab page?
// Only the frame whose parent is the new tab page itself counts. Frames
// nested deeper (ads, embeds inside your chosen site) keep their normal
// protection against being framed, so they can't be used for clickjacking.
function isOurNewTabFrame(details) {
  if (details.parentFrameId !== 0) return false;
  const ancestors = details.frameAncestors || [];
  if (ancestors.length > 0) {
    return ancestors.length === 1 && !!ancestors[0].url && ancestors[0].url.startsWith(NEWTAB);
  }
  return !!details.documentUrl && details.documentUrl.startsWith(NEWTAB);
}

// Many sites forbid being shown inside a frame. Only for frames inside our
// new tab page, drop those restrictions so the page can be displayed.
browser.webRequest.onHeadersReceived.addListener(
  details => {
    if (!isOurNewTabFrame(details)) return;

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
