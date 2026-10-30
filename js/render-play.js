// The Play tab: everything needed for a turn on one landscape screen.
import {
  SKILLS, abilityMod, damageText, exhaustionText, fmt, passive, profBonus,
  saveBonus, skillBonus, skillMark, sneakDice, toHit,
} from './derive.js';

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

function stepper(action, value, id, lessLabel, moreLabel) {
  return `<span class="stepper"><button data-action="${action}" data-arg="-1" aria-label="${lessLabel}">−</button>`
    + `<b id="${id}">${value}</b><button data-action="${action}" data-arg="+1" aria-label="${moreLabel}">+</button></span>`;
}

export function renderPlay(c, state, ui = {}) {
  const t = state.toggles;
  const shot = c.attacks.find((a) => a.main);
  const others = c.attacks.filter((a) => !a.main);
  const hitText = `${t.advantage ? '2d20 high' : 'd20'} ${fmt(toHit(c, shot, { assistedAim: t.assistedAim }))}`;
  const con = abilityMod(c.abilities.con);
  const hitDie = `Hit ${c.hp.hitDiceCount === 1 ? 'die' : 'dice'} 1d${c.hp.hitDie} ${con < 0 ? '−' : '+'} ${Math.abs(con)}`;

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
      ${stat('AC', c.ac)}${stat('Init', fmt(abilityMod(c.abilities.dex)))}${stat('Speed', c.speed)}
      ${stat('Prof', fmt(profBonus(c.level)))}${stat('Size', c.size)}${stat('Passive', passive(c, 'perception'))}
    </div>
    <div class="row tight"><span class="label">Darkvision ${c.darkvision} ft</span><span class="label">${hitDie}${dots('hit-die', '', state.hitDiceSpent, (f) => !f, 'Hit die')}</span></div>
  </section>

  <section class="col">
    <div class="panel">
      <div class="label">Shot · ${esc(shot.name)}</div>
      <div class="row"><span>To hit</span><span class="hit">${hitText}</span></div>
      <div class="row"><span>Damage</span><b>${damageText(c, shot, {})}</b></div>
      ${shot.sneak ? `<div class="row"><span>Sneak Attack</span><b>+${sneakDice(c)}</b></div>` : ''}
      <div class="label">${esc(shot.range)} · ${esc(shot.note)}</div>
      <div class="chips">${chip('toggle', 'advantage', 'Advantage', t.advantage)}${chip('toggle', 'assistedAim', 'Assisted Aim', t.assistedAim)}</div>
    </div>
    <div class="panel">
      <div class="label">Other attacks</div>
      ${others.map((a) => `<div class="row"><span>${esc(a.name)}</span><b>${fmt(toHit(c, a, { assistedAim: t.assistedAim }))} · ${damageText(c, a, { compact: true })}</b></div>`).join('')}
    </div>
    <div class="panel row"><span>Arrows</span>${stepper('arrows', state.arrows, 'arrows', 'Use an arrow', 'Add an arrow')}</div>
  </section>

  <section class="col">
    <div class="panel">
      <div class="label">Daily uses</div>
      ${c.resources.map((r) => `<div class="row"><span>${esc(r.name)}</span><span class="dots">${dots('use', `${r.id}:`, state.uses[r.id] ?? [], (f) => !f, r.name)}</span></div>${r.note ? `<div class="label">${esc(r.note)}</div>` : ''}`).join('')}
      <div class="row"><span>Inspiration</span>${chip('toggle', 'inspiration', 'Have it', t.inspiration)}</div>
    </div>
    <div class="panel">
      <div class="label">Status</div>
      <div class="chips">${c.conditions.map((name) => chip('condition', name, name, state.conditions[name])).join('')}</div>
      <div class="row"><span>Exhaustion</span>${stepper('exhaustion', state.exhaustion, 'exhaustion', 'Lower exhaustion', 'Raise exhaustion')}</div>
      <div class="label">${exhaustionText(state.exhaustion)}</div>
    </div>
    <div class="btnrow rest"><button data-action="short-rest">Short rest</button><button data-action="long-rest">Long rest</button></div>
    <div id="message" class="label" role="status">${esc(ui.message ?? '')}${ui.canUndo ? ' <button class="link" data-action="undo">Undo</button>' : ''}</div>
  </section>
</div>

<div class="panel abilities" data-box="abilities">
  <div class="ab-grid">${ABILITIES.map(([k, label]) => `<div><div class="label">${label} ${c.abilities[k]}</div><b>${fmt(abilityMod(c.abilities[k]))}</b><div class="label">save ${fmt(saveBonus(c, k))}${c.saveProf.includes(k) ? ' ●' : ''}</div></div>`).join('')}</div>
  <div class="label">${esc(c.feyAncestry)}</div>
</div>

<div class="panel">
  <div class="label">Your skills · ● proficient, ●● expertise · full list on Checks</div>
  <div>${c.playSkills.map((id) => `${SKILLS[id].name} ${fmt(skillBonus(c, id))}${skillMark(c, id) === '●●' ? ' ●●' : ''}`).join(' · ')}</div>
</div>`;
}
