import { test, ok } from './runner.js';
import { CHARACTER as c } from '../js/character.js';
import { defaultState } from '../js/state.js';
import { renderPlay } from '../js/render-play.js';

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
