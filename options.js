"use strict";

const input = document.getElementById("url");
const status = document.getElementById("status");

browser.storage.local.get("url").then(({ url }) => { if (url) input.value = url; });

function save() {
  let value = input.value.trim();
  if (!value) {
    browser.storage.local.remove("url").then(() => (status.textContent = "Cleared."));
    return;
  }
  if (!/^[a-z][a-z0-9+.-]*:/i.test(value)) value = "https://" + value;
  let parsed;
  try { parsed = new URL(value); } catch { parsed = null; }
  if (!parsed || !/^https?:$/.test(parsed.protocol)) {
    status.textContent = "Please enter a web address (http or https).";
    return;
  }
  input.value = parsed.href;
  browser.storage.local.set({ url: parsed.href }).then(() => (status.textContent = "Saved. Open a new tab to try it."));
}

document.getElementById("save").addEventListener("click", save);
input.addEventListener("keydown", e => { if (e.key === "Enter") save(); });
