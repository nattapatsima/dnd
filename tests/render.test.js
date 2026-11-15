import { test, ok } from './runner.js';
import { CHARACTER as c } from '../js/character.js';
import { defaultState } from '../js/state.js';
import { renderPlay } from '../js/render-play.js';
import { renderChecks, renderFeatures, renderGear, renderNotes } from '../js/render-tabs.js';

test('checks tab', () => {
  const h = renderChecks(c, defaultState(c));
  for (const t of ['Strength 8 · −1', 'Acrobatics ●●', "Thieves' tools · pick a lock or disarm a trap, DC 15",
    'Perception 17 · Insight 15 · Investigation 12', 'Common, Elvish, Sylvan, Undercommon', "Woodcarver's tools · carve a pattern in wood, DC 10"]) ok(h.includes(t), t);
});

test('features tab', () => {
  const h = renderFeatures(c);
  for (const t of ['Wisdom · save DC 13 · spell attack +5 · no spell slots', 'level 1 · action · 30 ft · 1 minute',
    'range doubles (DM: no +1 to hit)', 'Control Flames', 'Guidance', 'Shadow Bind', 'Steady Aim', 'Hunting Rifle (Slow), shortbow (Vex) · change them after a long rest',
    'Next level: Rogue 4 adds a feat', 'Blessing of the Raven Queen']) ok(h.includes(t), t);
});

test('gear tab', () => {
  const h = renderGear(c, defaultState(c));
  for (const t of ['Hunting Rifle (5 shots', 'Spare bullets', 'data-action="bullets"', 'Attunement 0 / 3', 'inputmode="numeric"']) ok(h.includes(t), t);
  ok(!h.includes('Rifle fund'), 'no rifle fund');
});

test('notes tab', () => {
  const h = renderNotes(c, defaultState(c), {});
  ok(h.includes(`v${c.buildVersion} · level 3`), 'version label');
  ok(h.includes('data-action="export"'), 'export button');
});

test('play tab level 3 content', () => {
  const h = renderPlay(c, defaultState(c), {});
  for (const t of [
    'd20 +5', '2d10 + 3', '+2d6', 'Shadow Bind', 'Trance · Rifle +', '80 / 240 ft · Slow: a hit cuts its speed by 10 ft',
    'Shot · Hunting Rifle', 'Shortbow, Vex', '+5 · 1d6+3', '+5 · 1d4+3', '<b>120 ft</b>', 'Size M', 'Hit dice 3d8 + 1',
    'Raven Queen teleport', 'Bonus Action: teleport 30 ft, resist all damage', 'Reload · <span id="bullets">15</span>',
    'Perception +7 ●●', 'save +5 ●',
  ]) ok(h.includes(t), t);
  ok(!h.includes('Sneak Attack needs'), 'no Sneak Attack rule line');
  for (const t of ['Status', 'Exhaustion', 'Prone', 'Ferocious']) ok(!h.includes(t), `no ${t}`);
});

test('no pending cantrips anywhere', () => {
  const h = renderFeatures(c) + renderGear(c, defaultState(c));
  for (const t of ['Ferocious', "Stalker's Eye", 'Component pouch', 'pending']) ok(!h.includes(t), `no ${t}`);
});

test('species traits are the last line of the abilities box', () => {
  const el = document.createElement('div');
  el.innerHTML = renderPlay(c, defaultState(c), {});
  ok(el.querySelector('[data-box="abilities"]').lastElementChild.textContent.startsWith('Fey Ancestry'));
});

test('toggles change to-hit', () => {
  const s = defaultState(c);
  ok(renderPlay(c, { ...s, toggles: { ...s.toggles, advantage: true } }, {}).includes('2d20 high +5'), 'advantage');
  const h = renderPlay(c, { ...s, toggles: { ...s.toggles, assistedAim: true } }, {});
  ok(h.includes('d20 +5'), 'shot stays +5 with Assisted Aim');
  ok(h.includes('+5 · 1d6+3'), 'shortbow stays +5');
  ok(!h.includes('+ 2 cold'), 'no cold damage until Cold strike is on');
  ok(renderPlay(c, { ...s, bind: 'cold' }, {}).includes('2d10 + 3 + 2 cold'), 'cold bind adds +2 cold');
});

test('Assisted Aim doubles the shot range', () => {
  const s = defaultState(c);
  ok(renderPlay(c, s, {}).includes('80 / 240 ft'), 'normal range');
  ok(renderPlay(c, { ...s, toggles: { ...s.toggles, assistedAim: true } }, {}).includes('160 / 480 ft'), 'doubled range');
});

test('two hit die types render separately', () => {
  const level2 = { ...c, level: 2, hp: { max: 16, hitDice: [{ die: 8, count: 1 }, { die: 10, count: 1 }] } };
  const h = renderPlay(level2, defaultState(level2), {});
  ok(h.includes('data-arg="d8:0"') && h.includes('data-arg="d10:0"'), 'one dot per die type');
  ok(h.includes('1d10'), 'shows the d10');
});

test('five rifle shot dots, fired ones hollow', () => {
  const s = defaultState(c);
  const el = document.createElement('div');
  el.innerHTML = renderPlay(c, { ...s, shotsFired: [true, false, false, false, false] }, {});
  const shots = [...el.querySelectorAll('[data-action="shot"]')];
  ok(shots.length === 5, `${shots.length} shot dots`);
  ok(!shots[0].classList.contains('on') && shots[1].classList.contains('on'), 'fired shot is hollow');
});

test('amount field opens the numeric keypad', () => {
  ok(renderPlay(c, defaultState(c), {}).includes('inputmode="numeric"'));
});

test('Shadow cover after moving: AC 17 and Dex save +7', () => {
  const s = defaultState(c);
  const el = document.createElement('div');
  el.innerHTML = renderPlay(c, { ...s, bind: 'cover', toggles: { ...s.toggles, moved: true } }, {});
  ok(el.querySelector('.stats').textContent.includes('17'), 'AC 17');
  ok(el.querySelector('[data-box="abilities"]').textContent.includes('save +7'), 'Dex save +7');
  ok(el.querySelector('[data-action="toggle"][data-arg="moved"]'), 'Moved chip shown with cover');
  el.innerHTML = renderPlay(c, { ...s, bind: 'cold' }, {});
  ok(!el.querySelector('[data-arg="moved"]'), 'no Moved chip with cold');
});

test('Trance dropdown lists every option and shows the pick', () => {
  const el = document.createElement('div');
  el.innerHTML = renderPlay(c, { ...defaultState(c), trancePick: 'longbow' }, {});
  const select = el.querySelector('[data-trance]');
  ok(select.options.length === 55, `${select.options.length} options`);
  ok(select.value === 'longbow', 'longbow selected');
  ok(el.textContent.includes('Longbow (Trance)'), 'longbow in Other attacks');
  ok(renderChecks(c, { ...defaultState(c), trancePick: 'disguise-kit' }).includes('Disguise Kit (Trance)'), 'tool on Checks tab');
});
