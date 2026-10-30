import { test, eq } from './runner.js';
import { CHARACTER as c } from '../js/character.js';
import * as d from '../js/derive.js';

const attack = (id) => c.attacks.find((x) => x.id === id);

test('fmt uses a real minus', () => { eq(d.fmt(3), '+3'); eq(d.fmt(0), '+0'); eq(d.fmt(-1), '−1'); });

test('proficiency by level', () => eq([1, 4, 5, 9, 17].map(d.profBonus), [2, 2, 3, 4, 6]));

test('level 1 saves', () => eq(['str', 'dex', 'con', 'int', 'wis', 'cha'].map((a) => d.saveBonus(c, a)), [-1, 5, 1, 2, 3, 0]));

test('level 1 skills', () => eq(Object.fromEntries(Object.keys(d.SKILLS).map((k) => [k, d.skillBonus(c, k)])), {
  athletics: -1, acrobatics: 7, sleightOfHand: 5, stealth: 5, arcana: 0, history: 0, investigation: 2, nature: 0, religion: 0,
  animalHandling: 3, insight: 5, medicine: 3, perception: 7, survival: 5, deception: 2, intimidation: 0, performance: 0, persuasion: 0,
}));

test('marks', () => eq(['perception', 'acrobatics', 'stealth', 'athletics'].map((k) => d.skillMark(c, k)), ['●●', '●●', '●', '']));

test('passives and tools', () => eq(
  [d.passive(c, 'perception'), d.passive(c, 'insight'), d.passive(c, 'investigation'), d.toolBonus(c, 'thieves'), d.toolBonus(c, 'carto')],
  [17, 15, 12, 5, 5],
));

test('spellcasting', () => eq([d.spellDC(c), d.spellAttack(c)], [13, 5]));

test('sneak and cantrip dice', () => {
  eq(d.sneakDice(c), '1d6');
  eq(d.sneakDice({ ...c, classes: { rogue: 5, fighter: 1 } }), '3d6');
  eq([1, 4, 5, 11, 17].map(d.cantripDice), [1, 1, 2, 3, 4]);
});

test('to-hit with Assisted Aim', () => eq([
  d.toHit(c, attack('shot'), {}),
  d.toHit(c, attack('shot'), { assistedAim: true }),
  d.toHit(c, attack('plain'), { assistedAim: true }),
  d.toHit(c, attack('dagger'), { assistedAim: true }),
], [5, 6, 6, 5]));

test('damage text', () => {
  eq(d.damageText(c, attack('shot'), {}), '1d6 + 1d4 + 3');
  eq(d.damageText(c, attack('plain'), { compact: true }), '1d6+3');
  eq(d.damageText(c, attack('dagger'), { compact: true }), '1d4+3');
});

test('resources', () => eq(c.resources.map((r) => d.resourceMax(c, r)), [1, 1]));

test('exhaustion', () => eq([0, 2, 6].map(d.exhaustionText), ['No penalty', 'd20 tests −4 · speed −10 ft', 'Dead']));
