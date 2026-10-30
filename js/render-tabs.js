// Header and the Checks, Features and spells, Gear and Notes tabs.
import {
  SKILLS, abilityMod, fmt, passive, saveBonus, skillBonus, skillMark, spellAttack, spellDC, toolBonus,
} from './derive.js';
import { esc } from './render-play.js';

const TABS = [['play', 'Play'], ['checks', 'Checks'], ['features', 'Features and spells'], ['gear', 'Gear'], ['notes', 'Notes']];
const ABILITY_NAMES = { str: 'Strength', dex: 'Dexterity', con: 'Constitution', int: 'Intelligence', wis: 'Wisdom', cha: 'Charisma' };
const COINS = ['cp', 'sp', 'ep', 'gp', 'pp'];

const row = (left, right) => `<div class="row"><span>${left}</span><span>${right}</span></div>`;

export function renderHeader(c, state, activeTab) {
  const name = state.notes.name.trim() || c.name;
  return `<header class="top"><div class="title"><b>${esc(name)}</b> <span class="label">${esc(c.classLine)}</span></div>`
    + `<nav class="tabs">${TABS.map(([id, label]) => `<button class="chip${id === activeTab ? ' on' : ''}" data-action="tab" data-arg="${id}">${label}</button>`).join('')}</nav></header>`;
}

export function renderChecks(c) {
  const blocks = Object.entries(ABILITY_NAMES).map(([ab, name]) => {
    const skills = Object.entries(SKILLS).filter(([, skill]) => skill.ability === ab);
    return `<div class="panel"><div class="b">${name} ${c.abilities[ab]} · ${fmt(abilityMod(c.abilities[ab]))}</div>`
      + row(`Save${c.saveProf.includes(ab) ? ' ●' : ''}`, fmt(saveBonus(c, ab)))
      + skills.map(([id, skill]) => row(`${skill.name}${skillMark(c, id) ? ` ${skillMark(c, id)}` : ''}`, fmt(skillBonus(c, id)))).join('')
      + '</div>';
  }).join('');
  return `<div class="checks">${blocks}</div>
<div class="panel"><div class="label">Tool checks</div>${c.tools.map((tool) => row(`${esc(tool.name)} · ${esc(tool.use)}`, `<b>${fmt(toolBonus(c, tool.id))}</b>`)).join('')}</div>
<div class="panel"><div class="label">Passive scores</div><div>Perception ${passive(c, 'perception')} · Insight ${passive(c, 'insight')} · Investigation ${passive(c, 'investigation')}</div></div>
<div class="panel"><div class="label">Proficiencies and languages</div><div>${esc(c.armorWeapons)}</div><div>${esc(c.languages)}</div></div>`;
}

export function renderFeatures(c) {
  const ability = ABILITY_NAMES[c.spellcasting.ability];
  return `<div class="panel"><div class="label">Spellcasting · ${esc(c.spellcasting.label)}</div>
<div>${ability} · save DC ${spellDC(c)} · spell attack ${fmt(spellAttack(c))} · no spell slots</div></div>
<div class="panel">${c.spells.map((spell) => `<div class="row"><b>${esc(spell.name)}</b><span class="muted">${esc(spell.meta)}</span></div><div class="label">${esc(spell.text)}</div>`).join('')}</div>
<div class="panel"><div class="label">Features</div>${c.features.map((f) => `<div class="feature"><b>${esc(f.name)}</b> · ${esc(f.text)}</div>`).join('')}</div>
<div class="label next">${esc(c.nextLevel)}</div>`;
}

export function renderGear(c, state) {
  return `<div class="panel"><div class="label">Equipped · one item per line</div><textarea data-gear="equipped" rows="4">${esc(state.gear.equipped.join('\n'))}</textarea></div>
<div class="panel"><div class="label">Pack · one item per line</div><textarea data-gear="pack" rows="5">${esc(state.gear.pack.join('\n'))}</textarea></div>
<div class="coins">${COINS.map((coin) => `<label class="panel"><span class="label">${coin.toUpperCase()}</span><input data-coin="${coin}" type="text" inputmode="numeric" pattern="[0-9]*" autocomplete="off" value="${state.coins[coin]}"></label>`).join('')}</div>
<div class="row gear-foot"><span>Attunement 0 / ${c.attunementSlots}</span><span class="muted" id="rifle-fund">Rifle fund ${state.coins.gp} / ${c.rifleGoal} gp</span></div>`;
}

export function renderNotes(c, state, ui = {}) {
  const n = state.notes;
  return `<div class="notes-grid"><input data-note="name" placeholder="Character name" value="${esc(n.name)}"><input data-note="alignment" placeholder="Alignment" value="${esc(n.alignment)}"></div>
<textarea data-note="bio" rows="4" placeholder="Appearance, personality, backstory">${esc(n.bio)}</textarea>
<textarea data-note="session" rows="9" placeholder="Session notes: names, quests, loot">${esc(n.session)}</textarea>
<div class="row backup"><span class="btnrow"><button data-action="export">Export backup</button><button data-action="import">Import backup</button></span><span class="label">v${c.buildVersion} · level ${c.level}</span></div>
<div id="message" class="label msg" role="status"><span>${esc(ui.message ?? '')}</span>${ui.canUndo ? '<button class="link" data-action="undo">Undo</button>' : ''}</div>
<input type="file" id="import-file" accept=".json,application/json" hidden>`;
}
