// Build data for Dyme, the Dhampir Rogue (Thief). Claude edits this on level-ups; the app never does.
// Every number shown on the sheet must match Characters/Dyme.md.
export const DYME = {
  buildVersion: 2,
  id: 'dyme',
  // Saves, backups and the storage probe live under this name. Never change it: saved data would be lost.
  storageId: 'dyme-sheet',
  label: 'Dyme',
  name: 'Dyme',
  level: 4,
  classLine: 'Rogue 4 (Thief) · level 4',
  classes: { rogue: 4 },

  abilities: { str: 8, dex: 18, con: 14, int: 10, wis: 16, cha: 8 },
  saveProf: ['dex', 'int'],
  skillProf: ['acrobatics', 'sleightOfHand', 'stealth', 'insight', 'perception', 'survival'],
  expertise: ['acrobatics', 'sleightOfHand'],
  // Order of the "Your skills" strip on the Play tab.
  playSkills: ['acrobatics', 'sleightOfHand', 'stealth', 'perception', 'insight', 'survival'],
  tools: [
    { id: 'thieves', name: "Thieves' tools", ability: 'dex', use: 'pick a lock or disarm a trap, DC 15' },
    { id: 'alchemist', name: "Alchemist's supplies", ability: 'int', use: 'identify a substance (DC 15), or start a fire (DC 15)' },
  ],

  ac: 15,
  speed: 30,
  climb: 30,
  size: 'S',
  darkvision: 0,
  // Fixed average: 8 + 2 at level 1, then 5 + 2 per level.
  hp: { max: 31, hitDice: [{ die: 8, count: 4 }] },
  rangedBonus: 0,
  // Mage Hand needs no save or attack roll, so the sheet shows no DC (and nothing to mix up with Ominous Will's DC 15).
  spellcasting: { ability: 'wis', label: 'Living Shadow (Mage Hand)', summary: 'Wisdom · no components · no save or attack roll' },

  attacks: [
    {
      id: 'shot', name: 'Whip', kind: 'melee', ability: 'dex', die: '1d4', damageType: 'slashing', sneak: true, main: true,
      // Whip reach 10 + Reach Attack 5; Reach Attack doesn't apply to Opportunity Attacks.
      reach: 15, oaReach: 10,
      note: 'Slow: a hit cuts its speed by 10 ft',
    },
    { id: 'claws', name: 'Hand Claws, Vex', reach: 10, kind: 'melee', ability: 'dex', die: '1d4' },
    // The Light extra attack: no ability modifier on its damage (it's positive).
    { id: 'dagger', name: 'Dagger, Bonus Action', reach: 10, kind: 'melee', ability: 'dex', die: '1d4', noModDamage: true },
    // DM ruling: Dex to hit as well as damage.
    { id: 'natural', name: 'Natural Attack, fangs', reach: 10, kind: 'melee', ability: 'dex', die: '1d6' },
    { id: 'shortbow', name: 'Shortbow, 80/320', kind: 'ranged', ability: 'dex', die: '1d6' },
  ],

  resources: [
    { id: 'burst', name: 'Burst of Speed', max: 'prof', recharge: 'long' },
    { id: 'wallWalker', name: 'Wall Walker Dash', max: 'prof', recharge: 'long' },
    { id: 'lucky', name: 'Lucky', max: 'prof', recharge: 'long' },
    { id: 'lengthened', name: 'Lengthened Strike', max: 'prof', recharge: 'long' },
    { id: 'ethereal', name: 'Ethereal Fade', max: 1, recharge: 'long' },
  ],
  // Effect chips on the Play tab: while on, they change the numbers shown. They never spend a use.
  effects: {
    steadyAim: true, // Advantage on the attack, Speed 0
    lengthened: { reach: 10 }, // Lengthened Strike: +10 ft melee reach (not Opportunity Attacks)
    burst: { speed: 30 }, // Burst of Speed: +30 ft Speed (and Climb), no Opportunity Attacks
  },
  // One line under the daily uses on the Play tab.
  playNote: 'Natural 1: Lucky reroll · Ominous Will Wis save DC 15',

  spells: [
    {
      name: 'Mage Hand', meta: 'cantrip · action · 30 ft · no components · Living Shadow',
      text: 'A spectral hand manipulates objects up to 10 lb for 1 minute',
    },
  ],
  features: [
    { name: 'Burst of Speed ×2', text: 'On your turn: +30 ft speed until the turn ends · Furious Speed: no Opportunity Attacks that turn · 2 per long rest' },
    { name: 'Climber ×2', text: 'Climb speed 30 · Wall Walker: walls and ceilings hands-free; while climbing, Dash as a Bonus Action 2 per long rest' },
    { name: 'Lucky', text: 'Roll a 1 on a D20 Test: reroll, use the new roll · 2 per long rest' },
    { name: 'Reach Attack', text: '+5 ft melee reach, not on Opportunity Attacks' },
    { name: 'Ethereal Fade', text: 'Magic action: into the Ethereal Plane for 1 minute; end early as a Bonus Action · 1 per long rest' },
    { name: 'Natural Attack', text: 'Unarmed Strikes deal 1d6 + Dex (fangs: piercing)' },
    { name: 'Rogue 4', text: "Sneak Attack 2d6 · Expertise (Acrobatics, Sleight of Hand) · Thieves' Cant · Cunning Action · Steady Aim" },
    { name: 'Weapon Mastery', text: 'Whip (Slow), Hand Claws (Vex) · change them after a long rest' },
    { name: 'Thief: Fast Hands', text: 'Bonus Action: Sleight of Hand (lock, trap, pocket), Utilize, or use a magic item' },
    { name: 'Thief: Second-Story Work', text: 'Climb speed equals speed (already have it) · jump distance uses Dex' },
    { name: 'Living Shadow (Mist Wanderer)', text: 'Mage Hand with no components (Wis) · Lengthened Strike: +10 ft reach on one melee attack roll, 2 per long rest' },
    { name: 'Ominous Will', text: 'Right after a natural 1 on a D20 Test: Wis save DC 15 or Incapacitated until your next turn, then roll 1d8 (1 move randomly, 2–6 attack a random creature in reach, 7–8 Prone and turn ends)' },
    { name: 'Scourge Master (feat)', text: '+1 Dex · after a whip hit, Bonus Action disarm: your Str or Dex check vs its Str · pull an item under 1 lb within reach' },
  ],
  bonusActions: [
    { name: 'Steady Aim', text: "you haven't moved: Advantage, so Sneak Attack" },
    { name: 'Light attack (Dagger)', text: 'after attacking with Hand Claws: 1d4, no modifier' },
    { name: 'Scourge Master disarm', text: 'after a whip hit' },
    { name: 'Fast Hands', text: 'locks, traps, pockets, Utilize, magic items' },
    { name: 'Cunning Action', text: 'Dash, Disengage or Hide' },
    { name: 'Wall Walker Dash', text: 'while climbing (2 per long rest)' },
  ],
  dmRulings: [
    'Hand Claws: custom weapon (3 gp, 1d4 slashing, Finesse, Light, Vex), not in any published source',
    "Natural Attack: Dex to hit as well as damage (GH PG'24 p41 names Str or Dex only for damage)",
    'Draining Attack: not allowed',
  ],
  // Last line of the abilities box on the Play tab.
  traitsLine: 'Wall Walker: walls and ceilings hands-free · Reach Attack +5 ft (not on Opportunity Attacks)',
  languages: "Common, Abyssal, Thieves' Cant, plus 2 of your choice (not picked yet)",
  armorWeapons: 'Armor: light · Weapons: simple, martial with Finesse or Light',
  nextLevel: 'Next level: Rogue 5 adds Sneak Attack 3d6, Cunning Strike and Uncanny Dodge',

  gearDefaults: {
    equipped: ['Leather armor (AC 11 + Dex)', 'Whip', 'Hand Claws', '2 daggers', 'Shortbow, quiver and 20 arrows'],
    pack: [
      'Shortsword',
      "Thieves' tools",
      "Alchemist's supplies",
      "Burglar's pack",
      'Lamp, oil (5 flasks), pouch, rope, tinderbox',
      "Traveler's clothes",
    ],
  },
  coinDefaults: { cp: 0, sp: 0, ep: 0, gp: 33, pp: 0 },
  legacyDefaults: [],
  attunementSlots: 3,
};
