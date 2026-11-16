// A build drives which sniper-only parts exist, and where its saves live.
import { test, eq, ok } from './runner.js';
import { mem } from './helpers.js';
import { CHARACTER as sniper } from '../js/character.js';
import { DYME } from '../js/characters/dyme.js';
import { BARD } from '../js/characters/bard.js';
import { fillNumbers, skillBonus } from '../js/derive.js';
import { defaultState, reduce } from '../js/state.js';
import {
  exportBackup, loadState, migrateState, parseBackup, saveState, storageKeys,
} from '../js/storage.js';
import { renderPlay } from '../js/render-play.js';
import { renderGear } from '../js/render-tabs.js';

// The sniper's build with every sniper-only part taken away, saving under its own name.
const bare = {
  ...sniper,
  id: 'bare',
  storageId: 'bare-sheet',
  label: 'Bare',
  rifle: undefined,
  bulletsDefault: undefined,
  shadowBind: false,
  trance: false,
  longRestNote: undefined,
};

test('sniper saves keep their old keys', () => {
  const k = storageKeys(sniper);
  eq([k.state, k.corrupt, k.app], ['quickstep-sheet/state', 'quickstep-sheet/corrupt', 'quickstep-sheet']);
});

test('each build saves under its own key', () => {
  const m = mem();
  saveState(m, { ...defaultState(sniper), notes: { ...defaultState(sniper).notes, name: 'Sniper' } }, sniper);
  saveState(m, { ...defaultState(bare), notes: { ...defaultState(bare).notes, name: 'Bare' } }, bare);
  eq([loadState(m, sniper).state.notes.name, loadState(m, bare).state.notes.name], ['Sniper', 'Bare']);
  ok(m.getItem('bare-sheet/state'), 'bare build saved under bare-sheet');
});

test('a backup only restores into its own build', () => {
  const b = exportBackup(defaultState(bare), new Date('2026-11-16T12:00:00'), bare);
  eq(b.filename, 'bare-backup-2026-11-16.json');
  let msg = '';
  try { parseBackup(b.text, sniper); } catch (e) { msg = e.message; }
  eq(msg, 'Not a Quickstep backup file');
  eq(parseBackup(b.text, bare).hp.max, bare.hp.max);
});

test('a build without a rifle, Shadow Bind or Trance has none of them', () => {
  const s = defaultState(bare);
  for (const key of ['shotsFired', 'bullets', 'bind', 'trancePick']) ok(!(key in s), `no ${key} in state`);
  const play = renderPlay(bare, s, {});
  for (const t of ['data-action="reload"', 'data-box="bind"', 'data-box="trance"']) ok(!play.includes(t), `no ${t}`);
  ok(!renderGear(bare, s).includes('Spare bullets'), 'no bullets on Gear');
  const migrated = migrateState({ ...defaultState(sniper) }, bare);
  for (const key of ['shotsFired', 'bullets', 'bind', 'trancePick']) ok(!(key in migrated), `migration drops ${key}`);
});

test('long rest without a rest note says only what it restored', () => {
  eq(reduce(defaultState(bare), { type: 'longRest' }, bare).message, 'Long rest: HP, hit dice and daily uses restored.');
});

test('the sniper keeps all its parts', () => {
  const play = renderPlay(sniper, defaultState(sniper), {});
  for (const t of ['data-action="reload"', 'data-box="bind"', 'data-box="trance"']) ok(play.includes(t), t);
});

test('the sniper has no Dyme effect chips', () => {
  const s = defaultState(sniper);
  for (const key of ['steadyAim', 'lengthened', 'burst']) ok(!(key in s.toggles), `no ${key} toggle`);
  const play = renderPlay(sniper, s, {});
  for (const key of ['steadyAim', 'lengthened', 'burst']) ok(!play.includes(`data-arg="${key}"`), `no ${key} chip`);
});

test('Jack of All Trades and the Spell slots panel belong to the bard only', () => {
  eq([skillBonus(sniper, 'athletics'), skillBonus(DYME, 'athletics'), skillBonus(BARD, 'athletics')], [-1, -1, 0]);
  for (const c of [sniper, DYME]) ok(!renderPlay(c, defaultState(c), {}).includes('data-box="slots"'), `no slots panel for ${c.name}`);
});

test("the bard's backup is refused by the sniper and Dyme", () => {
  const text = exportBackup(defaultState(BARD), new Date(), BARD).text;
  for (const [c, msg] of [[sniper, 'Not a Quickstep backup file'], [DYME, 'Not a Dyme backup file']]) {
    let got = '';
    try { parseBackup(text, c); } catch (e) { got = e.message; }
    eq(got, msg);
  }
});

test('fillNumbers fills every placeholder from the build', () => {
  // The bard: Cha 18 (+4), Con 14 (+2), proficiency +2, Charisma caster.
  eq(fillNumbers(BARD, '{dc} {atk} {mod} {mod:con} {dc:cha} {pb} {halfpb} {13+pb}'), '14 +6 4 2 14 2 1 15');
  eq(fillNumbers(sniper, 'plain text, no placeholders'), 'plain text, no placeholders');
});
