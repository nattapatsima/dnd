// Saving table state on the device, carrying it across updates, and backup files.
import { defaultState, STATE_VERSION } from './state.js';
import { resourceMax } from './derive.js';

export const STORAGE_KEY = 'quickstep-sheet/state';
export const CORRUPT_KEY = 'quickstep-sheet/corrupt';

const APP = 'quickstep-sheet';
const UNREADABLE = 'Saved data was unreadable, so the sheet started fresh. The old copy was kept.';
export const NOT_SAVING = "This device isn't saving. Export a backup before closing.";
const NOT_BACKUP = 'Not a Quickstep backup file';

const isObject = (v) => Boolean(v) && typeof v === 'object' && !Array.isArray(v);
const isCount = (v) => Number.isInteger(v) && v >= 0;
const clamp = (n, lo, hi) => Math.min(hi, Math.max(lo, n));
// A flag array of length n, keeping whatever was set in the old array.
const fitFlags = (old, n) => Array.from({ length: n }, (_, i) => Boolean(Array.isArray(old) && old[i]));
const strings = (v, fallback) => (Array.isArray(v) && v.every((x) => typeof x === 'string') ? [...v] : fallback);
// Same plain data (key order matters, which holds for anything this app saved).
const same = (a, b) => a !== undefined && JSON.stringify(a) === JSON.stringify(b);

export function loadState(storage, c) {
  let raw;
  try {
    raw = storage.getItem(STORAGE_KEY);
  } catch {
    return { state: defaultState(c), warning: NOT_SAVING };
  }
  if (raw === null || raw === undefined) return { state: defaultState(c), warning: null };
  let parsed;
  try {
    parsed = JSON.parse(raw);
    if (!isObject(parsed)) throw new Error('not an object');
  } catch {
    try { storage.setItem(CORRUPT_KEY, raw); } catch { /* nothing more we can do */ }
    return { state: defaultState(c), warning: UNREADABLE };
  }
  return { state: migrateState(parsed, c), warning: null };
}

export function saveState(storage, state) {
  try {
    storage.setItem(STORAGE_KEY, JSON.stringify(state));
    return true;
  } catch {
    return false;
  }
}

// Bring saved state in line with the current build without losing anything the player set.
// HP current moves by the same amount as HP max; new uses start unspent; removed ones disappear.
export function migrateState(raw, c) {
  const r = isObject(raw) ? raw : {};
  const s = defaultState(c);
  s.stateVersion = STATE_VERSION;
  s.lastSeenBuild = Number.isInteger(r.lastSeenBuild) ? r.lastSeenBuild : null;

  if (isObject(r.hp)) {
    const oldMax = isCount(r.hp.max) ? r.hp.max : c.hp.max;
    const current = isCount(r.hp.current) ? r.hp.current : oldMax;
    s.hp.current = clamp(current + (c.hp.max - oldMax), 0, c.hp.max);
    s.hp.temp = isCount(r.hp.temp) ? r.hp.temp : 0;
  }
  s.deathSaves = {
    success: fitFlags(r.deathSaves && r.deathSaves.success, 3),
    failure: fitFlags(r.deathSaves && r.deathSaves.failure, 3),
  };
  // Per die type. A first-version save kept one flat list, which belonged to the first die type.
  s.hitDiceSpent = Object.fromEntries(c.hp.hitDice.map((h, i) => {
    const key = `d${h.die}`;
    let old = null;
    if (isObject(r.hitDiceSpent)) old = r.hitDiceSpent[key];
    else if (i === 0 && Array.isArray(r.hitDiceSpent)) old = r.hitDiceSpent;
    return [key, fitFlags(old, h.count)];
  }));
  for (const res of c.resources) s.uses[res.id] = fitFlags(isObject(r.uses) ? r.uses[res.id] : null, resourceMax(c, res));
  for (const key of Object.keys(s.toggles)) {
    if (isObject(r.toggles) && typeof r.toggles[key] === 'boolean') s.toggles[key] = r.toggles[key];
  }
  // Arrows from the Quickstep build are not carried over; the rifle starts with its defaults.
  s.shotsFired = fitFlags(r.shotsFired, c.rifle.shots);
  if (isCount(r.bullets)) s.bullets = r.bullets;
  // Gear and coins the player never touched follow the build; anything edited is kept.
  const untouched = (key) => (c.legacyDefaults ?? []).some((d) => same(r[key], d[key]));
  for (const coin of Object.keys(s.coins)) {
    if (!untouched('coins') && isObject(r.coins) && isCount(r.coins[coin])) s.coins[coin] = r.coins[coin];
  }
  if (!untouched('gear') && isObject(r.gear)) {
    s.gear.equipped = strings(r.gear.equipped, s.gear.equipped);
    s.gear.pack = strings(r.gear.pack, s.gear.pack);
  }
  for (const field of Object.keys(s.notes)) {
    if (isObject(r.notes) && typeof r.notes[field] === 'string') s.notes[field] = r.notes[field];
  }
  return s;
}

export function exportBackup(state, now) {
  const pad = (n) => String(n).padStart(2, '0');
  const date = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
  return {
    filename: `quickstep-backup-${date}.json`,
    text: JSON.stringify({ app: APP, exportedAt: now.toISOString(), state }, null, 2),
  };
}

export function parseBackup(text, c) {
  let data;
  try {
    data = JSON.parse(text);
  } catch {
    throw new Error(NOT_BACKUP);
  }
  if (!isObject(data) || data.app !== APP || !isObject(data.state)) throw new Error(NOT_BACKUP);
  return migrateState(data.state, c);
}
