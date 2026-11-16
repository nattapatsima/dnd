// Dyme, the Dhampir Rogue: every number here must match Characters/Dyme.md.
import { test, eq, ok } from './runner.js';
import { mem, mountFresh, click, text } from './helpers.js';
import { DYME as c } from '../js/characters/dyme.js';
import { CHARACTER as sniper } from '../js/character.js';
import * as d from '../js/derive.js';
import { defaultState, reduce } from '../js/state.js';
import { storageKeys, parseBackup, exportBackup } from '../js/storage.js';
import { renderPlay } from '../js/render-play.js';
import { renderChecks, renderFeatures, renderGear } from '../js/render-tabs.js';

const attack = (id) => c.attacks.find((a) => a.id === id);
const s0 = defaultState(c);

test('Dyme saves under its own name', () => eq(storageKeys(c).state, 'dyme-sheet/state'));

test('Dyme: level 4 saves and skills', () => {
  eq(['str', 'dex', 'con', 'int', 'wis', 'cha'].map((a) => d.saveBonus(c, a)), [-1, 6, 2, 2, 3, -1]);
  eq(['acrobatics', 'sleightOfHand', 'stealth', 'insight', 'perception', 'survival', 'athletics', 'deception']
    .map((k) => d.skillBonus(c, k)), [8, 8, 6, 5, 5, 5, -1, -1]);
  eq(d.passive(c, 'perception'), 15);
  eq([d.toolBonus(c, 'thieves'), d.toolBonus(c, 'alchemist')], [6, 2]);
});

test('Dyme: attacks', () => {
  eq([d.toHit(c, attack('shot')), d.damageText(c, attack('shot'))], [6, '1d4 + 4']);
  eq(d.sneakDice(c), '2d6');
  eq(d.damageText(c, attack('claws'), { compact: true }), '1d4+4');
  eq(d.damageText(c, attack('dagger'), { compact: true }), '1d4', 'Bonus Action Light attack: no modifier');
  eq([d.toHit(c, attack('natural')), d.damageText(c, attack('natural'), { compact: true })], [6, '1d6+4']);
  eq(d.damageText(c, attack('shortbow'), { compact: true }), '1d6+4');
});

test('Dyme: daily uses at level 4', () => {
  eq(c.resources.map((r) => [r.id, d.resourceMax(c, r)]), [
    ['burst', 2], ['wallWalker', 2], ['lucky', 2], ['lengthened', 2], ['ethereal', 1],
  ]);
});

test('Dyme: no sniper-only parts', () => {
  for (const key of ['shotsFired', 'bullets', 'bind', 'trancePick']) ok(!(key in s0), `no ${key}`);
  eq(s0.hp, { current: 31, temp: 0, max: 31 });
  eq(s0.coins.gp, 33);
});

test('Dyme Play tab', () => {
  const h = renderPlay(c, s0, {});
  for (const t of [
    'Attack · Whip', 'd20 +6', '1d4 + 4 slashing', '+2d6', '15 ft · 10 on Opportunity Attacks · 25 with Lengthened Strike',
    'Dagger, Bonus Action, 10 ft', 'Natural Attack, fangs, 10 ft',
    'Hand Claws', '+6 · 1d4', 'Natural Attack', '+6 · 1d6+4', 'Shortbow',
    'Burst of Speed', 'Wall Walker Dash', 'Lucky', 'Lengthened Strike', 'Ethereal Fade',
    'Natural 1: Lucky reroll · Ominous Will Wis save DC 15', 'Climb', 'Size S', 'Hit dice 4d8 + 2',
    'Acrobatics +8 ●●', 'save +6 ●',
  ]) ok(h.includes(t), t);
  for (const t of ['Assisted Aim', 'Reload', 'Shadow Bind', 'Trance', 'Darkvision', 'Shortsword']) ok(!h.includes(t), `no ${t}`);
  eq((h.match(/Climb/g) ?? []).length, 1, 'Climb shown once');
});

test('Dyme Features, Checks and Gear', () => {
  const f = renderFeatures(c);
  ok(f.includes('Wisdom · no components · no save or attack roll') && !f.includes('save DC 13'), 'no DC shown for Mage Hand');
  for (const t of ['Mage Hand', 'Burst of Speed', 'Fast Hands', 'Second-Story Work', 'Scourge Master', 'Living Shadow',
    'Bonus Actions', 'Steady Aim', 'Wall Walker Dash', 'DM rulings', 'Hand Claws', 'Natural Attack']) ok(f.includes(t), t);
  ok(!c.features.some((x) => x.name.includes('Draining')), 'Draining Attack is not a feature');
  ok(f.includes('Draining Attack: not allowed'), 'listed only as a DM ruling');
  const ch = renderChecks(c, s0);
  for (const t of ["Thieves' tools", "Alchemist's supplies", 'Common, Abyssal, Thieves\' Cant, plus 2 of your choice (not picked yet)']) ok(ch.includes(t), t);
  const g = renderGear(c, s0);
  for (const t of ['Whip', 'Hand Claws', '20 arrows', 'value="33"']) ok(g.includes(t), t);
  ok(!g.includes('Spare bullets'), 'no bullets');
});

test('Dyme long rest restores the five uses', () => {
  let s = s0;
  for (const id of ['burst', 'lucky', 'ethereal']) s = reduce(s, { type: 'toggleUse', id, index: 0 }, c).state;
  const o = reduce(s, { type: 'longRest' }, c);
  ok(Object.values(o.state.uses).every((u) => u.every((x) => !x)), 'all uses back');
  eq(o.message, 'Long rest: HP, hit dice and daily uses restored.');
});

test('Dyme and sniper backups do not cross', () => {
  let msg = '';
  try { parseBackup(exportBackup(defaultState(sniper), new Date(), sniper).text, c); } catch (e) { msg = e.message; }
  eq(msg, 'Not a Dyme backup file');
});

test('Dyme mounts and saves under its own key', () => {
  const storage = mem();
  const { root } = mountFresh({ character: c, storage });
  click(root, 'use', 'burst:0');
  ok(JSON.parse(storage.getItem('dyme-sheet/state')).uses.burst[0], 'Dyme save written');
  ok(storage.getItem('quickstep-sheet/state') === null, 'sniper save untouched');
  eq(text(root, '#hp'), '31');
});

// Effect chips: they change the numbers on screen while on, and never spend a use.
const on = (...keys) => ({ ...s0, toggles: { ...s0.toggles, ...Object.fromEntries(keys.map((k) => [k, true])) } });
const stats = (h) => { const el = document.createElement('div'); el.innerHTML = h; return [...el.querySelectorAll('.stats .label, .stats b')].map((n) => n.textContent).join(' '); };

test('effect chips start off and Long rest clears them', () => {
  eq([s0.toggles.steadyAim, s0.toggles.lengthened, s0.toggles.burst], [false, false, false]);
  const o = reduce(on('steadyAim', 'lengthened', 'burst'), { type: 'longRest' }, c).state.toggles;
  eq([o.steadyAim, o.lengthened, o.burst], [false, false, false]);
});

test('Steady Aim: 2d20 high and Speed 0, Advantage chip untouched', () => {
  const h = renderPlay(c, on('steadyAim'), {});
  ok(h.includes('2d20 high +6'), 'advantage on the Whip');
  ok(stats(h).includes('Speed 0'), 'speed 0');
  ok(h.includes('data-arg="advantage" aria-pressed="false"'), 'Advantage chip stays off');
});

test('Lengthened Strike: Whip 25 ft, other melee 20 ft', () => {
  const h = renderPlay(c, on('lengthened'), {});
  for (const t of ['25 ft with Lengthened Strike · 10 on Opportunity Attacks', 'Hand Claws, Vex, 20 ft', 'Dagger, Bonus Action, 20 ft', 'Natural Attack, fangs, 20 ft']) ok(h.includes(t), t);
  ok(h.includes('Shortbow, 80/320'), 'ranged unchanged');
});

test('Burst of Speed: the Speed cell toggles to 60 and Climb 60', () => {
  const off = renderPlay(c, s0, {});
  ok(off.includes('data-arg="burst"'), 'Speed cell is a toggle');
  ok(stats(off).includes('Speed 30') && stats(off).includes('Climb 30 ft'), 'base speeds');
  const h = renderPlay(c, on('burst'), {});
  ok(stats(h).includes('Burst · no OAs 60') && stats(h).includes('Climb 60 ft'), stats(h));
  ok(stats(renderPlay(c, on('burst', 'steadyAim'), {})).includes('Burst · no OAs 0'), 'Steady Aim wins');
});

test('tapping effect chips saves them and spends no use', () => {
  const storage = mem();
  const { root } = mountFresh({ character: c, storage });
  for (const key of ['steadyAim', 'lengthened', 'burst']) click(root, 'toggle', key);
  const s = JSON.parse(storage.getItem('dyme-sheet/state'));
  eq([s.toggles.steadyAim, s.toggles.lengthened, s.toggles.burst], [true, true, true]);
  ok(Object.values(s.uses).every((u) => u.every((x) => !x)), 'no use spent');
  ok(text(root, '.hit').startsWith('2d20 high'), 'to-hit redrawn');
  ok(root.textContent.includes('Hand Claws, Vex, 20 ft') && root.textContent.includes('25 ft with Lengthened Strike'), 'reach redrawn');
  eq(text(root, '[data-arg="burst"] b'), '0', 'Steady Aim keeps Speed 0 under Burst');
});

test('a reach attack without an Opportunity Attack reach still reads cleanly', () => {
  eq(d.reachText(c, { reach: 10 }, {}), '10 ft · 20 with Lengthened Strike');
});
