# Quickstep Sniper — iPad table sheet: design

Date: 2026-10-30 · Status: ready for the player's approval

## 1. What this is and why

A playable character sheet for one D&D 2024 character, the **Quickstep Sniper**, used on an **iPad at an in-person table with real dice**. It shows the numbers to roll, and it tracks what changes during play: HP, uses, conditions, arrows, coins, notes.

The player chose this over paper and over D&D Beyond or VTT sheets for three reasons. The build uses homebrew (Quickstep, Misfortune Bringer, Heliana's cantrips and Rifle) that those tools don't have. The table often has no reliable internet. And they want a sheet trimmed to exactly what this character needs.

The player is an **experienced player and DM**. The sheet holds facts about *this character* only, never explanations of core rules.

Source of the character's build: `Characters/Quickstep Sniper.md` (same DnD folder).

## 2. Goals

- A **Play tab** that shows everything needed for a turn on one landscape screen, with no scrolling.
- Five tabs in total: **Play, Checks, Features and spells, Gear, Notes.**
- Tap-to-track state:
  - HP with damage, heal and temp
  - death saves and hit dice
  - daily uses and Heroic Inspiration
  - conditions and exhaustion
  - arrows, coins, gear lists and notes
  - Short and Long rest buttons that reset the right things
- The to-hit number reacts to the Advantage and Assisted Aim toggles.
- Works **fully offline** once installed on the iPad's Home Screen.
- Table state survives closing the app and restarting the iPad, with a manual backup file as a safety net.
- **Level-up friendly.** Claude updates the character's build data and republishes. The iPad picks up the update the next time it's online, without losing table state.

## 3. Non-goals

- Dice roller (real dice are used).
- Rules reference, spell compendium, monster info, or any core-rule text.
- A general character builder or a multi-character app.
- Syncing between devices, a DM view, or multiplayer.
- Level-up logic inside the app (Claude edits the build data instead).

## 4. Anti-goals (failure even if it "works")

- **Losing table state** on update, reload, or a mis-tap.
- Needing internet at the table.
- Confirmation pop-ups or slow flows for common taps mid-combat.
- Clutter: rule reminders or information shown twice.
- Small touch targets, or anything that needs hover.

## 5. Constraints

- **Device:** iPad, Safari, installed with "Add to Home Screen" (runs full-screen). Landscape is the main orientation. The model isn't known, so the Play tab must fit **every current iPad in landscape**: at least 1024 × 744 CSS px, the smallest width (9.7"/10.2") and height (iPad mini). It should use the extra room on larger models.
- **Offline:** every file the app needs is cached on the device after the first online visit. No CDNs, web fonts or external requests; use the system font.
- **No installs, no build step:** plain HTML, CSS and JavaScript files. Node isn't installed on the PC. Python is available, for a local preview server.
- **Hosting:** GitHub Pages, from a **public** repo. The player accepted that the sheet is publicly reachable. Nothing personal goes in it beyond the GitHub username in the address. No email addresses and no local file paths.
- **Content rights:** feature and spell text is short summaries in our own words. Never copy book text, since the site is public.
- **Touch:** targets at least 44 pt. Number entry uses the numeric keypad.

## 6. Approaches considered

| Approach | Trade-off | Outcome |
|---|---|---|
| Private claude.ai page with saved state | Needs no setup and syncs, but needs internet to open | Not picked (table often has no signal) |
| **Offline web app on GitHub Pages** | One-time hosting setup; state lives only on the iPad | **Picked by the player** |
| Fillable PDF | Fully offline and simple, but no smart behavior | Backup or print only |
| D&D Beyond, Foundry, Roll20 | Polished, but all the homebrew must be entered by hand; built for online play | Ruled out early |

Hosting options inside the picked approach:
- **GitHub Pages:** public, one account, and Claude can push updates. **Picked.**
- Netlify or Cloudflare: private, but each update needs either manual uploads or a second account.

## 7. Approved layout (decided by the player)

Mockups were reviewed in chat and the 5-tab version below was **approved**. Two final edits:
- No Sneak Attack rule line on the shot card.
- Fey Ancestry sits at the bottom of the ability and saves box.

Numbers are for **level 1**.

### Header (all tabs)
- Character name: "Quickstep Sniper" until a name is entered in Notes.
- Class and level line: "Rogue 1 · level 1".
- Tab chips: Play · Checks · Features and spells · Gear · Notes.

### Play tab: three columns, then two full-width boxes

**Column 1: survive**
- **Hit points:**
  - current / max (9 / 9) and temp HP
  - an *Amount* number field with **Damage**, **Heal** and **Temp** buttons
  - an inline error if the amount is empty or invalid
- **Death saves:** 3 success and 3 failure toggles.
- **Defense grid:** AC 15 · Init +3 · Speed 50 · Prof +2 · Size S · Passive 17.
- Line: "Darkvision 60 ft" and "Hit die 1d8 + 1", with one toggle per hit die (1 at level 1).

**Column 2: attack**
- **Shot card, "Ferocious Strike, shortbow":**
  - To hit **d20 +5**. Shows "2d20 high +5" with Advantage on, and +1 with Assisted Aim on.
  - Damage **1d6 + 1d4 + 3**
  - Sneak Attack **+1d6**
  - "80 / 320 ft · Vex: a hit gives advantage on your next shot at it"
  - toggles: **Advantage**, **Assisted Aim**
- **Other attacks:**
  - Shortbow, plain (while hidden): +5 · 1d6+3
  - Shortsword, Vex: +5 · 1d6+3
  - Dagger, thrown 20/60: +5 · 1d4+3
- **Arrows** counter with − / +, starting at 40.

**Column 3: status**
- **Daily uses:**
  - **Startling Speed:** uses = character level (1), with the line "Move 10+ ft: attacks on you have disadvantage · not while Incapacitated or Restrained"
  - **Assisted Aim:** 1 per long rest
  - **Inspiration** toggle
- **Status:**
  - condition toggles: Concentrating, Prone, Grappled, Restrained, Poisoned, Frightened
  - **Exhaustion** 0–6 with − / +, plus a line showing "d20 tests −2×level · speed −5×level ft" ("No penalty" at 0, "Dead" at 6)
- **Short rest** and **Long rest** buttons, with a one-line message area under them.

**Full-width box: abilities and saves**
- Six cells: score, modifier, save, with ● on proficient saves:
  - Str 8 −1 save −1
  - Dex 17 +3 save +5 ●
  - Con 13 +1 save +1
  - Int 10 +0 save +2 ●
  - Wis 16 +3 save +3
  - Cha 10 +0 save +0
- Last line *inside the box*: "Fey Ancestry: advantage on saves against being Charmed · magic can't put you to sleep".

**Full-width box: your skills**
- "● proficient, ●● expertise · full list on Checks"
- Perception +7 ●● · Acrobatics +7 ●● · Stealth +5 · Survival +5 · Insight +5 · Sleight of Hand +5 · Investigation +2 · Deception +2

### Checks tab
- **Six ability blocks** (header "Strength 8 · −1" and so on), each listing its save and skills, with ● and ●● marks:
  - Str: Athletics −1
  - Dex: Acrobatics +7 ●●, Sleight of Hand +5 ●, Stealth +5 ●
  - Con: save only
  - Int: Arcana +0, History +0, Investigation +2 ●, Nature +0, Religion +0
  - Wis: Animal Handling +3, Insight +5 ●, Medicine +3, Perception +7 ●●, Survival +5 ●
  - Cha: Deception +2 ●, Intimidation +0, Performance +0, Persuasion +0
- **Tool checks:**
  - Thieves' tools +5 (pick a lock or disarm a trap, DC 15)
  - Cartographer's tools +5 (draw a map, DC 15)
- **Passive scores:** Perception 17 · Insight 15 · Investigation 12.
- **Proficiencies and languages:**
  - Armor: light · Weapons: simple, martial with Finesse or Light
  - Common, Elvish, Umbral, Thieves' Cant, plus 1 of your choice (not picked yet)

### Features and spells tab
- **Spellcasting, Magic Initiate (Druid):** Wisdom · save DC 13 · spell attack +5 · no spell slots.
- **Spells:**
  - **Ferocious Strike:** cantrip · action · V, S. One weapon attack, +1d4 damage on a hit.
  - **Stalker's Eye:** cantrip · action · touch · V, S, M · concentration. You or an ally you touch: next attack within 1 minute has advantage. M: lens, in your component pouch.
  - **Assisted Aim:** level 1 · action · 30 ft · 1 minute. Up to 3 creatures get +1 to ranged attacks and double range. 1 free cast per long rest.
- **Features:**
  - **Quickstep:** Small · speed 50 · Darkvision 60 ft · Fey Ancestry · Startling Speed (see Play)
  - **Rogue 1:** Sneak Attack 1d6 · Expertise (Perception, Acrobatics) · Thieves' Cant
  - **Weapon Mastery:** shortbow (Vex), shortsword (Vex) · change them after a long rest
  - **Guide:** Magic Initiate (Druid)
- Footer line: "Next level: Fighter 1 adds Archery (+2 ranged to hit) and Second Wind".

### Gear tab
- **Equipped:** Studded leather armor (AC 12 + Dex) · Shortbow and quiver · Shortsword · Dagger.
- **Pack:** Component pouch · Thieves' tools · Explorer's pack (backpack, bedroll, 2 flasks of oil, 10 days of rations, rope, tinderbox, 10 torches, waterskin).
- **Coins:** CP 0 · SP 0 · EP 0 · GP 5 · PP 0.
- **Attunement** 0 / 3 · **Rifle fund**: GP / 1000 gp, worked out from GP.

### Notes tab
- Character name · Alignment · Appearance, personality and backstory · Session notes.

## 8. Behavior

- **Damage:** temp HP absorbs damage first, then HP, never below 0.
- **Heal:** HP rises, never above max. Going from 0 to above 0 clears death saves.
- **Temp:** temp HP becomes the larger of its current value and the amount entered. Temp HP doesn't stack.
- **Short rest:**
  - recharges short-rest uses (none at level 1)
  - shows "Nothing recharges on a short rest at level 1. Spend your hit die, then use Heal." when nothing recharged
- **Long rest:**
  - HP to max, temp 0
  - all hit dice and all daily uses back
  - death saves cleared
  - exhaustion −1
  - Advantage and Assisted Aim toggles off
  - conditions are left as they are
- **Toggles:**
  - Advantage changes only the shot card's to-hit display.
  - Assisted Aim adds +1 to every shortbow line, but not the thrown dagger.
  - Assisted Aim's daily-use dot and its toggle are separate controls, as approved.
- **Undo:** an **Undo** button appears in the message area after Damage, Heal, Temp, Short rest or Long rest, and reverts that one action.
- **Autosave:** every change saves on the device immediately.
- **Backup:** **Export** (saves a backup file through the iPad share sheet) and **Import** (restores from a file), at the bottom of the Notes tab, beside a small version label ("v1 · level 1").
- **Header name:** comes from the Notes name field once it's filled in.
- **Theme:** follows the iPad's light or dark setting.
- **Portrait:** columns stack and the Play tab may scroll. Landscape is the target.

## 9. Data: build vs table state

There are two kinds of data with clear owners.

- **Build data** (a character data file in the app, edited only by Claude):
  - abilities, proficiencies and expertise
  - attacks, spells, features
  - resource maximums and how each one recharges
  - HP max and hit dice
  - starting values for first launch
- **Table state** (on the iPad, edited only by the player):
  - current and temp HP, death saves, hit dice spent, uses spent
  - toggles, conditions, exhaustion
  - arrows, coins, gear lists, notes

**An update never overwrites table state.** When build data changes a maximum (for example, HP max at level 2), current HP rises by the same amount, new resources start full, and removed ones disappear.

**Gear lists and coins are table state.** They're editable on the iPad, one item per line, because loot happens at the table. Claude doesn't push gear changes unless asked.

Every number on screen must match `Characters/Quickstep Sniper.md`. When the character changes, Claude updates both.

## 10. Growth to plan room for (not built in v1)

The layout and data model must take these later additions without a redesign. Each gets built when the character reaches it.

- **Level 2 (Fighter 1):**
  - Second Wind: 2 uses, 1 back on a short rest
  - Archery: +2 to every ranged to-hit
  - medium armor and shields
  - Fighter Weapon Mastery
- **Level 3:** Cunning Action.
- **Level 4 (Rogue 3, Misfortune Bringer):**
  - Evil Eye: a cursed-target tracker with a 1-minute (10-round) timer, 60 ft
  - Jinx Points: 4, back on a short rest
  - Misfortunes: Doomed (1), Clumsy (3), and Debilitated (1) as a swap option
  - Steady Aim and a bonus-action guide panel
  - the heavy crossbow becomes the shot: +7 · 1d10 + 1d4 + 3 · 100/400 · Push
  - Sneak Attack 2d6
- **Level 5:** Sharpshooter; Ferocious Strike 2d4; Stalker's Eye crits on 19–20.
- **Level 6:** Uncanny Dodge, plus a reaction panel (Clumsy, Doomed, Uncanny Dodge).
- **Later:** Rifle (1d12 · 120/480 · Reload 6, so it needs a shots-left counter).

The earlier level 4 Layout A mockup shows how the Play tab should look at level 4: a bonus-action panel with the curse tracker in column 2, and a reaction panel plus Jinx Points in column 3. **v1 ships level 1 only.** Levels 2–3 should be data-only changes. The level 4 panels are a follow-up build before the character reaches level 4.

## 11. Hosting, install and updates

- **Repo:** a public GitHub repo (working name `quickstep-sheet`) holding this `sheet` folder, served by GitHub Pages from the main branch.
  - Address: `https://<github-username>.github.io/quickstep-sheet/`
- **One-time setup:**
  1. The player (who already has a GitHub account) creates the empty public repo on github.com and shares its address.
  2. Claude pushes. Git Credential Manager is already installed and opens a browser sign-in; the player signs in, and Claude never handles credentials.
  3. The player turns on Pages in the repo settings.
  - No software gets installed.
- **Install on the iPad:** open the address in Safari, then Share, then Add to Home Screen, then open it once while online so it caches. Home Screen name: "Quickstep".
- **Updates:**
  - On launch while online, the app checks for a new version and caches it in the background.
  - The update applies on the next launch and shows "Updated to vX" once.
  - Offline launches always use the cached version.
  - The stored table state carries a version number, so later updates can migrate it safely.
- **Preview before publishing:** Python's built-in web server on the PC, viewed in Claude's browser pane at iPad landscape size.

## 12. Acceptance checks

1. After one online visit and Add to Home Screen, the app opens in **airplane mode** with all five tabs working.
2. HP, uses, arrows, coins, gear and notes **survive** closing the app and restarting the iPad.
3. Publishing a new version **keeps all table state**.
4. The **Play tab fits one landscape screen** with no scrolling at 1024 × 744 CSS px and every larger iPad landscape size (for example 1080 × 810, 1133 × 744, 1180 × 820, 1366 × 1024).
5. Every number listed in section 7 matches what the app shows at level 1.
6. Long rest, Short rest, Damage (with temp HP), Heal (from 0), Temp, Undo, Export and Import behave as section 8 says.
7. No network requests to anything other than the app's own address.

## 13. Calls Claude made (the player can override)

1. Gear lists, coins and notes are edited on the iPad, and Claude's updates never overwrite them.
2. One-step Undo after Damage, Heal, Temp and rests, instead of confirmation pop-ups.
3. Export/Import backup and the version label sit at the bottom of Notes.
4. Death saves clear automatically when HP goes above 0, and on a long rest.
5. Long rest turns off the Advantage and Assisted Aim toggles and leaves conditions alone.
6. Assisted Aim's +1 applies to every shortbow line. Advantage only changes the main shot's display.
7. The header shows the name from Notes once it's entered.
8. Follows the iPad's light/dark setting. Landscape is the target; portrait stacks and scrolls.
9. Repo name `quickstep-sheet`, Home Screen name "Quickstep", app files in the DnD `sheet` folder.
10. v1 covers level 1. The level 4 Misfortune panels are built later.
11. With no iPad model given, the layout targets every current iPad in landscape (from iPad mini up). Tell me your model if you want it tuned.

## 14. Left to the builder

- File layout, and how derived numbers are computed (as long as every check in section 12 passes).
- Storage method on the device.
- Service worker caching details.
- Icon design and how it's generated.
- Exact styling, within the approved layout and the constraints in section 5.

## 15. Player answers

- **GitHub account:** yes (2026-10-30).
- **iPad model and orientation:** not given. Covered by call 11 (fit every current iPad in landscape).
