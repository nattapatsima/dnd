import { test, eq } from './runner.js';
import { CHARACTER as c } from '../js/character.js';
import * as d from '../js/derive.js';

const attack = (id) => c.attacks.find((x) => x.id === id);

test('fmt uses a real minus', () => { eq(d.fmt(3), '+3'); eq(d.fmt(0), '+0'); eq(d.fmt(-1), '−1'); });

test('proficiency by level', () => eq([1, 4, 5, 9, 17].map(d.profBonus), [2, 2, 3, 4, 6]));

test('level 1 saves', () => eq(['str', 'dex', 'con', 'int', 'wis', 'cha'].map((a) => d.saveBonus(c, a)), [-1, 5, 1, 2, 3, 0]));

test('level 1 skills', () => eq(Object.fromEntries(Object.keys(d.SKILLS).map((k) => [k, d.skillBonus(c, k)])), {
  athletics: -1, acrobatics: 7, sleightOfHand: 3, stealth: 5, arcana: 2, history: 0, investigation: 2, nature: 2, religion: 0,
  animalHandling: 3, insight: 5, medicine: 3, perception: 7, survival: 3, deception: 0, intimidation: 0, performance: 0, persuasion: 0,
}));

test('marks', () => eq(['perception', 'acrobatics', 'stealth', 'athletics'].map((k) => d.skillMark(c, k)), ['●●', '●●', '●', '']));

test('passives and tools', () => eq(
  [d.passive(c, 'perception'), d.passive(c, 'insight'), d.passive(c, 'investigation'), d.toolBonus(c, 'thieves'), d.toolBonus(c, 'woodcarver')],
  [17, 15, 12, 5, 5],
));

test('spellcasting', () => eq([d.spellDC(c), d.spellAttack(c)], [13, 5]));

test('sneak and cantrip dice', () => {
  eq(d.sneakDice(c), '1d6');
  eq(d.sneakDice({ ...c, classes: { rogue: 5 } }), '3d6');
  eq([1, 4, 5, 11, 17].map(d.cantripDice), [1, 1, 2, 3, 4]);
});

test('to-hit with Assisted Aim', () => eq([
  d.toHit(c, attack('shot'), {}),
  d.toHit(c, attack('shot'), { assistedAim: true }),
  d.toHit(c, attack('shortbow'), { assistedAim: true }),
  d.toHit(c, attack('dagger'), { assistedAim: true }),
], [5, 6, 6, 5]));

test('damage text', () => {
  eq(d.damageText(c, attack('shot'), {}), '2d10 + 3');
  eq(d.damageText({ ...c, level: 5 }, { ...attack('shot'), cantripDie: 'd4' }, { compact: true }), '2d10+2d4+3');
  eq(d.damageText(c, attack('shortbow'), { compact: true }), '1d6+3');
  eq(d.damageText(c, attack('dagger'), { compact: true }), '1d4+3');
});

test('resources', () => {
  eq(c.resources.map((r) => d.resourceMax(c, r)), [2, 1]);
  eq(d.resourceMax({ ...c, level: 5 }, c.resources[0]), 3, 'Raven Queen follows proficiency bonus');
});

test('rangeText doubles only with Assisted Aim', () => eq(
  [d.rangeText(attack('shot'), {}), d.rangeText(attack('shot'), { assistedAim: true })],
  ['80 / 240 ft', '160 / 480 ft'],
));
