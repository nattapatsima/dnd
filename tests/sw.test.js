import { test, eq, ok } from './runner.js';

const APP_FILES = [
  './js/main.js', './js/boot.js', './js/character.js', './js/derive.js', './js/state.js', './js/storage.js',
  './js/render-play.js', './js/render-tabs.js', './css/sheet.css', './manifest.webmanifest', './icons/icon-180.png',
  './js/start.js', './js/trance-options.js', './dyme/', './dyme/index.html', './dyme/boot.js', './dyme/manifest.webmanifest',
  './js/characters/dyme.js',
];

test('every precached file loads', async () => {
  const src = await (await fetch('../sw.js')).text();
  const assets = JSON.parse(src.match(/ASSETS = (\[[\s\S]*?\])/)[1].replace(/'/g, '"'));
  for (const u of APP_FILES) ok(assets.includes(u), u);
  for (const u of assets) eq((await fetch(`../${u.slice(2)}`)).status, 200, u);
});

test('no external requests', async () => {
  for (const f of ['../index.html', '../dyme/index.html', '../dyme/boot.js', '../js/characters/dyme.js', '../css/sheet.css', '../js/main.js', '../js/render-play.js', '../js/render-tabs.js', '../manifest.webmanifest']) {
    ok(!/https?:\/\//.test(await (await fetch(f)).text()), f);
  }
});

test('manifest names the Home Screen app', async () => {
  const m = await (await fetch('../manifest.webmanifest')).json();
  eq([m.name, m.short_name, m.display, m.start_url], ['Phantom Sniper', 'Sniper', 'standalone', './']);
});

test('Dyme has its own Home Screen app', async () => {
  const m = await (await fetch('../dyme/manifest.webmanifest')).json();
  eq([m.name, m.short_name, m.display, m.start_url, m.scope], ['Dyme', 'Dyme', 'standalone', './', './']);
  for (const icon of m.icons) eq((await fetch(new URL(icon.src, new URL('../dyme/', location.href)))).status, 200, icon.src);
});

test('offline page visits fall back to their own page', async () => {
  // Run the real service worker source with a stand-in worker scope, then ask it which shell a visit gets.
  const src = await (await fetch('../sw.js')).text();
  const scope = { location: new URL('https://example.test/dnd/sw.js'), addEventListener() {} };
  const shellFor = new Function('self', 'caches', 'fetch', `${src}
return shellFor;`)(scope, {}, () => {});
  const base = 'https://example.test/dnd/';
  eq([`${base}dyme/`, `${base}dyme`, `${base}dyme/index.html`, base, `${base}index.html`].map(shellFor),
    ['./dyme/index.html', './dyme/index.html', './dyme/index.html', './index.html', './index.html']);
});
