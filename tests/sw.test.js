import { test, eq, ok } from './runner.js';

const APP_FILES = [
  './js/main.js', './js/boot.js', './js/character.js', './js/derive.js', './js/state.js', './js/storage.js',
  './js/render-play.js', './js/render-tabs.js', './css/sheet.css', './manifest.webmanifest', './icons/icon-180.png',
];

test('every precached file loads', async () => {
  const src = await (await fetch('../sw.js')).text();
  const assets = JSON.parse(src.match(/ASSETS = (\[[\s\S]*?\])/)[1].replace(/'/g, '"'));
  for (const u of APP_FILES) ok(assets.includes(u), u);
  for (const u of assets) eq((await fetch(`../${u.slice(2)}`)).status, 200, u);
});

test('no external requests', async () => {
  for (const f of ['../index.html', '../css/sheet.css', '../js/main.js', '../js/render-play.js', '../js/render-tabs.js', '../manifest.webmanifest']) {
    ok(!/https?:\/\//.test(await (await fetch(f)).text()), f);
  }
});

test('manifest names the Home Screen app', async () => {
  const m = await (await fetch('../manifest.webmanifest')).json();
  eq([m.name, m.short_name, m.display, m.start_url], ['Phantom Sniper', 'Sniper', 'standalone', './']);
});
