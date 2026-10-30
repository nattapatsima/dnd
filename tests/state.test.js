import { test, eq, ok } from './runner.js';
import { CHARACTER as c } from '../js/character.js';
import { defaultState, parseAmount, reduce } from '../js/state.js';

const s0 = defaultState(c);
const r = (s, a) => reduce(s, a, c);

test('default state', () => {
  eq(s0.hp, { current: 9, temp: 0, max: 9 });
  eq(s0.arrows, 40);
  eq(s0.coins.gp, 5);
  eq(s0.uses.startling, [false]);
});

test('parseAmount', () => eq(['7', ' 12 ', '', '0', '-3', '3.5', 'abc', '999'].map(parseAmount), [7, 12, null, null, null, null, null, 999]));

test('temp absorbs damage first', () => {
  const s = r(r(s0, { type: 'temp', amount: 3 }).state, { type: 'damage', amount: 4 }).state;
  eq([s.hp.temp, s.hp.current], [0, 8]);
});

test('damage floors at 0', () => eq(r(s0, { type: 'damage', amount: 999 }).state.hp.current, 0));

test('heal from 0 clears death saves', () => {
  let s = r(s0, { type: 'damage', amount: 9 }).state;
  s = r(s, { type: 'toggleDeathSave', kind: 'failure', index: 0 }).state;
  s = r(s, { type: 'heal', amount: 5 }).state;
  eq(s.hp.current, 5);
  eq(s.deathSaves.failure, [false, false, false]);
});

test('heal caps at max; temp keeps the larger', () => {
  eq(r(s0, { type: 'heal', amount: 4 }).state.hp.current, 9);
  eq(r(r(s0, { type: 'temp', amount: 5 }).state, { type: 'temp', amount: 2 }).state.hp.temp, 5);
});

test('short rest at level 1', () => {
  const o = r(s0, { type: 'shortRest' });
  eq(o.message, 'Nothing recharges on a short rest at level 1. Spend your hit die, then use Heal.');
  eq(o.undoable, true);
});

test('long rest', () => {
  let s = r(s0, { type: 'damage', amount: 6 }).state;
  s = r(s, { type: 'toggleUse', id: 'startling', index: 0 }).state;
  s = r(s, { type: 'exhaustion', delta: 1 }).state;
  s = r(s, { type: 'exhaustion', delta: 1 }).state;
  s = r(s, { type: 'toggle', key: 'assistedAim' }).state;
  s = r(s, { type: 'toggle', key: 'inspiration' }).state;
  s = r(s, { type: 'toggleCondition', name: 'Prone' }).state;
  const o = r(s, { type: 'longRest' });
  eq(o.state.hp, { current: 9, temp: 0, max: 9 });
  eq(o.state.uses.startling, [false]);
  eq(o.state.exhaustion, 1);
  eq(o.state.toggles, { advantage: false, assistedAim: false, inspiration: true });
  eq(o.state.conditions.Prone, true);
  eq(o.message, 'Long rest: HP, hit die and daily uses restored.');
});

test('counters clamp', () => {
  eq(r({ ...s0, arrows: 0 }, { type: 'arrows', delta: -1 }).state.arrows, 0);
  eq(r({ ...s0, exhaustion: 6 }, { type: 'exhaustion', delta: 1 }).state.exhaustion, 6);
});

test('coins accept whole numbers only', () => {
  eq(r(s0, { type: 'setCoin', coin: 'gp', value: '12' }).state.coins.gp, 12);
  eq(r(s0, { type: 'setCoin', coin: 'gp', value: '-2' }).state.coins.gp, 5);
});

test('undoable flags', () => eq(
  ['toggle', 'arrows', 'damage'].map((t) => r(s0, { type: t, key: 'advantage', delta: 1, amount: 1 }).undoable),
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
  eq(defaultState(c).hitDiceSpent, { d8: [false] });
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
