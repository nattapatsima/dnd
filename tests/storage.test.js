import { test, eq, ok } from './runner.js';
import { mem } from './helpers.js';
import { CHARACTER as c } from '../js/character.js';
import { defaultState } from '../js/state.js';
import {
  STORAGE_KEY, CORRUPT_KEY, loadState, saveState, migrateState, exportBackup, parseBackup,
} from '../js/storage.js';

test('empty storage gives defaults', () => {
  const o = loadState(mem(), c);
  eq(o.state, defaultState(c));
  eq(o.warning, null);
});

test('round trip', () => {
  const m = mem();
  const s = { ...defaultState(c), arrows: 31 };
  ok(saveState(m, s));
  eq(loadState(m, c).state.arrows, 31);
});

test('corrupt data is kept aside', () => {
  const m = mem({ [STORAGE_KEY]: '{oops' });
  const o = loadState(m, c);
  eq(o.state, defaultState(c));
  eq(o.warning, 'Saved data was unreadable, so the sheet started fresh. The old copy was kept.');
  eq(m.getItem(CORRUPT_KEY), '{oops');
});

test('storage that throws', () => {
  const bad = { getItem() { throw new Error('x'); }, setItem() { throw new Error('x'); } };
  const o = loadState(bad, c);
  eq(o.warning, "This device isn't saving. Export a backup before closing.");
  eq(saveState(bad, o.state), false);
});

test('migration on level-up', () => {
  const old = { ...defaultState(c), hp: { current: 4, temp: 2, max: 9 }, notes: { ...defaultState(c).notes, session: 'met Vex' } };
  const next = {
    ...c,
    hp: { ...c.hp, max: 16, hitDiceCount: 2 },
    resources: [...c.resources, { id: 'secondWind', name: 'Second Wind', max: 2, recharge: 'short' }],
  };
  const s = migrateState(old, next);
  eq(s.hp, { current: 11, temp: 2, max: 16 });
  eq(s.uses.secondWind, [false, false]);
  eq(s.hitDiceSpent.length, 2);
  eq(s.notes.session, 'met Vex');
});

test('removed resources are dropped', () => eq(
  Object.keys(migrateState(defaultState(c), { ...c, resources: [c.resources[0]] }).uses),
  ['startling'],
));

test('export file', () => {
  const b = exportBackup(defaultState(c), new Date('2026-10-30T12:00:00'));
  eq(b.filename, 'quickstep-backup-2026-10-30.json');
  eq(JSON.parse(b.text).app, 'quickstep-sheet');
});

test('parseBackup rejects', () => {
  for (const t of ['not json', '{}', '{"app":"other"}']) {
    let msg = '';
    try { parseBackup(t, c); } catch (e) { msg = e.message; }
    eq(msg, 'Not a Quickstep backup file', t);
  }
});

test('parseBackup migrates', () => {
  const s = parseBackup(JSON.stringify({ app: 'quickstep-sheet', state: { hp: { current: 3, temp: 0, max: 9 } } }), c);
  eq(s.hp.current, 3);
  eq(s.arrows, 40);
});
