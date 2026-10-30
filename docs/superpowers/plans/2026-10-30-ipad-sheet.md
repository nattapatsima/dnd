# Quickstep iPad Sheet Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build an offline iPad web app (PWA) character sheet for the Quickstep Sniper at level 1, then publish it on GitHub Pages.

**Architecture:** The data is split in two:
- **Build data:** a static JS module, `js/character.js`, owned by Claude.
- **Table state:** a JSON object in `localStorage`, owned by the player.

Pure modules turn them into numbers (`derive.js`) and handle state changes (`state.js`) and saving (`storage.js`). Render modules return HTML strings. `main.js` mounts them and routes taps through one `reduce()` call. A service worker precaches every file, so the app runs offline once installed.

**Tech Stack:** Plain HTML, CSS and ES-module JavaScript. Python 3 stdlib (dev server, icon script). Tests run in the browser on a small custom runner. No Node, npm, build step or CDN.

**Spec:** `docs/superpowers/specs/2026-10-30-ipad-sheet-design.md`. Read it first: section 7 holds every on-screen string and number.

## Global Constraints

- No installs, no build step: plain HTML, CSS and JavaScript files.
- Offline: no CDNs, web fonts or external requests; use the system font.
- Touch targets at least 44 pt (44 CSS px). Number entry uses the numeric keypad (`inputmode="numeric"`).
- Character-specific info only. No core-rule explanations.
- Public repo: nothing personal beyond the GitHub username. No email addresses, no local file paths.
- Feature and spell text is short summaries in our own words. Never book text.
- The Play tab fits with no scrolling at 1024 × 744 CSS px and every larger iPad landscape size.
- An update never overwrites table state.
- Every number on screen matches `../Characters/Quickstep Sniper.md` (level 1).
- Negative modifiers display with "−" (U+2212), as in the approved layout.
- Every publish bumps `CHARACTER.buildVersion` and the `CACHE` name in `sw.js` together.
- Commit messages end with the trailer `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>` (second `-m` paragraph).
- All paths below are relative to `sheet/`, except `.claude/launch.json`, which lives in the DnD root.

## Review Focus

1. **Device storage blocked or failing** (private mode, iOS eviction, quota): the app still works for the session, shows a "not saving" warning, and never crashes. Test: Task 4, `storage that throws`.
2. **iPad suspends the app mid-typing:** notes and gear are written on every input event and flushed on `pagehide`, so nothing typed is lost. Test: Task 6, `typing a note saves immediately`.
3. **Odd Amount input** ("", "0", "-3", "3.5", "abc", "999"): only positive whole numbers apply, everything else shows the error, and huge damage floors HP at 0. Test: Task 3, `parseAmount` and `damage floors at 0`.
4. **Wrong or old backup file imported:** rejected with a message, current state untouched; older backups migrate. Test: Task 4, `parseBackup rejects` and `parseBackup migrates`.
5. **Level-up update while damaged:** current HP rises by the max increase, new uses start full, gear, coins and notes are untouched, and "Updated to vX" shows once. Tests: Task 4, `migration on level-up`, and Task 8, `update notice shows once`.

---

### Task 1: Repo, dev server and test runner

**Files:**
- Create: `.nojekyll` (empty), `tools/serve.py`, `tests/runner.js`, `tests/index.html`, `tests/smoke.test.js`
- Create (DnD root, not in repo): `.claude/launch.json`

**Interfaces:**
- Produces: `tests/runner.js` exports
  - `test(name: string, fn: () => void | Promise<void>)`
  - `eq(actual, expected, label?)`: deep equality via `JSON.stringify`, throws on mismatch
  - `ok(cond, label?)`
  - `run(): Promise<{passed: number, failed: number, failures: string[]}>`
- `run()` writes "N passed, M failed" plus each failure into `#results`, and sets `window.__results`.
- `tests/index.html` imports every `*.test.js` listed in it, then calls `run()`. Each later task adds its new test file to that list.

- [ ] **Step 1:** Ask the player for their GitHub username. Run `git -C sheet init`, then set repo-local `user.name` to the username and `user.email` to `<username>@users.noreply.github.com`.
- [ ] **Step 2:** Write `tools/serve.py`: a stdlib `http.server` started as `python sheet/tools/serve.py --port 8000 --root sheet`. It forces these MIME types (Windows often maps `.js` to `text/plain`) and sends `Cache-Control: no-store`:
  - `.js` → `text/javascript`
  - `.webmanifest` → `application/manifest+json`
  - `.json` → `application/json`
  - `.css` → `text/css`
  - `.png` → `image/png`
- [ ] **Step 3:** Write `.claude/launch.json` with one configuration: name `sheet`, `runtimeExecutable: "python"`, `runtimeArgs: ["sheet/tools/serve.py", "--port", "8000", "--root", "sheet"]`, port 8000.
- [ ] **Step 4:** Write `tests/smoke.test.js` containing `test('runner works', () => eq(1 + 1, 2))`, and the runner it needs.
- [ ] **Step 5:** `preview_start` name `sheet`, then navigate to `http://localhost:8000/tests/`. Expected: `window.__results` is `{passed: 1, failed: 0, …}`.
- [ ] **Step 6:** Commit, including `docs/`: `git -C sheet add -A`, then `git -C sheet commit -m "chore: dev server and browser test runner" -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"`.

---

### Task 2: Character build data and derived numbers

**Files:**
- Create: `js/character.js`, `js/derive.js`, `tests/derive.test.js` (add to `tests/index.html`)

**Interfaces:**
- Produces `js/character.js`: `export const CHARACTER`. The keys below are fixed; the values come from spec section 7.
  - **Identity:** `buildVersion: 1`, `name: 'Quickstep Sniper'`, `level: 1`, `classLine: 'Rogue 1 · level 1'`, `classes: {rogue: 1, fighter: 0}`
  - **Abilities and proficiencies:**
    - `abilities: {str: 8, dex: 17, con: 13, int: 10, wis: 16, cha: 10}`
    - `saveProf: ['dex', 'int']`
    - `skillProf: ['acrobatics', 'sleightOfHand', 'stealth', 'investigation', 'insight', 'perception', 'survival', 'deception']`
    - `expertise: ['perception', 'acrobatics']`
    - `tools: [{id: 'thieves', name: "Thieves' tools", ability: 'dex', use: 'pick a lock or disarm a trap, DC 15'}, {id: 'carto', name: "Cartographer's tools", ability: 'wis', use: 'draw a map, DC 15'}]`
  - **Combat basics:** `ac: 15`, `speed: 50`, `size: 'S'`, `darkvision: 60`, `hp: {max: 9, hitDie: 8, hitDiceCount: 1}`, `rangedBonus: 0` (Archery adds 2 later), `spellcasting: {ability: 'wis', label: 'Magic Initiate (Druid)'}`
  - **Attacks:** each entry is `{id, name, kind: 'ranged' | 'melee' | 'thrown', ability, die, cantripDie?, sneak?, range?, note?, main?}`. Ids: `shot` (main, `cantripDie: 'd4'`, `sneak: true`), `plain`, `shortsword`, `dagger`.
  - **Resources:** each entry is `{id, name, max: number | 'level', recharge: 'long' | 'short', note?}`. Ids: `startling` (max `'level'`), `assistedAim` (max 1).
  - **Text for display:** `conditions: string[]`, `spells: [{name, meta, text}]`, `features: [{name, text}]`, `feyAncestry: string`, `languages: string`, `armorWeapons: string`, `nextLevel: string`
  - **Starting table values:** `gearDefaults: {equipped: string[], pack: string[]}`, `coinDefaults: {cp: 0, sp: 0, ep: 0, gp: 5, pp: 0}`, `arrowsDefault: 40`, `attunementSlots: 3`, `rifleGoal: 1000`
- Produces `js/derive.js`, all pure, where `c` is a CHARACTER:
  - `SKILLS`: `{[id]: {name, ability}}` for all 18 skills, in the spec's Checks-tab order
  - `abilityMod(score) → number`, `profBonus(level) → number`, `fmt(n) → string`
  - `saveBonus(c, ab) → number`, `skillBonus(c, id) → number`, `skillMark(c, id) → '' | '●' | '●●'`
  - `passive(c, id) → number`, `toolBonus(c, id) → number`
  - `spellDC(c) → number`, `spellAttack(c) → number`
  - `sneakDice(c) → string`, `cantripDice(level) → number`, `resourceMax(c, r) → number`
  - `toHit(c, attack, {assistedAim}) → number`: Assisted Aim adds +1 only to `kind === 'ranged'`; `c.rangedBonus` applies to ranged only
  - `damageText(c, attack, {compact}) → string`
  - `exhaustionText(n) → string`

- [ ] **Step 1: Write the failing tests** in `tests/derive.test.js`:

```js
test('fmt uses a real minus', () => { eq(d.fmt(3), '+3'); eq(d.fmt(0), '+0'); eq(d.fmt(-1), '−1'); });
test('proficiency by level', () => eq([1, 4, 5, 9, 17].map(d.profBonus), [2, 2, 3, 4, 6]));
test('level 1 saves', () => eq(['str','dex','con','int','wis','cha'].map(a => d.saveBonus(c, a)), [-1, 5, 1, 2, 3, 0]));
test('level 1 skills', () => eq(Object.fromEntries(Object.keys(d.SKILLS).map(k => [k, d.skillBonus(c, k)])), {
  athletics: -1, acrobatics: 7, sleightOfHand: 5, stealth: 5, arcana: 0, history: 0, investigation: 2, nature: 0, religion: 0,
  animalHandling: 3, insight: 5, medicine: 3, perception: 7, survival: 5, deception: 2, intimidation: 0, performance: 0, persuasion: 0 }));
test('marks', () => eq(['perception','acrobatics','stealth','athletics'].map(k => d.skillMark(c, k)), ['●●','●●','●','']));
test('passives and tools', () => eq([d.passive(c,'perception'), d.passive(c,'insight'), d.passive(c,'investigation'), d.toolBonus(c,'thieves'), d.toolBonus(c,'carto')], [17, 15, 12, 5, 5]));
test('spellcasting', () => eq([d.spellDC(c), d.spellAttack(c)], [13, 5]));
test('sneak and cantrip dice', () => { eq(d.sneakDice(c), '1d6'); eq(d.sneakDice({...c, classes: {rogue: 5, fighter: 1}}), '3d6'); eq([1, 4, 5, 11, 17].map(d.cantripDice), [1, 1, 2, 3, 4]); });
test('to-hit with Assisted Aim', () => { const a = id => c.attacks.find(x => x.id === id);
  eq([d.toHit(c, a('shot'), {}), d.toHit(c, a('shot'), {assistedAim: true}), d.toHit(c, a('plain'), {assistedAim: true}), d.toHit(c, a('dagger'), {assistedAim: true})], [5, 6, 6, 5]); });
test('damage text', () => { const a = id => c.attacks.find(x => x.id === id);
  eq(d.damageText(c, a('shot'), {}), '1d6 + 1d4 + 3'); eq(d.damageText(c, a('plain'), {compact: true}), '1d6+3'); eq(d.damageText(c, a('dagger'), {compact: true}), '1d4+3'); });
test('resources', () => eq(c.resources.map(r => d.resourceMax(c, r)), [1, 1]));
test('exhaustion', () => eq([0, 2, 6].map(d.exhaustionText), ['No penalty', 'd20 tests −4 · speed −10 ft', 'Dead']));
```

- [ ] **Step 2:** Reload `/tests/`. Expected: these tests FAIL because the modules are missing.
- [ ] **Step 3:** Implement `js/character.js` (values from spec section 7) and `js/derive.js`. Use `profBonus = Math.ceil(level / 4) + 1` and `sneakDice` = `ceil(rogueLevel / 2)` d6.
- [ ] **Step 4:** Reload `/tests/`. Expected: all PASS.
- [ ] **Step 5:** Commit: `feat: character build data and derived numbers`.

---

### Task 3: Table state and actions

**Files:**
- Create: `js/state.js`, `tests/state.test.js`

**Interfaces:**
- Consumes: `CHARACTER`, `resourceMax`.
- Produces:
  - `STATE_VERSION = 1`
  - `defaultState(c) → State`. The State shape is `{stateVersion, lastSeenBuild: number | null, hp: {current, temp, max}, deathSaves: {success: [bool ×3], failure: [bool ×3]}, hitDiceSpent: [bool × hitDiceCount], uses: {[resourceId]: bool[]}, toggles: {advantage, assistedAim, inspiration}, conditions: {[name]: bool}, exhaustion, arrows, coins: {cp, sp, ep, gp, pp}, gear: {equipped: string[], pack: string[]}, notes: {name, alignment, bio, session}}`
  - `parseAmount(text) → number | null` (positive whole numbers only)
  - `reduce(state, action, c) → {state, message: string | null, undoable: boolean}`. It never mutates its input. Action types:
    - `damage`, `heal`, `temp` `{amount}`
    - `shortRest`, `longRest`
    - `toggleDeathSave {kind, index}`, `toggleHitDie {index}`, `toggleUse {id, index}`
    - `toggle {key}`, `toggleCondition {name}`
    - `exhaustion {delta}`, `arrows {delta}`
    - `setCoin {coin, value}`, `setGear {list, lines}`, `setNote {field, value}`
    - `seenBuild {version}`
  - `undoable` is true only for damage, heal, temp, shortRest and longRest.

- [ ] **Step 1: Write the failing tests** (`s0 = defaultState(c)`, `r = (s, a) => reduce(s, a, c)`):

```js
test('default state', () => { eq(s0.hp, {current: 9, temp: 0, max: 9}); eq(s0.arrows, 40); eq(s0.coins.gp, 5); eq(s0.uses.startling, [false]); });
test('parseAmount', () => eq(['7', ' 12 ', '', '0', '-3', '3.5', 'abc', '999'].map(parseAmount), [7, 12, null, null, null, null, null, 999]));
test('temp absorbs damage first', () => { const s = r(r(s0, {type: 'temp', amount: 3}).state, {type: 'damage', amount: 4}).state; eq([s.hp.temp, s.hp.current], [0, 8]); });
test('damage floors at 0', () => eq(r(s0, {type: 'damage', amount: 999}).state.hp.current, 0));
test('heal from 0 clears death saves', () => { let s = r(s0, {type: 'damage', amount: 9}).state; s = r(s, {type: 'toggleDeathSave', kind: 'failure', index: 0}).state;
  s = r(s, {type: 'heal', amount: 5}).state; eq(s.hp.current, 5); eq(s.deathSaves.failure, [false, false, false]); });
test('heal caps at max; temp keeps the larger', () => { eq(r(s0, {type: 'heal', amount: 4}).state.hp.current, 9);
  eq(r(r(s0, {type: 'temp', amount: 5}).state, {type: 'temp', amount: 2}).state.hp.temp, 5); });
test('short rest at level 1', () => { const o = r(s0, {type: 'shortRest'}); eq(o.message, 'Nothing recharges on a short rest at level 1. Spend your hit die, then use Heal.'); eq(o.undoable, true); });
test('long rest', () => { let s = r(s0, {type: 'damage', amount: 6}).state; s = r(s, {type: 'toggleUse', id: 'startling', index: 0}).state;
  s = r(s, {type: 'exhaustion', delta: 1}).state; s = r(s, {type: 'exhaustion', delta: 1}).state; s = r(s, {type: 'toggle', key: 'assistedAim'}).state;
  s = r(s, {type: 'toggle', key: 'inspiration'}).state; s = r(s, {type: 'toggleCondition', name: 'Prone'}).state;
  const o = r(s, {type: 'longRest'});
  eq(o.state.hp, {current: 9, temp: 0, max: 9}); eq(o.state.uses.startling, [false]); eq(o.state.exhaustion, 1);
  eq(o.state.toggles, {advantage: false, assistedAim: false, inspiration: true}); eq(o.state.conditions.Prone, true);
  eq(o.message, 'Long rest: HP, hit die and daily uses restored.'); });
test('counters clamp', () => { eq(r({...s0, arrows: 0}, {type: 'arrows', delta: -1}).state.arrows, 0); eq(r({...s0, exhaustion: 6}, {type: 'exhaustion', delta: 1}).state.exhaustion, 6); });
test('coins accept whole numbers only', () => { eq(r(s0, {type: 'setCoin', coin: 'gp', value: '12'}).state.coins.gp, 12); eq(r(s0, {type: 'setCoin', coin: 'gp', value: '-2'}).state.coins.gp, 5); });
test('undoable flags', () => eq(['toggle', 'arrows', 'damage'].map(t => r(s0, {type: t, key: 'advantage', delta: 1, amount: 1}).undoable), [false, false, true]));
```

- [ ] **Step 2:** Reload `/tests/`. Expected: state tests FAIL.
- [ ] **Step 3:** Implement `js/state.js`.
- [ ] **Step 4:** Reload. Expected: all PASS.
- [ ] **Step 5:** Commit: `feat: table state and actions`.

---

### Task 4: Saving, migration and backup

**Files:**
- Create: `js/storage.js`, `tests/storage.test.js`, `tests/helpers.js`

**Interfaces:**
- Consumes: `defaultState`, `STATE_VERSION`, `resourceMax`.
- Produces `tests/helpers.js`: `mem(initial?: object) → {getItem, setItem, removeItem}`, an in-memory storage fake used by Tasks 4–8.
- Produces:
  - `STORAGE_KEY = 'quickstep-sheet/state'` and `CORRUPT_KEY = 'quickstep-sheet/corrupt'`
  - `loadState(storage, c) → {state, warning: string | null}`
  - `saveState(storage, state) → boolean`
  - `migrateState(raw, c) → State`
  - `exportBackup(state, now: Date) → {filename, text}`
  - `parseBackup(text, c) → State`: throws `Error('Not a Quickstep backup file')`
- `storage` is anything with `getItem` and `setItem`; tests use an in-memory fake.
- Backup JSON is `{app: 'quickstep-sheet', exportedAt, state}`.

- [ ] **Step 1: Write the failing tests:**

```js
test('empty storage gives defaults', () => { const o = loadState(mem(), c); eq(o.state, defaultState(c)); eq(o.warning, null); });
test('round trip', () => { const m = mem(); const s = {...defaultState(c), arrows: 31}; ok(saveState(m, s)); eq(loadState(m, c).state.arrows, 31); });
test('corrupt data is kept aside', () => { const m = mem({[STORAGE_KEY]: '{oops'}); const o = loadState(m, c);
  eq(o.state, defaultState(c)); eq(o.warning, 'Saved data was unreadable, so the sheet started fresh. The old copy was kept.'); eq(m.getItem(CORRUPT_KEY), '{oops'); });
test('storage that throws', () => { const bad = {getItem() { throw new Error('x'); }, setItem() { throw new Error('x'); }};
  const o = loadState(bad, c); eq(o.warning, "This device isn't saving. Export a backup before closing."); eq(saveState(bad, o.state), false); });
test('migration on level-up', () => { const old = {...defaultState(c), hp: {current: 4, temp: 2, max: 9}, notes: {...defaultState(c).notes, session: 'met Vex'}};
  const next = {...c, hp: {...c.hp, max: 16, hitDiceCount: 2}, resources: [...c.resources, {id: 'secondWind', name: 'Second Wind', max: 2, recharge: 'short'}]};
  const s = migrateState(old, next); eq(s.hp, {current: 11, temp: 2, max: 16}); eq(s.uses.secondWind, [false, false]); eq(s.hitDiceSpent.length, 2); eq(s.notes.session, 'met Vex'); });
test('removed resources are dropped', () => eq(Object.keys(migrateState(defaultState(c), {...c, resources: [c.resources[0]]}).uses), ['startling']));
test('export file', () => { const b = exportBackup(defaultState(c), new Date('2026-10-30T12:00:00')); eq(b.filename, 'quickstep-backup-2026-10-30.json'); eq(JSON.parse(b.text).app, 'quickstep-sheet'); });
test('parseBackup rejects', () => { for (const t of ['not json', '{}', '{"app":"other"}']) { let msg = ''; try { parseBackup(t, c); } catch (e) { msg = e.message; } eq(msg, 'Not a Quickstep backup file'); } });
test('parseBackup migrates', () => { const s = parseBackup(JSON.stringify({app: 'quickstep-sheet', state: {hp: {current: 3, temp: 0, max: 9}}}), c); eq(s.hp.current, 3); eq(s.arrows, 40); });
```

- [ ] **Step 2:** Reload. Expected: storage tests FAIL.
- [ ] **Step 3:** Implement `js/storage.js`. Missing fields fill from `defaultState(c)`. When HP max changes, current moves by the same difference, clamped to 0..max. Use arrays keep spent flags for surviving ids, trimmed or extended to the new max.
- [ ] **Step 4:** Reload. Expected: all PASS.
- [ ] **Step 5:** Commit: `feat: saving, migration and backup files`.

---

### Task 5: App shell and Play tab

**Files:**
- Create: `index.html`, `css/sheet.css`, `js/render-play.js`, `js/main.js`, `js/boot.js`, `tests/render.test.js`, `tests/ui.test.js`
- Modify: `tests/helpers.js`

**Interfaces:**
- Consumes: Tasks 2–4.
- Produces:
  - `renderPlay(c, state, ui: {error, message, canUndo}) → string`
  - `mount(root, {character, storage, now}) → {getState()}`: renders the header and active tab, handles taps through `data-action` attributes, saves after every change, and keeps one undo snapshot when `undoable`
  - `js/boot.js` calls `mount(document.getElementById('app'), {character: CHARACTER, storage: localStorage, now: () => new Date()})`, wrapped in try/catch so a blocked `localStorage` falls back to an in-memory store. Service worker registration is added in Task 8.
- Play markup hooks used by tests: `[data-box="abilities"]` (its last child is the Fey Ancestry line), `#hp`, `#amount` (`inputmode="numeric"`), `[data-action="damage|heal|temp|undo"]`, `#error`, `#message`.
- Tab chips are `[data-action="tab"][data-arg="play|checks|features|gear|notes"]`. Other parameterized taps also pass their argument in `data-arg`.
- Produces in `tests/helpers.js`:
  - `mountFresh({storage}?) → {root, storage, app}`: creates a detached div and mounts with `storage ?? mem()` and `now: () => new Date('2026-10-30T12:00:00')`
  - `click(root, action, arg?)`
  - `setAmount(root, value)`
  - `type(root, selector, value)`: sets the value, then dispatches `input` and `change`
  - `text(root, selector) → string`

- [ ] **Step 1: Write the failing tests:**

```js
// render.test.js
test('play tab level 1 content', () => { const h = renderPlay(c, defaultState(c), {});
  for (const t of ['d20 +5', '1d6 + 1d4 + 3', '+1d6', '80 / 320 ft · Vex: a hit gives advantage on your next shot at it', 'Shortbow, plain (while hidden)',
    '+5 · 1d6+3', '+5 · 1d4+3', 'Darkvision 60 ft', 'Hit die 1d8 + 1', 'Move 10+ ft: attacks on you have disadvantage · not while Incapacitated or Restrained',
    'Perception +7 ●●', 'save +5 ●']) ok(h.includes(t), t);
  ok(!h.includes('Sneak Attack needs'), 'no Sneak Attack rule line'); });
test('Fey Ancestry is the last line of the abilities box', () => { const el = document.createElement('div'); el.innerHTML = renderPlay(c, defaultState(c), {});
  ok(el.querySelector('[data-box="abilities"]').lastElementChild.textContent.startsWith('Fey Ancestry')); });
test('toggles change to-hit', () => { const s = defaultState(c);
  ok(renderPlay(c, {...s, toggles: {...s.toggles, advantage: true}}, {}).includes('2d20 high +5'));
  const h = renderPlay(c, {...s, toggles: {...s.toggles, assistedAim: true}}, {}); ok(h.includes('d20 +6')); ok(h.includes('+6 · 1d6+3')); });
// ui.test.js — mount into a detached div with an in-memory storage
test('damage, undo and validation', () => { const {root} = mountFresh(); setAmount(root, '4'); click(root, 'damage'); eq(text(root, '#hp'), '5');
  click(root, 'undo'); eq(text(root, '#hp'), '9'); click(root, 'damage'); eq(text(root, '#error'), 'Enter an amount first'); });
test('state is saved after each change', () => { const {root, storage} = mountFresh(); setAmount(root, '2'); click(root, 'heal'); ok(storage.getItem(STORAGE_KEY)); });
```

- [ ] **Step 2:** Reload. Expected: render and UI tests FAIL.
- [ ] **Step 3:** Implement the shell and Play tab:
  - `index.html`: header and tab chips, plus `<div id="app">`.
  - `css/sheet.css`: light and dark tokens via `prefers-color-scheme`, the three-column Play grid, 44 px controls.
  - `render-play.js` and `main.js`: the other four tabs can render placeholders for now.
- [ ] **Step 4:** Reload `/tests/`. Expected: all PASS. Then open `/` in the browser pane at 1180 × 820 and use Damage, Heal, Temp, Undo, Advantage and Assisted Aim by hand.
- [ ] **Step 5:** Commit: `feat: app shell and Play tab`.

---

### Task 6: Checks, Features and spells, Gear, Notes tabs

**Files:**
- Create: `js/render-tabs.js`
- Modify: `js/main.js`, `css/sheet.css`, `tests/render.test.js`, `tests/ui.test.js`

**Interfaces:**
- Produces:
  - `renderHeader(c, state, activeTab) → string`: shows `state.notes.name` when set, otherwise `c.name`
  - `renderChecks(c) → string`, `renderFeatures(c) → string`
  - `renderGear(c, state) → string`: textareas `[data-gear="equipped|pack"]`, one item per line; inputs `[data-coin]`
  - `renderNotes(c, state) → string`: fields `[data-note="name|alignment|bio|session"]`, buttons `[data-action="export|import"]`, version label
- `main.js` saves text fields on every `input` event without re-rendering (keeps the caret), and saves again on `pagehide`.

- [ ] **Step 1: Write the failing tests:**

```js
test('checks tab', () => { const h = renderChecks(c); for (const t of ['Strength 8 · −1', 'Acrobatics ●●', "Thieves' tools · pick a lock or disarm a trap, DC 15",
  'Perception 17 · Insight 15 · Investigation 12', 'plus 1 of your choice (not picked yet)']) ok(h.includes(t), t); });
test('features tab', () => { const h = renderFeatures(c); for (const t of ['Wisdom · save DC 13 · spell attack +5 · no spell slots', 'cantrip · action · touch · V, S, M · concentration',
  'You or an ally you touch', 'shortbow (Vex), shortsword (Vex) · change them after a long rest', 'Next level: Fighter 1 adds Archery (+2 ranged to hit) and Second Wind']) ok(h.includes(t), t); });
test('gear tab', () => { const h = renderGear(c, defaultState(c)); for (const t of ['Component pouch', 'Rifle fund 5 / 1000 gp', 'Attunement 0 / 3', 'inputmode="numeric"']) ok(h.includes(t), t); });
test('notes tab', () => { const h = renderNotes(c, defaultState(c)); ok(h.includes('v1 · level 1')); ok(h.includes('data-action="export"')); });
test('typing a note saves immediately', () => { const {root, storage} = mountFresh(); click(root, 'tab', 'notes'); type(root, '[data-note="name"]', 'Pip');
  eq(JSON.parse(storage.getItem(STORAGE_KEY)).notes.name, 'Pip'); });
test('header shows the entered name', () => { const {root} = mountFresh(); click(root, 'tab', 'notes'); type(root, '[data-note="name"]', 'Pip'); click(root, 'tab', 'play'); ok(root.textContent.includes('Pip')); });
test('coins update the rifle fund', () => { const {root} = mountFresh(); click(root, 'tab', 'gear'); type(root, '[data-coin="gp"]', '40'); click(root, 'tab', 'gear'); ok(root.textContent.includes('Rifle fund 40 / 1000 gp')); });
```

- [ ] **Step 2:** Reload. Expected: the new tests FAIL.
- [ ] **Step 3:** Implement `render-tabs.js` and the wiring in `main.js`:
  - **Export:** uses `navigator.share({files})` when `navigator.canShare?.({files})` is true, otherwise an `<a download>`.
  - **Import:** uses a hidden `<input type="file" accept=".json,application/json">`. On failure, show the error in `#message` and leave state untouched.
- [ ] **Step 4:** Reload. Expected: all PASS. Check each tab by hand in the browser pane.
- [ ] **Step 5:** Commit: `feat: checks, features, gear and notes tabs`.

---

### Task 7: Fit every iPad, portrait and dark mode

**Files:**
- Create: `tests/fit.html`
- Modify: `css/sheet.css`

**Interfaces:**
- Produces: `tests/fit.html`, which loads `../index.html` into one iframe per size: 1024 × 744, 1080 × 810, 1133 × 744, 1180 × 820, 1366 × 1024. For each it checks that `scrollHeight <= height` and `scrollWidth <= width`, and that every `button` and `[data-action]` is at least 44 px tall. Results go to `window.__fit`, as `{size, fits, smallTargets}` per size.

- [ ] **Step 1:** Write `tests/fit.html`.
- [ ] **Step 2:** Open `/tests/fit.html`. Expected: FAIL on at least the 1024 × 744 size, or some small targets.
- [ ] **Step 3:** Tune `css/sheet.css`: a compact scale up to 1080 px wide or 760 px tall, columns stacking below 900 px wide (portrait), and roomier spacing from 1180 px wide.
- [ ] **Step 4:** Open `/tests/fit.html`. Expected: every size `fits: true` with `smallTargets: 0`. Also `resize_window` 820 × 1180 to check portrait stacks, and `colorScheme: 'dark'` to check every panel is readable.
- [ ] **Step 5:** Commit: `feat: fit every iPad landscape size, portrait stack, dark mode`.

---

### Task 8: Offline install and update notice

**Files:**
- Create: `sw.js`, `manifest.webmanifest`, `tools/make_icons.py`, `icons/icon-180.png`, `icons/icon-192.png`, `icons/icon-512.png`, `tests/sw.test.js`
- Modify: `index.html`, `js/boot.js`, `js/main.js`, `tests/ui.test.js`

**Interfaces:**
- **`sw.js`:**
  - `const CACHE = 'quickstep-v1'` and `const ASSETS = [...]`: every file under `./` the app loads, including `'./'`.
  - Install: `addAll` plus `skipWaiting`. Activate: delete other caches plus `clients.claim`.
  - Fetch: cache-first for same-origin GET, with navigations falling back to `./index.html`.
- **`manifest.webmanifest`:** `name: 'Quickstep Sniper'`, `short_name: 'Quickstep'`, `start_url` and `scope` `'./'`, `display: 'standalone'`, icons 192 and 512.
- **`index.html` adds:** the manifest link, `apple-touch-icon` (180), `apple-mobile-web-app-capable: yes`, `apple-mobile-web-app-title: Quickstep`, and viewport `width=device-width, initial-scale=1, viewport-fit=cover`.
- **`main.js` update notice:** when `state.lastSeenBuild` is non-null and differs from `c.buildVersion`, show `Updated to v${c.buildVersion}` in `#message`. Then dispatch `seenBuild`. On first launch, only set it.

- [ ] **Step 1: Write the failing tests:**

```js
test('every precached file loads', async () => { const src = await (await fetch('../sw.js')).text(); const assets = JSON.parse(src.match(/ASSETS = (\[[\s\S]*?\])/)[1].replace(/'/g, '"'));
  for (const u of ['./js/main.js', './js/boot.js', './js/character.js', './js/derive.js', './js/state.js', './js/storage.js', './js/render-play.js', './js/render-tabs.js', './css/sheet.css', './manifest.webmanifest', './icons/icon-180.png'])
    ok(assets.includes(u), u);
  for (const u of assets) eq((await fetch('../' + u.slice(2))).status, 200, u); });
test('no external requests', async () => { for (const f of ['../index.html', '../css/sheet.css', '../js/main.js', '../js/render-play.js', '../js/render-tabs.js'])
  ok(!/https?:\/\//.test(await (await fetch(f)).text()), f); });
test('update notice shows once', () => { const storage = mem({[STORAGE_KEY]: JSON.stringify({...defaultState(c), lastSeenBuild: 0})});
  const a = mountFresh({storage}); ok(text(a.root, '#message').includes('Updated to v1')); const b = mountFresh({storage}); ok(!text(b.root, '#message').includes('Updated')); });
```

- [ ] **Step 2:** Reload `/tests/`. Expected: the new tests FAIL.
- [ ] **Step 3:** Implement the service worker, manifest, head tags and update notice. `tools/make_icons.py` writes the three PNGs with stdlib `zlib` and `struct`: a simple crosshair on a dark background. Run `python sheet/tools/make_icons.py`. `boot.js` registers `./sw.js` when `'serviceWorker' in navigator`.
- [ ] **Step 4:** Reload `/tests/`. Expected: all PASS. Offline check:
  1. Open `/` and wait for `navigator.serviceWorker.ready`.
  2. `preview_stop` the server, then reload `/`. Expected: the sheet still renders with all five tabs.
  3. `preview_start` `sheet` again.
- [ ] **Step 5:** Commit: `feat: offline install, icons and update notice`.

---

### Task 9: Publish to GitHub Pages and install on the iPad

**Files:** none new.

- [ ] **Step 1:** Ask the player to create an empty **public** repo named `quickstep-sheet` on github.com (no README) and confirm.
- [ ] **Step 2:** Run these:
  - `git -C sheet remote add origin https://github.com/<username>/quickstep-sheet.git`
  - `git -C sheet branch -M main`
  - `git -C sheet push -u origin main`

  The player completes the Git Credential Manager browser sign-in. Expected: the push succeeds.
- [ ] **Step 3:** Ask the player to open the repo's Settings, then Pages, and set "Deploy from a branch" to `main` / root.
- [ ] **Step 4:** Open `https://<username>.github.io/quickstep-sheet/` and `/tests/` in the browser pane. Expected: the sheet renders, `window.__results.failed === 0`, and `/tests/fit.html` passes.
- [ ] **Step 5:** Give the player the iPad steps:
  1. Open the address in Safari.
  2. Tap Share, then Add to Home Screen, and name it "Quickstep".
  3. Open it once while online.
  4. Switch on airplane mode and reopen it. Expected: it works.
  5. Change HP, close the app and reopen it. Expected: the HP is kept.
