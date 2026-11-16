// The Phantom Sniper page (/dnd/). Dyme's page has its own entry in dyme/boot.js.
import { CHARACTER } from './character.js';
import { start } from './start.js';

start(CHARACTER, { swUrl: './sw.js' });
