// Starts a character's sheet on the page. Each character page has a tiny entry module
// that passes its build here.
import { mount } from './main.js';
import { storageKeys } from './storage.js';

// localStorage when the device allows it. If it's blocked, hand over a store that
// always fails, so the sheet still works for this session and warns that it isn't saving.
function deviceStorage(c) {
  const { probe } = storageKeys(c);
  try {
    const store = window.localStorage;
    store.setItem(probe, '1');
    store.removeItem(probe);
    return store;
  } catch {
    const blocked = () => { throw new Error('storage blocked'); };
    return { getItem: blocked, setItem: blocked, removeItem: () => {} };
  }
}

// swUrl: the site's one service worker, relative to the page (e.g. './sw.js' or '../sw.js').
export function start(character, { swUrl }) {
  mount(document.getElementById('app'), { character, storage: deviceStorage(character), now: () => new Date() });

  // Cache every file so the sheet opens with no signal at the table.
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register(swUrl).catch(() => {});
    });
  }
}
