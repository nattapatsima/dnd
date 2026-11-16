// Dyme's page (/dnd/dyme/). Shares the app with the Phantom Sniper; saves under its own name.
import { DYME } from '../js/characters/dyme.js';
import { start } from '../js/start.js';

start(DYME, { swUrl: '../sw.js' });
