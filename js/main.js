// Mounts the sheet: renders the active tab, routes taps to reduce(), saves after every change.
import { parseAmount, reduce } from './state.js';
import { NOT_SAVING, loadState, saveState } from './storage.js';
import { esc, renderPlay } from './render-play.js';

const TABS = [['play', 'Play'], ['checks', 'Checks'], ['features', 'Features and spells'], ['gear', 'Gear'], ['notes', 'Notes']];

function header(c, tab) {
  return `<header class="top"><div class="title"><b>${esc(c.name)}</b> <span class="label">${esc(c.classLine)}</span></div>`
    + `<nav class="tabs">${TABS.map(([id, label]) => `<button class="chip${id === tab ? ' on' : ''}" data-action="tab" data-arg="${id}">${label}</button>`).join('')}</nav></header>`;
}

export function mount(root, { character: c, storage, now = () => new Date() }) {
  const loaded = loadState(storage, c);
  let state = loaded.state;
  let tab = 'play';
  let previous = null;
  let ui = { error: null, message: loaded.warning, canUndo: false };

  function save() {
    if (!saveState(storage, state)) ui = { ...ui, message: NOT_SAVING };
  }

  function body() {
    if (tab === 'play') return renderPlay(c, state, ui);
    return '<p class="label">This tab arrives in the next build step.</p>';
  }

  function render() {
    root.innerHTML = header(c, tab) + `<main class="tab-${tab}">${body()}</main>`;
  }

  function dispatch(action) {
    const out = reduce(state, action, c);
    previous = out.undoable ? state : null;
    state = out.state;
    ui = { error: null, message: out.message, canUndo: out.undoable };
    save();
    render();
  }

  function onTap(event) {
    const el = event.target.closest('[data-action]');
    if (!el || !root.contains(el)) return;
    const { action, arg } = el.dataset;
    switch (action) {
      case 'tab':
        tab = arg;
        ui = { ...ui, error: null };
        render();
        return;
      case 'damage':
      case 'heal':
      case 'temp': {
        const amount = parseAmount(root.querySelector('#amount')?.value);
        if (amount === null) {
          ui = { ...ui, error: 'Enter an amount first' };
          render();
          return;
        }
        dispatch({ type: action, amount });
        return;
      }
      case 'undo':
        if (previous) {
          state = previous;
          previous = null;
          ui = { error: null, message: 'Undone', canUndo: false };
          save();
          render();
        }
        return;
      case 'short-rest': dispatch({ type: 'shortRest' }); return;
      case 'long-rest': dispatch({ type: 'longRest' }); return;
      case 'death-save': {
        const [kind, index] = arg.split(':');
        dispatch({ type: 'toggleDeathSave', kind, index: Number(index) });
        return;
      }
      case 'hit-die': dispatch({ type: 'toggleHitDie', index: Number(arg) }); return;
      case 'use': {
        const [id, index] = arg.split(':');
        dispatch({ type: 'toggleUse', id, index: Number(index) });
        return;
      }
      case 'toggle': dispatch({ type: 'toggle', key: arg }); return;
      case 'condition': dispatch({ type: 'toggleCondition', name: arg }); return;
      case 'exhaustion': dispatch({ type: 'exhaustion', delta: Number(arg) }); return;
      case 'arrows': dispatch({ type: 'arrows', delta: Number(arg) }); return;
      default:
    }
  }

  root.addEventListener('click', onTap);
  render();
  return { getState: () => state, now };
}
