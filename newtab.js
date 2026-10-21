"use strict";

browser.storage.local.get("url").then(({ url }) => {
  if (!url) {
    document.getElementById("setup").classList.add("show");
    document.getElementById("open-options").addEventListener("click", () => browser.runtime.openOptionsPage());
    return;
  }
  // The page is shown inside a frame instead of navigating the tab.
  // That way Firefox keeps the address bar empty and focused, and
  // nothing gets written into it while you type.
  const frame = document.createElement("iframe");
  frame.src = url;
  frame.setAttribute("allow", "fullscreen; autoplay; clipboard-write");
  frame.setAttribute("tabindex", "-1");
  document.body.appendChild(frame);
});
