// Build data for the Autognome Bard (College of Creation). Claude edits this on level-ups; the app never does.
// Every number shown on the sheet must match Characters/Autognome Bard.md.
export const BARD = {
  buildVersion: 1,
  id: 'bard',
  // Saves, backups and the storage probe live under this name. Never change it: saved data would be lost.
  storageId: 'autognome-sheet',
  label: 'Autognome Bard',
  name: 'Autognome Bard',
  level: 4,
  classLine: 'Bard 4 (College of Creation) · level 4',
  classes: { bard: 4 },

  abilities: { str: 8, dex: 14, con: 14, int: 10, wis: 11, cha: 18 },
  saveProf: ['dex', 'cha'],
  skillProf: ['acrobatics', 'insight', 'investigation', 'performance', 'persuasion'],
  expertise: ['performance', 'persuasion'],
  // Bard 2: half proficiency on skill checks without proficiency (2024: skills only, not initiative).
  jackOfAllTrades: true,
  // Order of the "Your skills" strip on the Play tab.
  playSkills: ['performance', 'persuasion', 'deception', 'acrobatics', 'insight', 'investigation', 'perception'],
  tools: [
    { id: 'disguise', name: 'Disguise kit', ability: 'cha', use: 'apply makeup (DC 10)' },
    { id: 'tinker', name: "Tinker's tools", ability: 'dex', use: 'assemble a Tiny item composed of scrap, which falls apart in 1 minute (DC 20)' },
    { id: 'weaver', name: "Weaver's tools", ability: 'dex', use: 'mend a tear in clothing (DC 10), or sew a Tiny design (DC 10)' },
    { id: 'harp', name: 'Harp', ability: 'cha', use: 'play a known tune (DC 10), or improvise a song (DC 15)' },
    { id: 'lute', name: 'Lute', ability: 'cha', use: 'play a known tune (DC 10), or improvise a song (DC 15)' },
    { id: 'viol', name: 'Viol', ability: 'cha', use: 'play a known tune (DC 10), or improvise a song (DC 15)' },
  ],

  ac: 15,
  speed: 30,
  size: 'S',
  darkvision: 0,
  // Fixed average: 8 + 2 at level 1, then 5 + 2 per level.
  hp: { max: 31, hitDice: [{ die: 8, count: 4 }] },
  rangedBonus: 0,
  // Bard spells use Charisma; slots are tracked on the Play tab, so the sheet shows its own line.
  spellcasting: { ability: 'cha', label: 'Bard · focus: a musical instrument' },

  attacks: [
    {
      id: 'shot', name: 'Starry Wisp', kind: 'spell', ability: 'cha', die: '1d8', damageType: 'radiant', main: true,
      // A cantrip: no ability modifier on its damage.
      noModDamage: true,
      rangeLabel: '60 ft', note: "target sheds dim light, can't be Invisible",
    },
  ],
  // Rows under the main card, in place of Other attacks.
  keySpells: [
    { name: 'Healing Word', summary: 'Bonus Action · 2d4 + 4' },
    { name: 'Command', summary: 'Wis save DC 14' },
    { name: 'Silvery Barbs', summary: 'Reaction' },
  ],

  resources: [
    // slot: shown in the Spell slots panel (middle column) instead of Daily uses.
    { id: 'slot1', name: 'Level 1', slot: true, max: 4, recharge: 'long' },
    { id: 'slot2', name: 'Level 2', slot: true, max: 3, recharge: 'long' },
    { id: 'inspiration', name: 'Bardic Inspiration d6', max: 4, recharge: 'long' },
    { id: 'builtForSuccess', name: 'Built for Success d4', max: 'prof', recharge: 'long' },
    { id: 'secondSkin', name: 'Second Skin (Alter Self)', max: 1, recharge: 'long' },
    { id: 'creation', name: 'Performance of Creation', max: 1, recharge: 'long' },
  ],
  // One line under the daily uses on the Play tab.
  playNote: 'Mote: check, roll the die twice · attack, thunder (Con save DC 14) · save, temp HP die + 4',

  spells: [
    { name: 'Starry Wisp', meta: 'cantrip · action · 60 ft · PHB\'24', text: 'Spell attack +6, 1d8 radiant; target sheds dim light and can\'t be Invisible until the end of your next turn' },
    { name: 'Mending', meta: 'cantrip · 1 minute · touch · PHB\'24', text: 'Repair one break up to 1 ft · cast on you: Healing Machine (spend a Hit Die)' },
    { name: 'Illusory Instrument', meta: 'cantrip · action · touch · GH PG\'24 p194', text: 'Illusory instrument, a spellcasting focus · Bonus Action: mimic a sound, play a beat, record and loop' },
    { name: 'Command', meta: 'level 1 · action · 60 ft · PHB\'24', text: 'Wis save DC 14 or Approach, Drop, Flee, Grovel or Halt on its next turn' },
    { name: 'Healing Word', meta: 'level 1 · Bonus Action · 60 ft · PHB\'24', text: '2d4 + 4 HP, +2d4 per slot level above 1' },
    { name: 'Feather Fall', meta: 'level 1 · Reaction · 60 ft · PHB\'24', text: 'Up to 5 falling creatures descend 60 ft per round and take no fall damage, 1 minute' },
    { name: 'Silvery Barbs', meta: 'level 1 · Reaction · 60 ft · SCC', text: 'A success is rerolled, lower result used; a creature you choose gets Advantage on its next d20 Test' },
    { name: 'Binding Pledge', meta: 'level 1 · 1 minute or ritual · touch · GH PG\'24 p185', text: 'You know when a sworn oath is broken, then its distance and direction · 10 days' },
    { name: 'Creeping Touch', meta: 'level 1 · action · self · concentration · GH PG\'24 p189', text: 'Your hand becomes a spider scout (telepathy within 100 ft) · 1d6 psychic if it is lost' },
    { name: 'Enlarge/Reduce', meta: 'level 2 · action · 30 ft · concentration · PHB\'24', text: 'One size larger (Str Advantage, +1d4 weapon damage) or smaller · unwilling: Con save DC 14' },
    { name: 'Alter Self', meta: 'level 2 · action · self · PHB\'24 · Second Skin', text: 'Free 1 per long rest with no Concentration (Second Skin), or with a slot' },
  ],
  features: [
    { name: 'Autognome', text: 'Construct · Small · speed 30 · Armored Casing: unarmored AC 13 + Dex · Sentry\'s Rest: 6-hour inert long rest' },
    { name: 'Built for Success', text: 'Add a d4 to an attack roll, check or save after seeing the d20 · 2 per long rest (see Play)' },
    { name: 'Healing Machine', text: 'Mending on you: spend a Hit Die, heal the roll + 2 · Cure Wounds, Healing Word, Mass Cure Wounds, Mass Healing Word and Spare the Dying work on you' },
    { name: 'Specialized Design', text: "Tinker's tools and Weaver's tools" },
    { name: 'Mechanical Nature', text: 'Resistance to poison · immune to disease · Advantage on saves against Paralyzed and Poisoned · no need to eat, drink or breathe' },
    { name: 'Bardic Inspiration', text: 'Bonus Action: a creature within 60 ft gets a d6 for one d20 Test within the hour · 4 per long rest' },
    { name: 'Expertise · Jack of All Trades', text: 'Performance and Persuasion doubled · +1 to skill checks without proficiency' },
    { name: 'Mote of Potential', text: 'With each Bardic Inspiration: check, roll the die twice and pick · attack, the target and creatures you choose within 5 ft make a Con save DC 14 or take thunder damage equal to the die · save, temp HP equal to the die + 4' },
    { name: 'Performance of Creation', text: 'Action: one nonmagical item worth up to 80 gp, Medium or smaller, within 10 ft, for 2 hours · 1 per long rest, or spend a level 2+ slot' },
    { name: 'Actor (feat)', text: '+1 Cha · Advantage on Deception and Performance to pass as the person you are disguised as · Mimicry: a listener needs a Wis (Insight) DC 14 check to tell it is fake' },
    { name: 'Second Skin (Investigator)', text: 'Alter Self always prepared, free 1 per long rest without Concentration · Change Catalyst: seeing someone who resembles a specific individual, then at the start of your next turn a Cha save DC 15 or Alter Self fires (Stunned if already used)' },
  ],
  bonusActions: [
    { name: 'Bardic Inspiration', text: 'a d6 and a Mote of Potential for a creature within 60 ft' },
    { name: 'Healing Word', text: '2d4 + 4 to a creature within 60 ft' },
    { name: 'Illusory Instrument', text: 'mimic a sound, play a beat, or record and loop' },
  ],
  // Last line of the abilities box on the Play tab.
  traitsLine: 'Construct · resistant to poison · immune to disease · Advantage on saves vs Paralyzed and Poisoned',
  languages: 'Common, plus 2 of your choice (not picked yet)',
  armorWeapons: 'Armor: light · Weapons: simple',
  nextLevel: 'Next level: Bard 5 adds Bardic Inspiration d8, Font of Inspiration, level 3 slots and Starry Wisp 2d8',

  gearDefaults: {
    equipped: ['Disguise kit', "Traveler's clothes"],
    pack: ['Manacles', 'Shovel', '3 vials'],
  },
  coinDefaults: { cp: 0, sp: 0, ep: 0, gp: 106, pp: 0 },
  legacyDefaults: [],
  attunementSlots: 3,
};
