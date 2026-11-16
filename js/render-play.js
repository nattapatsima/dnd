// The Play tab: everything needed for a turn on one landscape screen.
import {
  SKILLS, abilityMod, coldStrikeBonus, coverBonus, damageText, fmt, otherAttacks, passive, profBonus,
  rangeText, saveBonus, skillBonus, skillMark, sneakDice, toHit,
} from './derive.js';
import { TRANCE_TOOLS, TRANCE_WEAPONS } from './trance-options.js';

// Escape text for HTML. Apostrophes are left alone; attributes always use double quotes.
export const esc = (value) => String(value).replace(/[&<>"]/g, (ch) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[ch]);

const ABILITIES = [['str', 'Str'], ['dex', 'Dex'], ['con', 'Con'], ['int', 'Int'], ['wis', 'Wis'], ['cha', 'Cha']];

export function chip(action, arg, label, on) {
  return `<button class="chip${on ? ' on' : ''}" data-action="${action}" data-arg="${esc(arg)}" aria-pressed="${Boolean(on)}">${esc(label)}</button>`;
}

// One tappable dot per flag. `filled(flag)` decides whether the dot is drawn filled.
function dots(action, argPrefix, flags, filled, label) {
  return flags.map((flag, i) => (
    `<button class="dot${filled(flag) ? ' on' : ''}" data-action="${action}" data-arg="${esc(argPrefix)}${i}" aria-label="${esc(label)} ${i + 1}"></button>`
  )).join('');
}

const stat = (label, value) => `<div><div class="label">${label}</div><b>${value}</b></div>`;

// Shadow Bind: one choice per long rest. Cover needs a 15-ft move in dim light or darkness each turn.
function shadowBindPanel(c, state) {
  const cover = state.bind === 'cover';
  const effect = {
    cold: `+${profBonus(c.level)} cold, one hit per turn`,
    cover: state.toggles.moved ? '+2 AC and Dex saves' : 'move 15 ft in the dark: +2 AC',
  }[state.bind] ?? 'pick after the ritual';
  return `<div class="panel" data-box="bind">
      <div class="label">Shadow Bind · ${esc(effect)}</div>
      <div class="chips">${chip('bind', 'cold', 'Cold', state.bind === 'cold')}${chip('bind', 'cover', 'Cover', cover)}${cover ? chip('toggle', 'moved', 'Moved 15 ft', state.toggles.moved) : ''}</div>
    </div>`;
}

// Trance: the rifle is fixed; the second weapon or tool is picked each long rest.
function trancePanel(state) {
  const option = (o) => `<option value="${esc(o.id)}"${o.id === state.trancePick ? ' selected' : ''}>${esc(o.name)}</option>`;
  return `<div class="panel" data-box="trance">
      <div class="row"><label class="label" for="trance-pick">Trance · Rifle +</label>
      <select id="trance-pick" data-trance aria-label="Trance second proficiency">
        <option value=""${state.trancePick ? '' : ' selected'}>Pick one</option>
        <optgroup label="Weapons">${TRANCE_WEAPONS.map(option).join('')}</optgroup>
        <optgroup label="Tools">${TRANCE_TOOLS.map(option).join('')}</optgroup>
      </select></div>
    </div>`;
}

export function renderPlay(c, state, ui = {}) {
  const t = state.toggles;
  const shot = c.attacks.find((a) => a.main);
  const others = otherAttacks(c, state);
  const cold = coldStrikeBonus(c, state);
  const cover = coverBonus(c, state);
  const hasAssistedAim = c.resources.some((r) => r.id === 'assistedAim');
  const hitText = `${t.advantage ? '2d20 high' : 'd20'} ${fmt(toHit(c, shot, { assistedAim: t.assistedAim }))}`;
  const con = abilityMod(c.abilities.con);
  const conText = `${con < 0 ? '−' : '+'} ${Math.abs(con)}`;
  const dice = c.hp.hitDice;
  const dieDots = (h) => dots('hit-die', `d${h.die}:`, state.hitDiceSpent[`d${h.die}`] ?? [], (f) => !f, `d${h.die} hit die`);
  let hitDice;
  if (dice.length === 1) {
    const [h] = dice;
    hitDice = `Hit ${h.count === 1 ? 'die' : 'dice'} ${h.count}d${h.die} ${conText}${dieDots(h)}`;
  } else {
    hitDice = `Hit dice ${dice.map((h) => `${h.count}d${h.die}${dieDots(h)}`).join(' ')} ${conText} each`;
  }

  return `
<div class="play">
  <section class="col">
    <div class="panel">
      <div class="label">Hit points</div>
      <div class="row"><span><span id="hp" class="big">${state.hp.current}</span><span class="muted"> / ${state.hp.max}</span></span><span class="muted">temp ${state.hp.temp}</span></div>
      <input id="amount" type="text" inputmode="numeric" pattern="[0-9]*" autocomplete="off" placeholder="Amount" aria-label="Amount">
      <div class="btnrow"><button data-action="damage">Damage</button><button data-action="heal">Heal</button><button data-action="temp">Temp</button></div>
      <div id="error" class="error" role="alert">${esc(ui.error ?? '')}</div>
    </div>
    <div class="panel">
      <div class="label">Death saves</div>
      <div class="row"><span>Success</span><span class="dots">${dots('death-save', 'success:', state.deathSaves.success, (f) => f, 'Death save success')}</span></div>
      <div class="row"><span>Failure</span><span class="dots">${dots('death-save', 'failure:', state.deathSaves.failure, (f) => f, 'Death save failure')}</span></div>
    </div>
    <div class="panel stats">
      ${stat('AC', c.ac + cover)}${stat('Init', fmt(abilityMod(c.abilities.dex)))}${stat('Speed', c.speed)}
      ${stat('Prof', fmt(profBonus(c.level)))}${!c.darkvision && c.climb ? stat('Climb', `${c.climb} ft`) : stat('Darkvision', c.darkvision ? `${c.darkvision} ft` : 'none')}${stat('Passive', passive(c, 'perception'))}
    </div>
    <div class="row tight"><span class="label">Size ${c.size}</span><span class="label">${hitDice}</span></div>
  </section>

  <section class="col">
    <div class="panel">
      <div class="label">${shot.kind === 'melee' ? 'Attack' : 'Shot'} · ${esc(shot.name)}</div>
      <div class="row"><span>To hit</span><span class="hit">${hitText}</span></div>
      <div class="row"><span>Damage</span><b>${damageText(c, shot, {})}${shot.damageType ? ` ${esc(shot.damageType)}` : ''}${cold ? ` + ${cold} cold` : ''}</b></div>
      ${shot.sneak ? `<div class="row"><span>Sneak Attack</span><b>+${sneakDice(c)}</b></div>` : ''}
      <div class="label">${shot.reachText ? esc(shot.reachText) : rangeText(shot, { assistedAim: t.assistedAim })} · ${esc(shot.note)}</div>
      <div class="chips">${chip('toggle', 'advantage', 'Advantage', t.advantage)}${hasAssistedAim ? chip('toggle', 'assistedAim', 'Assisted Aim', t.assistedAim) : ''}</div>
    </div>
    <div class="panel">
      <div class="label">Other attacks</div>
      ${others.map((a) => `<div class="row"><span>${esc(a.name)}</span><b>${fmt(toHit(c, a, { assistedAim: t.assistedAim }))} · ${damageText(c, a, { compact: true })}</b></div>`).join('')}
    </div>
    ${c.rifle ? `<div class="panel row ammo"><span>Rifle</span><span class="dots">${dots('shot', '', state.shotsFired, (f) => !f, 'Rifle shot')}</span><button data-action="reload" aria-label="Reload from ${state.bullets} spare bullets">Reload · <span id="bullets">${state.bullets}</span></button></div>` : ''}
  </section>

  <section class="col">
    <div class="panel">
      <div class="label">Daily uses</div>
      ${c.resources.map((r) => `<div class="row"><span>${esc(r.name)}</span><span class="dots">${dots('use', `${r.id}:`, state.uses[r.id] ?? [], (f) => !f, r.name)}</span></div>${r.note ? `<div class="label">${esc(r.note)}</div>` : ''}`).join('')}
      <div class="row"><span>Inspiration</span>${chip('toggle', 'inspiration', 'Have it', t.inspiration)}</div>
      ${c.playNote ? `<div class="label">${esc(c.playNote)}</div>` : ''}
    </div>
${c.shadowBind ? shadowBindPanel(c, state) : ''}
${c.trance ? trancePanel(state) : ''}
    <div class="btnrow rest"><button data-action="short-rest">Short rest</button><button data-action="long-rest">Long rest</button></div>
    <div id="message" class="label msg" role="status"><span>${esc(ui.message ?? '')}</span>${ui.canUndo ? '<button class="link" data-action="undo">Undo</button>' : ''}</div>
  </section>
</div>

<div class="panel abilities" data-box="abilities">
  <div class="ab-grid">${ABILITIES.map(([k, label]) => `<div><div class="label">${label} ${c.abilities[k]}</div><b>${fmt(abilityMod(c.abilities[k]))}</b><div class="label">save ${fmt(saveBonus(c, k) + (k === 'dex' ? cover : 0))}${c.saveProf.includes(k) ? ' ●' : ''}</div></div>`).join('')}</div>
  <div class="label">${esc(c.traitsLine)}</div>
</div>

<div class="panel">
  <div class="label">Your skills · ● proficient, ●● expertise · full list on Checks</div>
  <div>${c.playSkills.map((id) => `${SKILLS[id].name} ${fmt(skillBonus(c, id))}${skillMark(c, id) === '●●' ? ' ●●' : ''}`).join(' · ')}</div>
</div>`;
}
