// Table state: everything the player changes at the table. Pure functions only.
import { resourceMax } from './derive.js';

// 2: hit dice are tracked per die type ({ d8: [...], d10: [...] }).
// 3: arrows replaced by rifle shots (shotsFired flags) and spare bullets; conditions and exhaustion removed.
// 4: Shadow Bind choice (bind) and the Trance second pick (trancePick); coldStrike toggle became bind.
export const STATE_VERSION = 4;

const flags = (n) => Array(n).fill(false);
const clearedSaves = () => ({ success: flags(3), failure: flags(3) });
const totalHitDice = (c) => c.hp.hitDice.reduce((n, h) => n + h.count, 0);
const hitDieWord = (c) => (totalHitDice(c) === 1 ? 'die' : 'dice');
export const hitDiceFlags = (c) => Object.fromEntries(c.hp.hitDice.map((h) => [`d${h.die}`, flags(h.count)]));

export function defaultState(c) {
  return {
    stateVersion: STATE_VERSION,
    lastSeenBuild: null,
    hp: { current: c.hp.max, temp: 0, max: c.hp.max },
    deathSaves: clearedSaves(),
    hitDiceSpent: hitDiceFlags(c),
    uses: Object.fromEntries(c.resources.map((r) => [r.id, flags(resourceMax(c, r))])),
    toggles: { advantage: false, assistedAim: false, inspiration: false, moved: false },
    // Shadow Bind for the day: 'cold', 'cover' or null.
    bind: null,
    // Trance second proficiency: an id from js/trance-options.js, or '' for none.
    trancePick: '',
    shotsFired: flags(c.rifle.shots),
    bullets: c.bulletsDefault,
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
      // recharge 'short' restores every use; shortRestRegain gives back that many spent uses.
      const back = [];
      for (const r of c.resources) {
        const used = s.uses[r.id];
        if (!used) continue;
        if (r.recharge === 'short') {
          if (used.some(Boolean)) back.push(r.name);
          s.uses[r.id] = used.map(() => false);
        } else if (r.shortRestRegain) {
          let regained = 0;
          s.uses[r.id] = [...used].reverse().map((spent) => {
            if (spent && regained < r.shortRestRegain) {
              regained += 1;
              return false;
            }
            return spent;
          }).reverse();
          if (regained) back.push(`${r.name} +${regained}`);
        }
      }
      const recharges = c.resources.some((r) => r.recharge === 'short' || r.shortRestRegain);
      let message;
      if (!recharges) message = `Nothing recharges on a short rest at level ${c.level}. Spend your hit ${hitDieWord(c)}, then use Heal.`;
      else if (back.length) message = `Short rest: ${back.join(', ')} back. Spend hit ${hitDieWord(c)}, then use Heal.`;
      else message = `Short rest: nothing was spent. Spend hit ${hitDieWord(c)}, then use Heal.`;
      return done(message, true);
    }
    case 'longRest':
      s.hp.current = s.hp.max;
      s.hp.temp = 0;
      for (const die of Object.keys(s.hitDiceSpent)) s.hitDiceSpent[die] = s.hitDiceSpent[die].map(() => false);
      for (const id of Object.keys(s.uses)) s.uses[id] = s.uses[id].map(() => false);
      s.deathSaves = clearedSaves();
      s.toggles.advantage = false;
      s.toggles.assistedAim = false;
      s.toggles.moved = false;
      return done(`Long rest: HP, hit ${hitDieWord(c)} and daily uses restored.${c.longRestNote ? ` ${c.longRestNote}` : ''}`, true);
    case 'toggleDeathSave':
      s.deathSaves[action.kind][action.index] = !s.deathSaves[action.kind][action.index];
      return done();
    case 'toggleHitDie':
      s.hitDiceSpent[action.die][action.index] = !s.hitDiceSpent[action.die][action.index];
      return done();
    case 'toggleUse':
      s.uses[action.id][action.index] = !s.uses[action.id][action.index];
      return done();
    case 'setBind':
      // Tapping the bound option again clears it.
      s.bind = s.bind === action.bind ? null : action.bind;
      if (s.bind !== 'cover') s.toggles.moved = false;
      return done();
    case 'setTrance':
      s.trancePick = String(action.id ?? '');
      return done();
    case 'toggle':
      s.toggles[action.key] = !s.toggles[action.key];
      return done();
    case 'toggleShot':
      s.shotsFired[action.index] = !s.shotsFired[action.index];
      return done();
    case 'reload': {
      // Fill the fired slots from the spare bullets.
      const empty = s.shotsFired.filter(Boolean).length;
      if (empty === 0) return done('The rifle is already loaded.');
      if (s.bullets === 0) return done('No spare bullets to reload with.');
      let take = Math.min(empty, s.bullets);
      s.bullets -= take;
      s.shotsFired = s.shotsFired.map((fired) => {
        if (fired && take > 0) {
          take -= 1;
          return false;
        }
        return fired;
      });
      return done(`Reloaded. ${s.bullets} spare bullet${s.bullets === 1 ? '' : 's'} left.`, true);
    }
    case 'bullets':
      s.bullets = Math.max(0, s.bullets + action.delta);
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
