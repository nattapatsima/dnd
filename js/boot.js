// Starts the sheet on the page.
import { CHARACTER } from './character.js';
import { mount } from './main.js';

// localStorage when the device allows it. If it's blocked, hand over a store that
// always fails, so the sheet still works for this session and warns that it isn't saving.
function deviceStorage() {
  try {
    const store = window.localStorage;
    store.setItem('quickstep-sheet/probe', '1');
    store.removeItem('quickstep-sheet/probe');
    return store;
  } catch {
    const blocked = () => { throw new Error('storage blocked'); };
    return { getItem: blocked, setItem: blocked, removeItem: () => {} };
  }
}

mount(document.getElementById('app'), { character: CHARACTER, storage: deviceStorage(), now: () => new Date() });
