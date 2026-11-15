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
  const s = { ...defaultState(c), bullets: 31, shotsFired: [true, true, false, false, false] };
  ok(saveState(m, s));
  eq(loadState(m, c).state.bullets, 31);
  eq(loadState(m, c).state.shotsFired, [true, true, false, false, false]);
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

const level2 = {
  ...c,
  level: 2,
  hp: { max: 16, hitDice: [{ die: 8, count: 1 }, { die: 10, count: 1 }] },
  resources: [...c.resources, { id: 'secondWind', name: 'Second Wind', max: 2, recharge: 'long', shortRestRegain: 1 }],
};

test('migration on level-up', () => {
  const old = {
    ...defaultState(c), hp: { current: 4, temp: 2, max: 9 }, hitDiceSpent: { d8: [true] },
    notes: { ...defaultState(c).notes, session: 'met Vex' },
  };
  const s = migrateState(old, level2);
  eq(s.hp, { current: 11, temp: 2, max: 16 });
  eq(s.uses.secondWind, [false, false]);
  eq(s.hitDiceSpent, { d8: [true], d10: [false] });
  eq(s.notes.session, 'met Vex');
});

test('first-version saved state keeps its spent hit die', () => {
  const v1 = { ...defaultState(c), stateVersion: 1, hp: { current: 5, temp: 0, max: 9 }, hitDiceSpent: [true] };
  eq(migrateState(v1, c).hitDiceSpent, { d8: [true, false, false] });
  eq(migrateState(v1, level2).hitDiceSpent, { d8: [true], d10: [false] });
});

test('removed resources are dropped', () => eq(
  Object.keys(migrateState(defaultState(c), { ...c, resources: [c.resources[0]] }).uses),
  ['ravenQueen'],
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
  const s = parseBackup(JSON.stringify({ app: 'quickstep-sheet', state: { hp: { current: 3, temp: 0, max: 21 } } }), c);
  eq(s.hp.current, 3);
  eq(s.bullets, 15);
});

test('Quickstep save: untouched gear and coins follow the new build', () => {
  const [old] = c.legacyDefaults;
  const quickstep = {
    ...defaultState(c), stateVersion: 2, arrows: 37, gear: old.gear, coins: old.coins,
    notes: { ...defaultState(c).notes, name: 'Pip' },
  };
  delete quickstep.shotsFired;
  delete quickstep.bullets;
  const s = migrateState(quickstep, c);
  eq(s.gear, c.gearDefaults);
  eq(s.coins, c.coinDefaults);
  eq([s.bullets, s.shotsFired.length, s.notes.name], [15, 5, 'Pip']);
  ok(!('arrows' in s), 'arrows dropped');
});

test('Quickstep save: edited gear and coins are kept', () => {
  const [old] = c.legacyDefaults;
  const edited = { ...defaultState(c), gear: { ...old.gear, pack: ['Rope'] }, coins: { ...old.coins, gp: 42 } };
  const s = migrateState(edited, c);
  eq(s.gear.pack, ['Rope']);
  eq(s.coins.gp, 42);
});
