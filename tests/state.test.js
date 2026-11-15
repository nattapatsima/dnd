import { test, eq, ok } from './runner.js';
import { CHARACTER as c } from '../js/character.js';
import { defaultState, parseAmount, reduce } from '../js/state.js';

const s0 = defaultState(c);
const r = (s, a) => reduce(s, a, c);

test('default state', () => {
  eq(s0.hp, { current: 21, temp: 0, max: 21 });
  eq(s0.shotsFired, [false, false, false, false, false]);
  eq(s0.bullets, 15);
  eq(s0.coins.gp, 35);
  eq(s0.uses.ravenQueen, [false, false]);
});

test('parseAmount', () => eq(['7', ' 12 ', '', '0', '-3', '3.5', 'abc', '999'].map(parseAmount), [7, 12, null, null, null, null, null, 999]));

test('temp absorbs damage first', () => {
  const s = r(r(s0, { type: 'temp', amount: 3 }).state, { type: 'damage', amount: 4 }).state;
  eq([s.hp.temp, s.hp.current], [0, 20]);
});

test('damage floors at 0', () => eq(r(s0, { type: 'damage', amount: 999 }).state.hp.current, 0));

test('heal from 0 clears death saves', () => {
  let s = r(s0, { type: 'damage', amount: 21 }).state;
  s = r(s, { type: 'toggleDeathSave', kind: 'failure', index: 0 }).state;
  s = r(s, { type: 'heal', amount: 5 }).state;
  eq(s.hp.current, 5);
  eq(s.deathSaves.failure, [false, false, false]);
});

test('heal caps at max; temp keeps the larger', () => {
  eq(r(s0, { type: 'heal', amount: 4 }).state.hp.current, 21);
  eq(r(r(s0, { type: 'temp', amount: 5 }).state, { type: 'temp', amount: 2 }).state.hp.temp, 5);
});

test('short rest at level 3', () => {
  const o = r(s0, { type: 'shortRest' });
  eq(o.message, 'Nothing recharges on a short rest at level 3. Spend your hit dice, then use Heal.');
  eq(o.undoable, true);
});

test('long rest', () => {
  let s = r(s0, { type: 'damage', amount: 6 }).state;
  s = r(s, { type: 'toggleUse', id: 'ravenQueen', index: 0 }).state;
  s = r(s, { type: 'toggle', key: 'assistedAim' }).state;
  s = r(s, { type: 'toggle', key: 'inspiration' }).state;
  const o = r(s, { type: 'longRest' });
  eq(o.state.hp, { current: 21, temp: 0, max: 21 });
  eq(o.state.uses.ravenQueen, [false, false]);
  eq(o.state.toggles, { advantage: false, assistedAim: false, inspiration: true, coldStrike: false });
  eq(o.message, 'Long rest: HP, hit dice and daily uses restored. Trance: pick the Hunting Rifle again.');
});

test('counters clamp', () => {
  eq(r({ ...s0, bullets: 0 }, { type: 'bullets', delta: -1 }).state.bullets, 0);
});

const fire = (s, ...indexes) => indexes.reduce((acc, index) => r(acc, { type: 'toggleShot', index }).state, s);

test('reload refills fired shots from spare bullets', () => {
  const o = r(fire(s0, 0, 1, 2), { type: 'reload' });
  eq(o.state.shotsFired, [false, false, false, false, false]);
  eq(o.state.bullets, 12);
  eq(o.message, 'Reloaded. 12 spare bullets left.');
  eq(o.undoable, true);
});

test('reload with too few bullets loads what it can', () => {
  const o = r(fire({ ...s0, bullets: 2 }, 0, 1, 2), { type: 'reload' });
  eq(o.state.shotsFired.filter(Boolean).length, 1);
  eq(o.state.bullets, 0);
  eq(r(o.state, { type: 'reload' }).message, 'No spare bullets to reload with.');
});

test('reload when full does nothing', () => {
  const o = r(s0, { type: 'reload' });
  eq(o.message, 'The rifle is already loaded.');
  eq(o.state.bullets, 15);
});

test('coins accept whole numbers only', () => {
  eq(r(s0, { type: 'setCoin', coin: 'gp', value: '12' }).state.coins.gp, 12);
  eq(r(s0, { type: 'setCoin', coin: 'gp', value: '-2' }).state.coins.gp, 35);
});

test('undoable flags', () => eq(
  ['toggle', 'bullets', 'damage'].map((t) => r(s0, { type: t, key: 'advantage', delta: 1, amount: 1 }).undoable),
  [false, false, true],
));

// A level-2 build: Rogue d8 plus Fighter d10, and Second Wind (2 uses, 1 back on a short rest).
const level2 = {
  ...c,
  level: 2,
  hp: { max: 16, hitDice: [{ die: 8, count: 1 }, { die: 10, count: 1 }] },
  resources: [...c.resources, { id: 'secondWind', name: 'Second Wind', max: 2, recharge: 'long', shortRestRegain: 1 }],
};

test('hit dice are tracked per die type', () => {
  eq(defaultState(c).hitDiceSpent, { d8: [false, false, false] });
  const s = reduce(defaultState(level2), { type: 'toggleHitDie', die: 'd10', index: 0 }, level2).state;
  eq(s.hitDiceSpent, { d8: [false], d10: [true] });
  eq(reduce(s, { type: 'longRest' }, level2).state.hitDiceSpent, { d8: [false], d10: [false] });
});

test('Second Wind gets one use back on a short rest', () => {
  let s = defaultState(level2);
  s = reduce(s, { type: 'toggleUse', id: 'secondWind', index: 0 }, level2).state;
  s = reduce(s, { type: 'toggleUse', id: 'secondWind', index: 1 }, level2).state;
  const o = reduce(s, { type: 'shortRest' }, level2);
  eq(o.state.uses.secondWind.filter(Boolean).length, 1);
  eq(o.message, 'Short rest: Second Wind +1 back. Spend hit dice, then use Heal.');
});

test('reduce does not mutate its input', () => {
  const before = JSON.stringify(s0);
  r(s0, { type: 'damage', amount: 3 });
  r(s0, { type: 'longRest' });
  r(s0, { type: 'setGear', list: 'pack', lines: ['Rope'] });
  ok(JSON.stringify(s0) === before, 'input state unchanged');
});
