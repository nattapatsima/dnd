# 1. One app, one Character page per character

Date: 2026-11-16
Status: accepted. Supersedes the "not a multi-character app" non-goal in `docs/superpowers/specs/2026-10-30-ipad-sheet-design.md`.

## Context
The sheet was built for one character, the Phantom Sniper, and its design doc ruled out a multi-character app. The player now has a second character, Dyme, and wants the same kind of sheet for it. A copy of the app per character would drift apart: every fix and layout change would have to be made twice.

## Decision
Keep one shared app. Each character gets:
- a Build file;
- its own page and Home Screen app (the sniper at `/dnd/`, Dyme at `/dnd/dyme/`);
- its own storage name for Table state and backups.

Parts only one Build needs (the sniper's rifle ammo, Shadow Bind and Trance) appear only when that Build has them. One service worker caches every Character page, and an offline visit falls back to the visited page's own shell.

The sniper keeps the storage name `quickstep-sheet`, so its saved Table state carries over unchanged.

## Consequences
- **Fixes reach every character at once.** Each new Character page adds a page folder, a Build file, the page's entries in the service worker, and an entry in the fit check's page list.
- **Storage names can never change.** Renaming one strands that character's saved data on every device.
- **Backups belong to one character.** A backup restores only into the character that made it.
- **Shared code needs care.** A layout change must pass the fit check on every Character page, because each Build fills the Play tab differently.
