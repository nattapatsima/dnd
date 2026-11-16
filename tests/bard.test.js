// The Autognome Bard: every number here must match Characters/Autognome Bard.md.
import { test, eq, ok } from './runner.js';
import { mem, mountFresh, click, text } from './helpers.js';
import { BARD as c } from '../js/characters/bard.js';
import { DYME } from '../js/characters/dyme.js';
import * as d from '../js/derive.js';
import { defaultState, reduce } from '../js/state.js';
import { storageKeys, parseBackup, exportBackup } from '../js/storage.js';
import { renderPlay } from '../js/render-play.js';
import { renderChecks, renderFeatures, renderGear } from '../js/render-tabs.js';

const s0 = defaultState(c);
const shot = c.attacks.find((a) => a.main);

test('Bard saves under its own name', () => eq(storageKeys(c).state, 'autognome-sheet/state'));

test('Bard: saves, spellcasting and tools', () => {
  eq(['str', 'dex', 'con', 'int', 'wis', 'cha'].map((a) => d.saveBonus(c, a)), [-1, 4, 2, 0, 0, 6]);
  eq([d.spellDC(c), d.spellAttack(c)], [14, 6]);
  eq(['disguise', 'tinker', 'weaver', 'harp'].map((id) => d.toolBonus(c, id)), [6, 4, 4, 6]);
});

test('Bard: Jack of All Trades on skills without proficiency only', () => {
  eq(['performance', 'persuasion', 'acrobatics', 'insight', 'investigation'].map((k) => d.skillBonus(c, k)), [8, 8, 4, 2, 2]);
  eq(['deception', 'stealth', 'arcana', 'perception', 'athletics'].map((k) => d.skillBonus(c, k)), [5, 3, 1, 1, 0]);
  eq([d.passive(c, 'perception'), d.passive(c, 'insight'), d.passive(c, 'investigation')], [11, 12, 12]);
  eq(d.skillBonus(DYME, 'athletics'), -1, 'other builds unchanged');
});

test('Bard: Starry Wisp', () => {
  eq([d.toHit(c, shot), d.damageText(c, shot)], [6, '1d8']);
});

test('Bard: daily uses and slots at level 4', () => {
  eq(c.resources.map((r) => [r.id, d.resourceMax(c, r)]), [
    ['slot1', 4], ['slot2', 3], ['inspiration', 4], ['builtForSuccess', 2], ['secondSkin', 1], ['creation', 1],
  ]);
  for (const key of ['shotsFired', 'bullets', 'bind', 'trancePick']) ok(!(key in s0), `no ${key}`);
  eq(s0.hp, { current: 31, temp: 0, max: 31 });
  eq(s0.coins.gp, 106);
});

test('Bard Play tab', () => {
  const h = renderPlay(c, s0, {});
  for (const t of [
    'Spell · Starry Wisp', 'd20 +6', '1d8 radiant', '60 ft · target sheds dim light, can\'t be Invisible',
    'Key spells', 'Healing Word', 'Bonus Action · 2d4 + 4', 'Command', 'Wis save DC 14', 'Silvery Barbs', 'Reaction',
    'Spell slots', 'Level 1', 'Level 2', 'Bardic Inspiration', 'Built for Success', 'Second Skin', 'Performance of Creation',
    'Mote: check, roll the die twice · attack, thunder (Con save DC 14) · save, temp HP die + 4',
    'Hit dice 4d8 + 2', 'Size S', 'Performance +8 ●●', 'save +6 ●',
  ]) ok(h.includes(t), t);
  for (const t of ['Sneak Attack', 'Assisted Aim', 'Reload', 'Steady Aim', 'Other attacks']) ok(!h.includes(t), `no ${t}`);
});

test('Bard Features, Checks and Gear', () => {
  const f = renderFeatures(c);
  for (const t of ['Charisma · save DC 14 · spell attack +6 · slots: Level 1 ×4, Level 2 ×3', 'Specialized Design', 'Mass Healing Word', 'Illusory Instrument', 'Binding Pledge', 'Enlarge/Reduce',
    'Armored Casing', 'Mote of Potential', 'Performance of Creation', 'Actor', 'Wis (Insight) DC 14', 'Second Skin', 'Cha save DC 15']) ok(f.includes(t), t);
  ok(!f.includes('Sharp Eye:'), 'Sharp Eye not taken');
  const ch = renderChecks(c, s0);
  for (const t of ['Disguise kit', "Tinker's tools", "Weaver's tools", 'Harp', 'Lute', 'Viol', 'Deception</span><span>+5', 'Common, plus 2 of your choice (not picked yet)']) ok(ch.includes(t), t);
  const g = renderGear(c, s0);
  for (const t of ['Disguise kit', 'Manacles', 'Shovel', '3 vials', 'value="106"']) ok(g.includes(t), t);
});

test('Bard long rest restores slots and uses', () => {
  let s = s0;
  for (const id of ['slot1', 'slot2', 'inspiration', 'creation']) s = reduce(s, { type: 'toggleUse', id, index: 0 }, c).state;
  const o = reduce(s, { type: 'longRest' }, c);
  ok(Object.values(o.state.uses).every((u) => u.every((x) => !x)), 'all back');
});

test('Bard and Dyme backups do not cross', () => {
  let msg = '';
  try { parseBackup(exportBackup(defaultState(DYME), new Date(), DYME).text, c); } catch (e) { msg = e.message; }
  eq(msg, 'Not an Autognome Bard backup file');
});

test('Bard mounts and saves under its own key', () => {
  const storage = mem();
  const { root } = mountFresh({ character: c, storage });
  click(root, 'use', 'slot1:0');
  ok(JSON.parse(storage.getItem('autognome-sheet/state')).uses.slot1[0], 'bard save written');
  ok(storage.getItem('dyme-sheet/state') === null, 'Dyme save untouched');
  eq(text(root, '#hp'), '31');
});

test('spell slots sit in their own panel, not under Daily uses', () => {
  const el = document.createElement('div');
  el.innerHTML = renderPlay(c, s0, {});
  const slots = el.querySelector('[data-box="slots"]');
  ok(slots && slots.querySelectorAll('[data-action="use"]').length === 7, 'four level 1 and three level 2 dots');
  ok(!el.querySelectorAll('.play > .col')[2].textContent.includes('Level 1'), 'not in the right column');
});
