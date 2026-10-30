// Mounts the sheet: renders the active tab, routes taps to reduce(), saves after every change.
import { parseAmount, reduce } from './state.js';
import {
  NOT_SAVING, exportBackup, loadState, parseBackup, saveState,
} from './storage.js';
import { renderPlay } from './render-play.js';
import {
  renderChecks, renderFeatures, renderGear, renderHeader, renderNotes,
} from './render-tabs.js';

// Hand a backup file to the iPad share sheet when it can take files, otherwise download it.
async function offerFile(filename, text) {
  const file = new File([text], filename, { type: 'application/json' });
  if (navigator.canShare && navigator.canShare({ files: [file] })) {
    await navigator.share({ files: [file], title: filename });
    return;
  }
  const url = URL.createObjectURL(file);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function mount(root, { character: c, storage, now = () => new Date() }) {
  const loaded = loadState(storage, c);
  let state = loaded.state;
  let tab = 'play';
  let previous = null;
  let ui = { error: null, message: loaded.warning, canUndo: false };

  // Remember which build this device has seen; after an update, say so once.
  if (state.lastSeenBuild !== c.buildVersion) {
    if (state.lastSeenBuild !== null && !ui.message) ui.message = `Updated to v${c.buildVersion}`;
    state = reduce(state, { type: 'seenBuild', version: c.buildVersion }, c).state;
    if (!saveState(storage, state) && !ui.message) ui.message = NOT_SAVING;
  }

  function save() {
    if (!saveState(storage, state)) ui = { ...ui, message: NOT_SAVING };
  }

  function body() {
    switch (tab) {
      case 'checks': return renderChecks(c);
      case 'features': return renderFeatures(c);
      case 'gear': return renderGear(c, state);
      case 'notes': return renderNotes(c, state, ui);
      default: return renderPlay(c, state, ui);
    }
  }

  function render() {
    root.innerHTML = renderHeader(c, state, tab) + `<main class="tab-${tab}">${body()}</main>`;
  }

  // Text fields save on every keystroke without redrawing, so the caret stays put.
  // Editing also drops the undo snapshot, so Undo can never roll back what was typed.
  function onInput(event) {
    const el = event.target;
    let action = null;
    if (el.dataset.note) action = { type: 'setNote', field: el.dataset.note, value: el.value };
    else if (el.dataset.gear) action = { type: 'setGear', list: el.dataset.gear, lines: el.value.split('\n') };
    else if (el.dataset.coin) action = { type: 'setCoin', coin: el.dataset.coin, value: el.value };
    if (!action) return;
    state = reduce(state, action, c).state;
    previous = null;
    ui = { ...ui, canUndo: false };
    save();
    if (action.type === 'setNote' && action.field === 'name') {
      const title = root.querySelector('.title b');
      if (title) title.textContent = el.value.trim() || c.name;
    }
    if (action.type === 'setCoin') {
      const fund = root.querySelector('#rifle-fund');
      if (fund) fund.textContent = `Rifle fund ${state.coins.gp} / ${c.rifleGoal} gp`;
    }
  }

  async function onImport(event) {
    if (event.target.id !== 'import-file') return;
    const file = event.target.files && event.target.files[0];
    if (!file) return;
    try {
      const restored = parseBackup(await file.text(), c);
      // Keep the sheet as it was, so a wrong file pick can be undone.
      previous = state;
      state = restored;
      ui = { error: null, message: 'Backup restored', canUndo: true };
      save();
    } catch (error) {
      ui = { error: null, message: error.message, canUndo: false };
    }
    render();
  }

  async function onExport() {
    const { filename, text } = exportBackup(state, now());
    try {
      await offerFile(filename, text);
      ui = { ...ui, message: 'Backup exported' };
    } catch (error) {
      if (error && error.name === 'AbortError') return;
      ui = { ...ui, message: "Couldn't export the backup" };
    }
    render();
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
      case 'hit-die': {
        const [die, index] = arg.split(':');
        dispatch({ type: 'toggleHitDie', die, index: Number(index) });
        return;
      }
      case 'use': {
        const [id, index] = arg.split(':');
        dispatch({ type: 'toggleUse', id, index: Number(index) });
        return;
      }
      case 'toggle': dispatch({ type: 'toggle', key: arg }); return;
      case 'condition': dispatch({ type: 'toggleCondition', name: arg }); return;
      case 'exhaustion': dispatch({ type: 'exhaustion', delta: Number(arg) }); return;
      case 'arrows': dispatch({ type: 'arrows', delta: Number(arg) }); return;
      case 'export': onExport(); return;
      case 'import': root.querySelector('#import-file')?.click(); return;
      default:
    }
  }

  root.addEventListener('click', onTap);
  root.addEventListener('input', onInput);
  root.addEventListener('change', onImport);
  window.addEventListener('pagehide', save);
  render();
  return { getState: () => state, now };
}
