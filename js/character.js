// Build data for the Quickstep Sniper. Claude edits this on level-ups; the app never does.
// Every number shown on the sheet must match Characters/Quickstep Sniper.md.
export const CHARACTER = {
  buildVersion: 1,
  name: 'Quickstep Sniper',
  level: 1,
  classLine: 'Rogue 1 · level 1',
  classes: { rogue: 1, fighter: 0 },

  abilities: { str: 8, dex: 17, con: 13, int: 10, wis: 16, cha: 10 },
  saveProf: ['dex', 'int'],
  skillProf: ['acrobatics', 'sleightOfHand', 'stealth', 'investigation', 'insight', 'perception', 'survival', 'deception'],
  expertise: ['perception', 'acrobatics'],
  // Order of the "Your skills" strip on the Play tab (as approved).
  playSkills: ['perception', 'acrobatics', 'stealth', 'survival', 'insight', 'sleightOfHand', 'investigation', 'deception'],
  tools: [
    { id: 'thieves', name: "Thieves' tools", ability: 'dex', use: 'pick a lock or disarm a trap, DC 15' },
    { id: 'carto', name: "Cartographer's tools", ability: 'wis', use: 'draw a map, DC 15' },
  ],

  ac: 15,
  speed: 50,
  size: 'S',
  darkvision: 60,
  hp: { max: 9, hitDie: 8, hitDiceCount: 1 },
  rangedBonus: 0,
  spellcasting: { ability: 'wis', label: 'Magic Initiate (Druid)' },

  attacks: [
    {
      id: 'shot', name: 'Ferocious Strike, shortbow', kind: 'ranged', ability: 'dex', die: '1d6',
      cantripDie: 'd4', sneak: true, range: '80 / 320 ft', note: 'Vex: a hit gives advantage on your next shot at it', main: true,
    },
    { id: 'plain', name: 'Shortbow, plain (while hidden)', kind: 'ranged', ability: 'dex', die: '1d6' },
    { id: 'shortsword', name: 'Shortsword, Vex', kind: 'melee', ability: 'dex', die: '1d6' },
    { id: 'dagger', name: 'Dagger, thrown 20/60', kind: 'thrown', ability: 'dex', die: '1d4' },
  ],

  resources: [
    {
      id: 'startling', name: 'Startling Speed', max: 'level', recharge: 'long',
      note: 'Move 10+ ft: attacks on you have disadvantage · not while Incapacitated or Restrained',
    },
    { id: 'assistedAim', name: 'Assisted Aim', max: 1, recharge: 'long' },
  ],

  conditions: ['Concentrating', 'Prone', 'Grappled', 'Restrained', 'Poisoned', 'Frightened'],

  spells: [
    { name: 'Ferocious Strike', meta: 'cantrip · action · V, S', text: 'One weapon attack, +1d4 damage on a hit' },
    {
      name: "Stalker's Eye", meta: 'cantrip · action · touch · V, S, M · concentration',
      text: 'You or an ally you touch: next attack within 1 minute has advantage · M: lens, in your component pouch',
    },
    {
      name: 'Assisted Aim', meta: 'level 1 · action · 30 ft · 1 minute',
      text: 'Up to 3 creatures: +1 to ranged attacks and double range · 1 free cast per long rest',
    },
  ],
  features: [
    { name: 'Quickstep', text: 'Small · speed 50 · Darkvision 60 ft · Fey Ancestry · Startling Speed (see Play)' },
    { name: 'Rogue 1', text: "Sneak Attack 1d6 · Expertise (Perception, Acrobatics) · Thieves' Cant" },
    { name: 'Weapon Mastery', text: 'shortbow (Vex), shortsword (Vex) · change them after a long rest' },
    { name: 'Guide', text: 'Magic Initiate (Druid)' },
  ],
  feyAncestry: "Fey Ancestry: advantage on saves against being Charmed · magic can't put you to sleep",
  languages: "Common, Elvish, Umbral, Thieves' Cant, plus 1 of your choice (not picked yet)",
  armorWeapons: 'Armor: light · Weapons: simple, martial with Finesse or Light',
  nextLevel: 'Next level: Fighter 1 adds Archery (+2 ranged to hit) and Second Wind',

  gearDefaults: {
    equipped: ['Studded leather armor (AC 12 + Dex)', 'Shortbow and quiver', 'Shortsword', 'Dagger'],
    pack: [
      'Component pouch',
      "Thieves' tools",
      "Explorer's pack: backpack, bedroll, 2 flasks of oil, 10 days of rations, rope, tinderbox, 10 torches, waterskin",
    ],
  },
  coinDefaults: { cp: 0, sp: 0, ep: 0, gp: 5, pp: 0 },
  arrowsDefault: 40,
  attunementSlots: 3,
  rifleGoal: 1000,
};
