# Focus New Tab

A Firefox extension that shows a page of your choice on every new tab while keeping the address bar **empty and focused**, so you can start typing a search immediately.

## Why

Extensions like New Tab Override load your URL by navigating the tab. When the page finishes loading, Firefox writes that URL into the address bar, on top of whatever you were already typing (e.g. `football matchhttps://www...`).

Focus New Tab never navigates the tab. It displays your page inside its own new-tab page, so Firefox treats the tab as an ordinary empty new tab: the address bar stays empty and focused.

## Features

- Your chosen page on every new tab, with the cursor in the address bar.
- Sites that refuse to be displayed inside another page are allowed to load, but only your chosen page itself. Ads and embeds inside it keep their normal protection.
- Clicking a link or submitting a search on the page opens it in the tab normally, so the address bar shows the real URL and Back works.

## Install

1. Disable any other new-tab extension (e.g. New Tab Override).
2. Install the extension:
   - **Temporary:** `about:debugging#/runtime/this-firefox` → **Load Temporary Add-on…** → select `manifest.json`. Removed when Firefox restarts.
   - **Permanent:** sign it for free (unlisted) via the [Firefox Add-on Developer Hub](https://addons.mozilla.org/developers/) and install the signed `.xpi`.
3. Open a new tab, choose **Keep** when Firefox asks about the new-tab change, then click **Choose a page** and enter your URL. You can change it later under Add-ons → Focus New Tab → Options.

## How to use

### Set your page

1. Open a new tab and click **Choose a page**, or go to `about:addons` → **Focus New Tab** → **Options**.
2. Type the address of the page you want, e.g. `www.example.com`. You can leave out `https://`; it's added for you.
3. Click **Save** or press **Enter**.

### Search from a new tab

1. Press **Ctrl+T** (**⌘T** on Mac) or click **+**.
2. Start typing straight away. The cursor is already in the address bar, and your page appears behind it.
3. Press **Enter** to search or go to the address you typed. Your text stays exactly as you typed it, even if the page is still loading.

### Use the page itself

- Click anywhere on the page to use it as normal.
- **Clicking a link** opens it in the current tab, so the address bar shows the real URL and **Back** returns you to your new-tab page.
- **Ctrl+click**, **middle-click**, or links that normally open in a new tab still open in a new tab.
- **Searching on the page** (e.g. a search box on your chosen site) also opens the results in the tab.

### Change or remove your page

- To change it, go to `about:addons` → **Focus New Tab** → **Options**, enter a new address and save.
- To remove it, clear the field and save. New tabs will then show the **Choose a page** button.
- To go back to Firefox's normal new tab, disable or remove the extension in `about:addons`.

## Build

No build step. Zip the files with `manifest.json` at the top level:

```sh
zip -r focus-newtab.xpi manifest.json *.js *.html
```

## Files

| File | Purpose |
| --- | --- |
| `manifest.json` | Extension manifest and permissions |
| `newtab.html`, `newtab.js` | New-tab page that shows your chosen site |
| `background.js` | Lifts frame blocking on the new-tab page; opens clicked links in the tab |
| `frame.js` | Runs inside the displayed site and forwards link clicks and searches |
| `options.html`, `options.js` | Settings page for the URL |

## Limitations

- Desktop Firefox 140+ only. Firefox for Android doesn't allow extensions to replace the new-tab page.
- Some sites may show you as logged out, or not work fully, when displayed inside the new-tab page.
