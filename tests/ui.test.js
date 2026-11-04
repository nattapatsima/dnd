import { test, eq, ok } from './runner.js';
import { mem, mountFresh, click, setAmount, text, type } from './helpers.js';
import { STORAGE_KEY } from '../js/storage.js';
import { CHARACTER as c } from '../js/character.js';
import { defaultState } from '../js/state.js';

test('update notice shows once', () => {
  const storage = mem({ [STORAGE_KEY]: JSON.stringify({ ...defaultState(c), lastSeenBuild: 0 }) });
  const first = mountFresh({ storage });
  ok(text(first.root, '#message').includes(`Updated to v${c.buildVersion}`), 'notice on the first launch after an update');
  const second = mountFresh({ storage });
  ok(!text(second.root, '#message').includes('Updated'), 'only once');
});

test('first launch shows no update notice', () => {
  const { root } = mountFresh();
  ok(!text(root, '#message').includes('Updated'));
});

const saved = (storage) => JSON.parse(storage.getItem(STORAGE_KEY));

async function importFile(root, content) {
  const input = root.querySelector('#import-file');
  const files = new DataTransfer();
  files.items.add(new File([content], 'backup.json', { type: 'application/json' }));
  input.files = files.files;
  input.dispatchEvent(new Event('change', { bubbles: true }));
  await new Promise((resolve) => setTimeout(resolve, 80));
}

test('typing a note saves immediately', () => {
  const { root, storage } = mountFresh();
  click(root, 'tab', 'notes');
  type(root, '[data-note="name"]', 'Pip');
  eq(saved(storage).notes.name, 'Pip');
});

test('header shows the entered name', () => {
  const { root } = mountFresh();
  click(root, 'tab', 'notes');
  type(root, '[data-note="name"]', 'Pip');
  click(root, 'tab', 'play');
  ok(root.textContent.includes('Pip'));
});

test('coins update the rifle fund', () => {
  const { root } = mountFresh();
  click(root, 'tab', 'gear');
  type(root, '[data-coin="gp"]', '40');
  click(root, 'tab', 'gear');
  ok(root.textContent.includes('Rifle fund 40 / 1000 gp'));
});

test('gear edits are kept one item per line', () => {
  const { root, storage } = mountFresh();
  click(root, 'tab', 'gear');
  type(root, '[data-gear="pack"]', 'Rope\n\n Potion of healing ');
  eq(saved(storage).gear.pack, ['Rope', 'Potion of healing']);
});

test('typing after damage clears undo so notes are kept', () => {
  const { root, storage } = mountFresh();
  setAmount(root, '3');
  click(root, 'damage');
  click(root, 'tab', 'notes');
  type(root, '[data-note="session"]', 'met Vex');
  click(root, 'tab', 'play');
  ok(!root.querySelector('[data-action="undo"]'), 'undo gone');
  eq(saved(storage).notes.session, 'met Vex');
});

test('import rejects a wrong file and keeps state', async () => {
  const { root } = mountFresh();
  setAmount(root, '3');
  click(root, 'damage');
  click(root, 'tab', 'notes');
  await importFile(root, '{"app":"other"}');
  eq(text(root, '#message'), 'Not a Quickstep backup file');
  click(root, 'tab', 'play');
  eq(text(root, '#hp'), '6');
});

test('import can be undone', async () => {
  const { root } = mountFresh();
  setAmount(root, '3');
  click(root, 'damage');
  click(root, 'tab', 'notes');
  await importFile(root, JSON.stringify({ app: 'quickstep-sheet', state: { hp: { current: 2, temp: 0, max: 9 } } }));
  click(root, 'undo');
  click(root, 'tab', 'play');
  eq(text(root, '#hp'), '6');
});

test('import restores a backup', async () => {
  const { root } = mountFresh();
  click(root, 'tab', 'notes');
  await importFile(root, JSON.stringify({ app: 'quickstep-sheet', state: { hp: { current: 2, temp: 0, max: 9 }, notes: { name: 'Pip', alignment: '', bio: '', session: '' } } }));
  ok(text(root, '#message').startsWith('Backup restored'), 'restored message');
  click(root, 'tab', 'play');
  eq(text(root, '#hp'), '2');
  ok(root.textContent.includes('Pip'), 'name restored');
});

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
