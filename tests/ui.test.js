import { test, eq, ok } from './runner.js';
import { mountFresh, click, setAmount, text } from './helpers.js';
import { STORAGE_KEY } from '../js/storage.js';

test('damage, undo and validation', () => {
  const { root } = mountFresh();
  setAmount(root, '4');
  click(root, 'damage');
  eq(text(root, '#hp'), '5');
  click(root, 'undo');
  eq(text(root, '#hp'), '9');
  click(root, 'damage');
  eq(text(root, '#error'), 'Enter an amount first');
});

test('state is saved after each change', () => {
  const { root, storage } = mountFresh();
  setAmount(root, '2');
  click(root, 'heal');
  ok(storage.getItem(STORAGE_KEY), 'saved');
});

test('toggles redraw the shot', () => {
  const { root } = mountFresh();
  click(root, 'toggle', 'advantage');
  ok(root.textContent.includes('2d20 high +5'));
});

test('tabs switch the view', () => {
  const { root } = mountFresh();
  click(root, 'tab', 'checks');
  ok(!root.querySelector('#hp'), 'play tab hidden');
  click(root, 'tab', 'play');
  ok(root.querySelector('#hp'), 'play tab back');
});
