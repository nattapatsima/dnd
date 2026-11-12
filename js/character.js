// Build data for the Phantom Sniper. Claude edits this on level-ups; the app never does.
// Every number shown on the sheet must match Characters/Phantom Sniper.md.
export const CHARACTER = {
  buildVersion: 3,
  name: 'Phantom Sniper',
  level: 1,
  classLine: 'Rogue 1 · level 1',
  classes: { rogue: 1 },

  abilities: { str: 8, dex: 17, con: 13, int: 10, wis: 16, cha: 10 },
  saveProf: ['dex', 'int'],
  skillProf: ['perception', 'acrobatics', 'stealth', 'insight', 'investigation', 'arcana', 'nature'],
  expertise: ['perception', 'acrobatics'],
  // Order of the "Your skills" strip on the Play tab.
  playSkills: ['perception', 'acrobatics', 'stealth', 'insight', 'investigation', 'arcana', 'nature'],
  tools: [
    { id: 'thieves', name: "Thieves' tools", ability: 'dex', use: 'pick a lock or disarm a trap, DC 15' },
    { id: 'woodcarver', name: "Woodcarver's tools", ability: 'dex', use: 'carve a pattern in wood, DC 10' },
  ],

  ac: 15,
  speed: 30,
  size: 'M',
  darkvision: 60,
  // One entry per die type.
  hp: { max: 9, hitDice: [{ die: 8, count: 1 }] },
  rangedBonus: 0,
  spellcasting: { ability: 'wis', label: 'Magic Initiate (Druid)' },

  attacks: [
    {
      id: 'shot', name: 'Hunting Rifle', kind: 'ranged', ability: 'dex', die: '2d10',
      sneak: true, range: [80, 240], note: 'Slow: a hit cuts its speed by 10 ft', main: true,
    },
    { id: 'shortbow', name: 'Shortbow, Vex', kind: 'ranged', ability: 'dex', die: '1d6' },
    { id: 'dagger', name: 'Dagger, thrown 20/60', kind: 'thrown', ability: 'dex', die: '1d4' },
  ],
  // Hunting Rifle: Reload 5 shots, then reload as an action or Bonus Action.
  rifle: { shots: 5 },
  // Spare bullets, not counting the 5 in the rifle (20 bought).
  bulletsDefault: 15,

  resources: [
    {
      id: 'ravenQueen', name: 'Raven Queen teleport', max: 'prof', recharge: 'long',
      note: 'Bonus Action: teleport 30 ft to a space you can see',
    },
    { id: 'assistedAim', name: 'Assisted Aim', max: 1, recharge: 'long' },
  ],
  longRestNote: 'Trance: pick the Hunting Rifle again.',

  spells: [
    {
      name: 'Assisted Aim', meta: 'level 1 · action · 30 ft · 1 minute',
      text: 'Up to 3 creatures: +1 to ranged attacks and double range · 1 free cast per long rest',
    },
  ],
  features: [
    { name: 'Shadar-Kai', text: 'Medium · speed 30 · Darkvision 60 ft · Fey Ancestry · Necrotic resistance · Keen Senses (Perception) · counts as an elf' },
    { name: 'Trance', text: 'Long rest in 4 hours · then gain 2 weapon or tool proficiencies until your next long rest: Hunting Rifle + 1 of your choice' },
    { name: 'Blessing of the Raven Queen', text: 'Bonus Action: teleport 30 ft to a space you can see · uses = proficiency bonus per long rest (see Play) · from level 3 also resistance to all damage until your next turn' },
    { name: 'Rogue 1', text: "Sneak Attack 1d6 · Expertise (Perception, Acrobatics) · Thieves' Cant" },
    { name: 'Weapon Mastery', text: 'Hunting Rifle (Slow), shortbow (Vex) · change them after a long rest' },
    { name: 'One of the Taken', text: "Magic Initiate (Druid) · Arcana, Nature · Woodcarver's tools" },
  ],
  // Last line of the abilities box on the Play tab.
  traitsLine: 'Fey Ancestry: advantage vs Charmed · resistant to Necrotic · Trance: re-pick the Hunting Rifle',
  languages: "Common, Elvish, Thieves' Cant, plus 2 of your choice (not picked yet)",
  armorWeapons: 'Armor: light · Weapons: simple, martial with Finesse or Light, Hunting Rifle (from Trance)',
  nextLevel: 'Next level: Rogue 2 adds Cunning Action (Dash, Disengage or Hide as a Bonus Action)',

  gearDefaults: {
    equipped: ['Hunting Rifle (5 shots, reload as an action or Bonus Action)', 'Studded leather armor (AC 12 + Dex)', 'Shortbow, quiver and 20 arrows', 'Dagger'],
    pack: [
      "Thieves' tools",
      "Explorer's pack: backpack, bedroll, 2 flasks of oil, 10 days of rations, rope, tinderbox, 10 torches, waterskin",
    ],
  },
  coinDefaults: { cp: 0, sp: 0, ep: 0, gp: 35, pp: 0 },
  // A device still holding the untouched Quickstep defaults gets the new ones instead.
  legacyDefaults: [
    {
      gear: {
        equipped: ['Studded leather armor (AC 12 + Dex)', 'Shortbow and quiver', 'Shortsword', 'Dagger'],
        pack: [
          'Component pouch',
          "Thieves' tools",
          "Explorer's pack: backpack, bedroll, 2 flasks of oil, 10 days of rations, rope, tinderbox, 10 torches, waterskin",
        ],
      },
      coins: { cp: 0, sp: 0, ep: 0, gp: 5, pp: 0 },
    },
  ],
  attunementSlots: 3,
};
