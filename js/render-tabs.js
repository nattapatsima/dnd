// Header and the Checks, Features (and spells), Spells, Gear and Notes tabs.
import {
  SKILLS, abilityMod, fillNumbers, fmt, hasSpellSlots, passive, saveBonus, skillBonus, skillMark, spellAttack, spellDC, toolBonus, toolsWithTrance,
} from './derive.js';
import { dots, esc } from './render-play.js';

// Builds with spell slots (full casters) get their own Spells tab; the others keep one combined tab.
function tabsFor(c) {
  if (!hasSpellSlots(c)) return [['play', 'Play'], ['checks', 'Checks'], ['features', 'Features and spells'], ['gear', 'Gear'], ['notes', 'Notes']];
  return [['play', 'Play'], ['checks', 'Checks'], ['features', 'Features'], ['spells', 'Spells'], ['gear', 'Gear'], ['notes', 'Notes']];
}
const ABILITY_NAMES = { str: 'Strength', dex: 'Dexterity', con: 'Constitution', int: 'Intelligence', wis: 'Wisdom', cha: 'Charisma' };
const COINS = ['cp', 'sp', 'ep', 'gp', 'pp'];

const row = (left, right) => `<div class="row"><span>${left}</span><span>${right}</span></div>`;

export function renderHeader(c, state, activeTab) {
  const name = state.notes.name.trim() || c.name;
  return `<header class="top"><div class="title"><b>${esc(name)}</b> <span class="label">${esc(c.classLine)}</span></div>`
    + `<nav class="tabs">${tabsFor(c).map(([id, label]) => `<button class="chip${id === activeTab ? ' on' : ''}" data-action="tab" data-arg="${id}">${label}</button>`).join('')}</nav></header>`;
}

export function renderChecks(c, state) {
  const blocks = Object.entries(ABILITY_NAMES).map(([ab, name]) => {
    const skills = Object.entries(SKILLS).filter(([, skill]) => skill.ability === ab);
    return `<div class="panel"><div class="b">${name} ${c.abilities[ab]} · ${fmt(abilityMod(c.abilities[ab]))}</div>`
      + row(`Save${c.saveProf.includes(ab) ? ' ●' : ''}`, fmt(saveBonus(c, ab)))
      + skills.map(([id, skill]) => row(`${skill.name}${skillMark(c, id) ? ` ${skillMark(c, id)}` : ''}`, fmt(skillBonus(c, id)))).join('')
      + '</div>';
  }).join('');
  return `<div class="checks">${blocks}</div>
<div class="panel"><div class="label">Tool checks</div>${toolsWithTrance(c, state).map((tool) => row(`${esc(tool.name)}${c.tools.includes(tool) ? '' : ' (Trance)'} · ${esc(tool.use)}`, `<b>${fmt(toolBonus(c, tool.id))}</b>`)).join('')}</div>
<div class="panel"><div class="label">Passive scores</div><div>Perception ${passive(c, 'perception')} · Insight ${passive(c, 'insight')} · Investigation ${passive(c, 'investigation')}</div></div>
<div class="panel"><div class="label">Proficiencies and languages</div><div>${esc(c.armorWeapons)}</div><div>${esc(c.languages)}</div></div>`;
}

// "slots: Level 1 ×4, Level 2 ×3", or "no spell slots" for a build without any.
function slotsText(c) {
  const slots = c.resources.filter((r) => r.slot);
  return slots.length ? `slots: ${slots.map((r) => `${r.name} ×${r.max}`).join(', ')}` : 'no spell slots';
}

function spellcastingPanel(c) {
  const ability = ABILITY_NAMES[c.spellcasting.ability];
  return `<div class="panel"><div class="label">Spellcasting · ${esc(c.spellcasting.label)}</div>
<div>${c.spellcasting.summary ? esc(fillNumbers(c, c.spellcasting.summary)) : `${ability} · save DC ${spellDC(c)} · spell attack ${fmt(spellAttack(c))} · ${slotsText(c)}`}</div></div>`;
}

export function renderFeatures(c) {
  // A build with its own Spells tab shows spellcasting and spells there, not here.
  const spellPart = hasSpellSlots(c) ? '' : `${spellcastingPanel(c)}
<div class="panel">${c.spells.map((spell) => `<div class="row"><b>${esc(spell.name)}</b><span class="muted">${esc(spell.meta)}</span></div><div class="label">${esc(fillNumbers(c, spell.text))}</div>`).join('')}</div>`;
  return `${spellPart}
<div class="panel"><div class="label">Features</div>${c.features.map((f) => `<div class="feature"><b>${esc(f.name)}</b> · ${esc(fillNumbers(c, f.text))}</div>`).join('')}</div>
${c.bonusActions ? `<div class="panel"><div class="label">Bonus Actions · one per turn</div>${c.bonusActions.map((b) => `<div class="feature"><b>${esc(b.name)}</b> · ${esc(fillNumbers(c, b.text))}</div>`).join('')}</div>` : ''}
${c.dmRulings ? `<div class="panel"><div class="label">DM rulings</div>${c.dmRulings.map((r) => `<div class="feature">${esc(r)}</div>`).join('')}</div>` : ''}
<div class="label next">${esc(c.nextLevel)}</div>`;
}

// Spells tab: a spellbook by level. Each level header carries that level's slot dots (the same
// slots as the Play tab); spells sort by casting time, then name.
const CAST_ORDER = { action: 0, bonus: 1, reaction: 2, long: 3 };
const LEVEL_NAMES = ['Cantrips', 'Level 1', 'Level 2', 'Level 3', 'Level 4', 'Level 5', 'Level 6', 'Level 7', 'Level 8', 'Level 9'];

function spellCard(c, s) {
  const tags = [s.components, s.duration, s.concentration ? 'Concentration' : '', s.ritual ? 'Ritual' : '', s.source].filter(Boolean);
  return `<div class="panel spell" data-spell="${esc(s.name)}">`
    + `<div class="row"><b>${esc(s.name)}</b><span class="muted">${esc(s.castText)} · ${esc(s.range)}</span></div>`
    + `<div class="label">${esc(tags.join(' · '))}</div>`
    + `<div>${esc(fillNumbers(c, s.text))}</div>`
    + `${s.upcast ? `<div class="label">${s.level === 0 ? '' : 'Upcast: '}${esc(fillNumbers(c, s.upcast))}</div>` : ''}`
    + `${s.tag ? `<div class="label b">${esc(fillNumbers(c, s.tag))}</div>` : ''}</div>`;
}

export function renderSpells(c, state) {
  const levels = [...new Set(c.spells.map((s) => s.level))].sort((a, b) => a - b);
  const sections = levels.map((level) => {
    const spells = c.spells.filter((s) => s.level === level)
      .sort((a, b) => (CAST_ORDER[a.cast] ?? 9) - (CAST_ORDER[b.cast] ?? 9) || a.name.localeCompare(b.name));
    const slot = c.resources.find((r) => r.slot && r.id === `slot${level}`);
    const slotDots = slot ? `<span class="dots">${dots('use', `${slot.id}:`, state.uses[slot.id] ?? [], (f) => !f, `${LEVEL_NAMES[level]} slot`)}</span>` : '';
    return `<div class="row spell-level"><b>${LEVEL_NAMES[level]}</b>${slotDots}</div>`
      + `<div class="spell-grid">${spells.map((s) => spellCard(c, s)).join('')}</div>`;
  }).join('');
  return `${spellcastingPanel(c)}${sections}`;
}

export function renderGear(c, state) {
  return `<div class="panel"><div class="label">Equipped · one item per line</div><textarea data-gear="equipped" rows="4">${esc(state.gear.equipped.join('\n'))}</textarea></div>
<div class="panel"><div class="label">Pack · one item per line</div><textarea data-gear="pack" rows="5">${esc(state.gear.pack.join('\n'))}</textarea></div>
<div class="coins">${COINS.map((coin) => `<label class="panel"><span class="label">${coin.toUpperCase()}</span><input data-coin="${coin}" type="text" inputmode="numeric" pattern="[0-9]*" autocomplete="off" value="${state.coins[coin]}"></label>`).join('')}</div>
<div class="row gear-foot"><span>Attunement 0 / ${c.attunementSlots}</span>${c.rifle ? `<span class="row"><span>Spare bullets</span><span class="stepper"><button data-action="bullets" data-arg="-1" aria-label="Remove a bullet">−</button><b id="bullets">${state.bullets}</b><button data-action="bullets" data-arg="+1" aria-label="Add a bullet">+</button></span></span>` : ''}</div>
${c.rifle ? `<div class="label">Plus ${c.rifle.shots} in the rifle when loaded · Reload on the Play tab refills it from these</div>` : ''}`;
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
