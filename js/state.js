// Table state: everything the player changes at the table. Pure functions only.
import { resourceMax } from './derive.js';

export const STATE_VERSION = 1;

const flags = (n) => Array(n).fill(false);
const clearedSaves = () => ({ success: flags(3), failure: flags(3) });
const hitDieWord = (c) => (c.hp.hitDiceCount === 1 ? 'die' : 'dice');

export function defaultState(c) {
  return {
    stateVersion: STATE_VERSION,
    lastSeenBuild: null,
    hp: { current: c.hp.max, temp: 0, max: c.hp.max },
    deathSaves: clearedSaves(),
    hitDiceSpent: flags(c.hp.hitDiceCount),
    uses: Object.fromEntries(c.resources.map((r) => [r.id, flags(resourceMax(c, r))])),
    toggles: { advantage: false, assistedAim: false, inspiration: false },
    conditions: Object.fromEntries(c.conditions.map((name) => [name, false])),
    exhaustion: 0,
    arrows: c.arrowsDefault,
    coins: { ...c.coinDefaults },
    gear: { equipped: [...c.gearDefaults.equipped], pack: [...c.gearDefaults.pack] },
    notes: { name: '', alignment: '', bio: '', session: '' },
  };
}

// Whole numbers written as plain digits, e.g. "12". Anything else is null.
function wholeNumber(text) {
  const t = String(text ?? '').trim();
  return /^\d+$/.test(t) ? Number(t) : null;
}

// Amounts for Damage, Heal and Temp: positive whole numbers only.
export function parseAmount(text) {
  const n = wholeNumber(text);
  return n !== null && n > 0 ? n : null;
}

const clamp = (n, lo, hi) => Math.min(hi, Math.max(lo, n));

export function reduce(state, action, c) {
  const s = structuredClone(state);
  const done = (message = null, undoable = false) => ({ state: s, message, undoable });

  switch (action.type) {
    case 'damage': {
      const absorbed = Math.min(s.hp.temp, action.amount);
      s.hp.temp -= absorbed;
      s.hp.current = Math.max(0, s.hp.current - (action.amount - absorbed));
      return done(null, true);
    }
    case 'heal': {
      const wasDown = s.hp.current === 0;
      s.hp.current = Math.min(s.hp.max, s.hp.current + action.amount);
      if (wasDown && s.hp.current > 0) s.deathSaves = clearedSaves();
      return done(null, true);
    }
    case 'temp':
      s.hp.temp = Math.max(s.hp.temp, action.amount);
      return done(null, true);
    case 'shortRest': {
      const shortOnes = c.resources.filter((r) => r.recharge === 'short' && s.uses[r.id]);
      for (const r of shortOnes) s.uses[r.id] = s.uses[r.id].map(() => false);
      const message = shortOnes.length
        ? `Short rest: ${shortOnes.map((r) => r.name).join(', ')} restored. Spend hit ${hitDieWord(c)}, then use Heal.`
        : `Nothing recharges on a short rest at level ${c.level}. Spend your hit ${hitDieWord(c)}, then use Heal.`;
      return done(message, true);
    }
    case 'longRest':
      s.hp.current = s.hp.max;
      s.hp.temp = 0;
      s.hitDiceSpent = s.hitDiceSpent.map(() => false);
      for (const id of Object.keys(s.uses)) s.uses[id] = s.uses[id].map(() => false);
      s.deathSaves = clearedSaves();
      s.exhaustion = Math.max(0, s.exhaustion - 1);
      s.toggles.advantage = false;
      s.toggles.assistedAim = false;
      return done(`Long rest: HP, hit ${hitDieWord(c)} and daily uses restored.`, true);
    case 'toggleDeathSave':
      s.deathSaves[action.kind][action.index] = !s.deathSaves[action.kind][action.index];
      return done();
    case 'toggleHitDie':
      s.hitDiceSpent[action.index] = !s.hitDiceSpent[action.index];
      return done();
    case 'toggleUse':
      s.uses[action.id][action.index] = !s.uses[action.id][action.index];
      return done();
    case 'toggle':
      s.toggles[action.key] = !s.toggles[action.key];
      return done();
    case 'toggleCondition':
      s.conditions[action.name] = !s.conditions[action.name];
      return done();
    case 'exhaustion':
      s.exhaustion = clamp(s.exhaustion + action.delta, 0, 6);
      return done();
    case 'arrows':
      s.arrows = Math.max(0, s.arrows + action.delta);
      return done();
    case 'setCoin': {
      const n = wholeNumber(action.value);
      if (n !== null) s.coins[action.coin] = n;
      return done();
    }
    case 'setGear':
      s.gear[action.list] = action.lines.map((line) => line.trim()).filter(Boolean);
      return done();
    case 'setNote':
      s.notes[action.field] = String(action.value);
      return done();
    case 'seenBuild':
      s.lastSeenBuild = action.version;
      return done();
    default:
      throw new Error(`Unknown action: ${action.type}`);
  }
}
