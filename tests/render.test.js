import { test, ok } from './runner.js';
import { CHARACTER as c } from '../js/character.js';
import { defaultState } from '../js/state.js';
import { renderPlay } from '../js/render-play.js';
import { renderChecks, renderFeatures, renderGear, renderNotes } from '../js/render-tabs.js';

test('checks tab', () => {
  const h = renderChecks(c);
  for (const t of ['Strength 8 · −1', 'Acrobatics ●●', "Thieves' tools · pick a lock or disarm a trap, DC 15",
    'Perception 17 · Insight 15 · Investigation 12', 'plus 1 of your choice (not picked yet)']) ok(h.includes(t), t);
});

test('features tab', () => {
  const h = renderFeatures(c);
  for (const t of ['Wisdom · save DC 13 · spell attack +5 · no spell slots', 'cantrip · action · touch · V, S, M · concentration',
    'You or an ally you touch', 'shortbow (Vex), shortsword (Vex) · change them after a long rest',
    'Next level: Fighter 1 adds Archery (+2 ranged to hit) and Second Wind']) ok(h.includes(t), t);
});

test('gear tab', () => {
  const h = renderGear(c, defaultState(c));
  for (const t of ['Component pouch', 'Rifle fund 5 / 1000 gp', 'Attunement 0 / 3', 'inputmode="numeric"']) ok(h.includes(t), t);
});

test('notes tab', () => {
  const h = renderNotes(c, defaultState(c), {});
  ok(h.includes('v1 · level 1'), 'version label');
  ok(h.includes('data-action="export"'), 'export button');
});

test('play tab level 1 content', () => {
  const h = renderPlay(c, defaultState(c), {});
  for (const t of [
    'd20 +5', '1d6 + 1d4 + 3', '+1d6', '80 / 320 ft · Vex: a hit gives advantage on your next shot at it',
    'Shortbow, plain (while hidden)', '+5 · 1d6+3', '+5 · 1d4+3', 'Darkvision 60 ft', 'Hit die 1d8 + 1',
    'Move 10+ ft: attacks on you have disadvantage · not while Incapacitated or Restrained',
    'Perception +7 ●●', 'save +5 ●',
  ]) ok(h.includes(t), t);
  ok(!h.includes('Sneak Attack needs'), 'no Sneak Attack rule line');
});

test('Fey Ancestry is the last line of the abilities box', () => {
  const el = document.createElement('div');
  el.innerHTML = renderPlay(c, defaultState(c), {});
  ok(el.querySelector('[data-box="abilities"]').lastElementChild.textContent.startsWith('Fey Ancestry'));
});

test('toggles change to-hit', () => {
  const s = defaultState(c);
  ok(renderPlay(c, { ...s, toggles: { ...s.toggles, advantage: true } }, {}).includes('2d20 high +5'), 'advantage');
  const h = renderPlay(c, { ...s, toggles: { ...s.toggles, assistedAim: true } }, {});
  ok(h.includes('d20 +6'), 'shot +6');
  ok(h.includes('+6 · 1d6+3'), 'plain shortbow +6');
});

test('amount field opens the numeric keypad', () => {
  ok(renderPlay(c, defaultState(c), {}).includes('inputmode="numeric"'));
});
