// Test helpers shared by the test files.
import { CHARACTER } from '../js/character.js';
import { mount } from '../js/main.js';

// In-memory stand-in for localStorage.
export function mem(initial = {}) {
  const data = new Map(Object.entries(initial));
  return {
    getItem: (key) => (data.has(key) ? data.get(key) : null),
    setItem: (key, value) => { data.set(key, String(value)); },
    removeItem: (key) => { data.delete(key); },
  };
}

// Mount the app into a detached div, the way js/start.js mounts it on the page.
export function mountFresh({ storage, character = CHARACTER } = {}) {
  const root = document.createElement('div');
  const store = storage ?? mem();
  const app = mount(root, { character, storage: store, now: () => new Date('2026-10-30T12:00:00') });
  return { root, storage: store, app };
}

export function click(root, action, arg) {
  const selector = arg === undefined ? `[data-action="${action}"]` : `[data-action="${action}"][data-arg="${arg}"]`;
  const el = root.querySelector(selector);
  if (!el) throw new Error(`nothing to click for ${selector}`);
  el.click();
}

export function setAmount(root, value) {
  root.querySelector('#amount').value = value;
}

export function type(root, selector, value) {
  const el = root.querySelector(selector);
  if (!el) throw new Error(`nothing to type into for ${selector}`);
  el.value = value;
  el.dispatchEvent(new Event('input', { bubbles: true }));
  el.dispatchEvent(new Event('change', { bubbles: true }));
}

export function text(root, selector) {
  const el = root.querySelector(selector);
  return el ? el.textContent.trim() : '';
}
