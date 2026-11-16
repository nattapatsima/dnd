// The Autognome Bard's page (/dnd/bard/). Shares the app; saves under its own name.
import { BARD } from '../js/characters/bard.js';
import { start } from '../js/start.js';

start(BARD, { swUrl: '../sw.js' });
