"use strict";

// Runs in frames. Only does anything when this frame is the page shown
// directly inside our new tab: then clicked links and search forms open in
// the tab itself, so the address bar shows the real URL and Back works.
(() => {
  if (window === window.top || window.parent !== window.top) return;

  browser.runtime.sendMessage({ type: "check" }).then(ok => {
    if (!ok) return;

    const go = url => browser.runtime.sendMessage({ type: "go", url }).catch(() => {});
    const samePageTargets = ["", "_self", "_top", "_parent"];

    document.addEventListener(
      "click",
      e => {
        if (!e.isTrusted) return; // only real clicks, not ones faked by the page's scripts
        if (e.button !== 0 || e.ctrlKey || e.metaKey || e.shiftKey || e.altKey) return;
        const a = e.target && e.target.closest && e.target.closest("a[href]");
        if (!a) return;
        if (!samePageTargets.includes((a.target || "").toLowerCase())) return; // let _blank etc. behave normally

        const url = new URL(a.href, location.href);
        if (!/^https?:$/.test(url.protocol)) return;
        // Leave in-page anchors (#section) alone
        if (url.hash && url.origin + url.pathname + url.search === location.origin + location.pathname + location.search) return;

        e.preventDefault();
        e.stopImmediatePropagation();
        go(url.href);
      },
      true
    );

    // Plain GET search forms (only if the site didn't handle the submit itself)
    window.addEventListener("submit", e => {
      if (e.defaultPrevented) return;
      // only searches you actually submitted (click or Enter), not ones triggered by the page's scripts
      if (!e.isTrusted || !(navigator.userActivation && navigator.userActivation.isActive)) return;
      const form = e.target;
      if (!(form instanceof HTMLFormElement)) return;
      if ((form.method || "get").toLowerCase() !== "get") return;
      if (!samePageTargets.includes((form.target || "").toLowerCase())) return;

      const url = new URL(form.action || location.href, location.href);
      if (!/^https?:$/.test(url.protocol)) return;
      const data = new FormData(form, e.submitter || undefined);
      const params = new URLSearchParams();
      for (const [k, v] of data) if (typeof v === "string") params.append(k, v);
      url.search = params.toString();

      e.preventDefault();
      go(url.href);
    });
  }).catch(() => {});
})();
