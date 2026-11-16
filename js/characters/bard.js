// Build data for the Autognome Bard (College of Creation). Claude edits this on level-ups; the app never does.
// Every number shown on the sheet must match Characters/Autognome Bard.md.
export const BARD = {
  buildVersion: 2,
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
  // Text below uses number placeholders ({dc}, {mod:cha}...), filled from the build: see derive.fillNumbers.
  // Rows under the main card, in place of Other attacks.
  keySpells: [
    { name: 'Healing Word', summary: 'Bonus Action · 2d4 + {mod}' },
    { name: 'Command', summary: 'Wis save DC {dc}' },
    { name: 'Silvery Barbs', summary: 'Reaction' },
  ],

  resources: [
    // slot: shown in the Spell slots panel (middle column) instead of Daily uses.
    { id: 'slot1', name: 'Level 1', slot: true, max: 4, recharge: 'long' },
    { id: 'slot2', name: 'Level 2', slot: true, max: 3, recharge: 'long' },
    { id: 'inspiration', name: 'Bardic Inspiration d6', max: 'mod:cha', recharge: 'long' },
    { id: 'builtForSuccess', name: 'Built for Success d4', max: 'prof', recharge: 'long' },
    { id: 'secondSkin', name: 'Second Skin (Alter Self)', max: 1, recharge: 'long' },
    { id: 'creation', name: 'Performance of Creation', max: 1, recharge: 'long' },
  ],
  // One line under the daily uses on the Play tab.
  playNote: 'Mote: check, roll the die twice · attack, thunder (Con save DC {dc}) · save, temp HP die + {mod:cha}',

  // The Spells tab groups these by level and sorts them by cast (action, bonus, reaction, long), then name.
  spells: [
    {
      name: 'Starry Wisp', level: 0, cast: 'action', castText: 'Action', range: '60 ft', components: 'V, S', duration: 'Instantaneous', source: "PHB'24 p320",
      text: "Spell attack {atk}, 1d8 radiant; until the end of your next turn the target sheds dim light 10 ft and can't be Invisible",
      upcast: 'Cantrip: 2d8 at level 5, 3d8 at 11, 4d8 at 17',
    },
    {
      name: 'Mending', level: 0, cast: 'long', castText: '1 minute', range: 'Touch', components: 'V, S, M (two lodestones)', duration: 'Instantaneous', source: "PHB'24 p297",
      text: 'Repair one break or tear up to 1 ft · cast on you: Healing Machine (spend a Hit Die, heal the roll + {mod:con})',
    },
    {
      name: 'Illusory Instrument', level: 0, cast: 'action', castText: 'Action', range: 'Touch', components: 'V, S', duration: '10 minutes', source: "GH PG'24 p194",
      text: 'An illusory instrument only you can touch; a spellcasting focus · Bonus Action: mimic a sound, play a beat, or record and loop',
    },
    {
      name: 'Command', level: 1, cast: 'action', castText: 'Action', range: '60 ft', components: 'V', duration: 'Instantaneous', source: "PHB'24 p251",
      text: 'Wis save DC {dc} or it obeys on its next turn: Approach, Drop, Flee, Grovel or Halt',
      upcast: '+1 creature per slot level above 1',
    },
    {
      name: 'Healing Word', level: 1, cast: 'bonus', castText: 'Bonus Action', range: '60 ft', components: 'V', duration: 'Instantaneous', source: "PHB'24 p284",
      text: 'A creature you can see regains 2d4 + {mod} HP',
      upcast: '+2d4 per slot level above 1',
    },
    {
      name: 'Feather Fall', level: 1, cast: 'reaction', castText: 'Reaction', range: '60 ft', components: 'V, M (a small feather or piece of down)', duration: '1 minute', source: "PHB'24 p271",
      text: 'When you or a creature within 60 ft falls: up to 5 falling creatures descend 60 ft per round and take no fall damage',
    },
    {
      name: 'Silvery Barbs', level: 1, cast: 'reaction', castText: 'Reaction', range: '60 ft', components: 'V', duration: 'Instantaneous', source: 'SCC p38',
      text: 'When a creature within 60 ft succeeds on an attack, check or save: it rerolls the d20 and uses the lower roll; a creature you choose gets Advantage on its next d20 Test within 1 minute',
    },
    {
      name: 'Binding Pledge', level: 1, cast: 'long', castText: '1 minute', range: 'Touch', components: 'V, S, M (a book of religious or legal importance)', duration: '10 days', ritual: true, source: "GH PG'24 p185",
      text: 'A willing creature swears an oath; you know if it breaks it, then its distance and direction',
      upcast: '3rd–4th level: 30 days · 5th–6th: 1 year · 7th+: until dispelled',
    },
    {
      name: 'Creeping Touch', level: 1, cast: 'action', castText: 'Action', range: 'Self', components: 'V, S', duration: '10 minutes', concentration: true, source: "GH PG'24 p189",
      text: 'Your hand becomes a spider (telepathy within 100 ft; Magic action to see and hear through it) · 1d6 psychic if it is lost',
    },
    {
      name: 'Enlarge/Reduce', level: 2, cast: 'action', castText: 'Action', range: '30 ft', components: 'V, S, M (a pinch of powdered iron)', duration: '1 minute', concentration: true, source: "PHB'24 p268",
      text: 'One size larger (Advantage on Str checks and saves, +1d4 weapon damage) or smaller · unwilling: Con save DC {dc}',
    },
    {
      name: 'Alter Self', level: 2, cast: 'action', castText: 'Action', range: 'Self', components: 'V, S', duration: '1 hour', concentration: true, source: "PHB'24 p239",
      text: 'Aquatic Adaptation, Change Appearance or Natural Weapons',
      tag: 'Second Skin: free 1 per long rest, no Concentration',
    },
  ],
  features: [
    { name: 'Autognome', text: 'Construct · Small · speed 30 · Armored Casing: unarmored AC 13 + Dex · Sentry\'s Rest: 6-hour inert long rest' },
    { name: 'Built for Success', text: 'Add a d4 to an attack roll, check or save after seeing the d20 · {pb} per long rest (see Play)' },
    { name: 'Healing Machine', text: 'Mending on you: spend a Hit Die, heal the roll + {mod:con} · Cure Wounds, Healing Word, Mass Cure Wounds, Mass Healing Word and Spare the Dying work on you' },
    { name: 'Specialized Design', text: "Tinker's tools and Weaver's tools" },
    { name: 'Mechanical Nature', text: 'Resistance to poison · immune to disease · Advantage on saves against Paralyzed and Poisoned · no need to eat, drink or breathe' },
    { name: 'Bardic Inspiration', text: 'Bonus Action: a creature within 60 ft gets a d6 for one d20 Test within the hour · {mod:cha} per long rest' },
    { name: 'Expertise · Jack of All Trades', text: 'Performance and Persuasion doubled · +{halfpb} to skill checks without proficiency' },
    { name: 'Mote of Potential', text: 'With each Bardic Inspiration: check, roll the die twice and pick · attack, the target and creatures you choose within 5 ft make a Con save DC {dc} or take thunder damage equal to the die · save, temp HP equal to the die + {mod:cha}' },
    { name: 'Performance of Creation', text: 'Action: one nonmagical item worth up to 80 gp, Medium or smaller, within 10 ft, for {pb} hours · 1 per long rest, or spend a level 2+ slot' },
    { name: 'Actor (feat)', text: '+1 Cha · Advantage on Deception and Performance to pass as the person you are disguised as · Mimicry: a listener needs a Wis (Insight) DC {dc:cha} check to tell it is fake' },
    { name: 'Second Skin (Investigator)', text: 'Alter Self always prepared, free 1 per long rest without Concentration · Change Catalyst: seeing someone who resembles a specific individual, then at the start of your next turn a Cha save DC {13+pb} or Alter Self fires (Stunned if already used)' },
  ],
  bonusActions: [
    { name: 'Bardic Inspiration', text: 'a d6 and a Mote of Potential for a creature within 60 ft' },
    { name: 'Healing Word', text: '2d4 + {mod} to a creature within 60 ft' },
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
