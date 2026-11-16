// Pure functions that turn build data (js/character.js) into the numbers the sheet shows.
import { TRANCE_TOOLS, TRANCE_WEAPONS } from './trance-options.js';

export const SKILLS = {
  athletics: { name: 'Athletics', ability: 'str' },
  acrobatics: { name: 'Acrobatics', ability: 'dex' },
  sleightOfHand: { name: 'Sleight of Hand', ability: 'dex' },
  stealth: { name: 'Stealth', ability: 'dex' },
  arcana: { name: 'Arcana', ability: 'int' },
  history: { name: 'History', ability: 'int' },
  investigation: { name: 'Investigation', ability: 'int' },
  nature: { name: 'Nature', ability: 'int' },
  religion: { name: 'Religion', ability: 'int' },
  animalHandling: { name: 'Animal Handling', ability: 'wis' },
  insight: { name: 'Insight', ability: 'wis' },
  medicine: { name: 'Medicine', ability: 'wis' },
  perception: { name: 'Perception', ability: 'wis' },
  survival: { name: 'Survival', ability: 'wis' },
  deception: { name: 'Deception', ability: 'cha' },
  intimidation: { name: 'Intimidation', ability: 'cha' },
  performance: { name: 'Performance', ability: 'cha' },
  persuasion: { name: 'Persuasion', ability: 'cha' },
};

export const abilityMod = (score) => Math.floor((score - 10) / 2);
export const profBonus = (level) => Math.ceil(level / 4) + 1;
// Negative numbers use a real minus sign (U+2212), as in the approved layout.
export const fmt = (n) => (n < 0 ? `−${Math.abs(n)}` : `+${n}`);

const mod = (c, ability) => abilityMod(c.abilities[ability]);
const prof = (c) => profBonus(c.level);

export function saveBonus(c, ability) {
  return mod(c, ability) + (c.saveProf.includes(ability) ? prof(c) : 0);
}

export function skillBonus(c, id) {
  const times = c.expertise.includes(id) ? 2 : c.skillProf.includes(id) ? 1 : 0;
  return mod(c, SKILLS[id].ability) + times * prof(c);
}

export function skillMark(c, id) {
  if (c.expertise.includes(id)) return '●●';
  return c.skillProf.includes(id) ? '●' : '';
}

export const passive = (c, id) => 10 + skillBonus(c, id);

export function toolBonus(c, id) {
  const tool = c.tools.find((t) => t.id === id) ?? TRANCE_TOOLS.find((t) => t.id === id);
  return mod(c, tool.ability) + prof(c);
}

// The Trance second pick: { weapon } or { tool } or {} when nothing is picked.
export function tranceChoice(id) {
  const weapon = TRANCE_WEAPONS.find((w) => w.id === id);
  if (weapon) return { weapon };
  const tool = TRANCE_TOOLS.find((t) => t.id === id);
  return tool ? { tool } : {};
}

// Tools shown on the Checks tab: the build's own plus a Trance tool.
export const toolsWithTrance = (c, state) => [...c.tools, ...(tranceChoice(state.trancePick).tool ? [tranceChoice(state.trancePick).tool] : [])];

// Other attacks on the Play tab: the build's own plus a Trance weapon.
export function otherAttacks(c, state) {
  const others = c.attacks.filter((a) => !a.main);
  const { weapon } = tranceChoice(state.trancePick);
  if (!weapon) return others;
  const name = weapon.range && weapon.kind === 'melee' ? `${weapon.name} (Trance), thrown ${weapon.range.join('/')}` : `${weapon.name} (Trance)`;
  return [...others, { id: `trance-${weapon.id}`, name, kind: weapon.kind, ability: weapon.ability, die: weapon.die, range: weapon.range }];
}

// Shadow Bind effects for the current state.
export const coldStrikeBonus = (c, state) => (c.shadowBind && state.bind === 'cold' ? prof(c) : 0);
export const coverBonus = (c, state) => (c.shadowBind && state.bind === 'cover' && state.toggles.moved ? 2 : 0);

export const spellAttack = (c) => mod(c, c.spellcasting.ability) + prof(c);
export const spellDC = (c) => 8 + spellAttack(c);

export const sneakDice = (c) => `${Math.ceil(c.classes.rogue / 2)}d6`;

// Ferocious Strike's extra dice by character level.
export function cantripDice(level) {
  if (level >= 17) return 4;
  if (level >= 11) return 3;
  if (level >= 5) return 2;
  return 1;
}

export function resourceMax(c, resource) {
  if (resource.max === 'level') return c.level;
  if (resource.max === 'prof') return profBonus(c.level);
  return resource.max;
}

// Assisted Aim and rangedBonus (Archery) only apply to ranged weapons, not thrown melee weapons.
export function toHit(c, attack, { assistedAim = false } = {}) {
  const rangedExtra = attack.kind === 'ranged' ? c.rangedBonus + (assistedAim ? (c.assistedAimBonus ?? 1) : 0) : 0;
  return mod(c, attack.ability) + prof(c) + rangedExtra;
}

// Assisted Aim doubles a ranged weapon's normal and long range.
export function rangeText(attack, { assistedAim = false } = {}) {
  const k = assistedAim && attack.kind === 'ranged' ? 2 : 1;
  return `${attack.range[0] * k} / ${attack.range[1] * k} ft`;
}

export function damageText(c, attack, { compact = false } = {}) {
  const m = mod(c, attack.ability);
  const sign = m < 0 ? '−' : '+';
  const dice = [attack.die];
  // The Light extra attack adds no (positive) ability modifier to its damage.
  if (attack.noModDamage && m >= 0) return compact ? dice.join('+') : dice.join(' + ');
  if (attack.cantripDie) dice.push(`${cantripDice(c.level)}${attack.cantripDie}`);
  return compact ? `${dice.join('+')}${sign}${Math.abs(m)}` : `${dice.join(' + ')} ${sign} ${Math.abs(m)}`;
}
