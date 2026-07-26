// Static character roster. `id` is permanent and never reused; presentation
// (art) can be replaced wholesale without touching stored collection data.

import { STAGE_LADDERS } from "./stages.generated.js?v=2026-07-20b";

// Residents: one per level, fixed, used only for the in-level silhouette
// reveal ("who's hiding behind this times table?"). They are never part of a
// reward pool and never stored in the collection.
const RESIDENTS = [
  { id: "res_x6", name: "Pikachu", pokemon: "pikachu" },
  { id: "res_x7", name: "Eevee", pokemon: "eevee" },
  { id: "res_x8", name: "Bulbasaur", pokemon: "bulbasaur" },
  { id: "res_x9", name: "Charmander", pokemon: "charmander" },
  { id: "res_x10", name: "Squirtle", pokemon: "squirtle" },
];

// Reward-pool characters: what actually fills the Monsterdex collection.
const POOL_CHARACTERS = [
  { id: "embercub", name: "Growlithe", pokemon: "growlithe" },
  { id: "leafling", name: "Oddish", pokemon: "oddish" },
  { id: "bubblit", name: "Poliwag", pokemon: "poliwag" },

  { id: "sparkitty", name: "Jolteon", pokemon: "jolteon" },
  { id: "coraly", name: "Corsola", pokemon: "corsola" },
  { id: "frosty", name: "Glaceon", pokemon: "glaceon" },

  { id: "glimmowl", name: "Rowlet", pokemon: "rowlet" },
  { id: "duskit", name: "Umbreon", pokemon: "umbreon" },
  { id: "pebblin", name: "Geodude", pokemon: "geodude" },

  { id: "wispurr", name: "Espeon", pokemon: "espeon" },
  { id: "glowmoth", name: "Butterfree", pokemon: "butterfree" },
  { id: "tidalpup", name: "Vaporeon", pokemon: "vaporeon" },

  { id: "starhorn", name: "Mewtwo", pokemon: "mewtwo", legendary: true },
  { id: "aurelio", name: "Mew", pokemon: "mew", legendary: true },
  { id: "moonkit", name: "Sylveon", pokemon: "sylveon" },
];

function makeImageCharacter(collectible) {
  return function imageCharacter({ id, name, pokemon, legendary }) {
    const ladder = collectible ? STAGE_LADDERS[pokemon] : null;
    const stages = ladder ? ladder.stages : [`pokemon/${pokemon}.png`];
    return {
      id,
      name,
      art: {
        kind: "image",
        src: stages[0],
        stages,
        shinyStage: ladder && Number.isInteger(ladder.shinyStage) ? ladder.shinyStage : null,
        shinySrc: null,
        legendary: Boolean(legendary),
      },
    };
  };
}

export const CHARACTERS = [
  ...RESIDENTS.map(makeImageCharacter(false)),
  ...POOL_CHARACTERS.map(makeImageCharacter(true)),
];

const BY_ID = new Map(CHARACTERS.map((character) => [character.id, character]));

export function getCharacterById(characterId) {
  return BY_ID.get(characterId) || null;
}

export function getStageCount(characterId) {
  const character = BY_ID.get(characterId);
  return character && Array.isArray(character.art.stages) ? character.art.stages.length : 1;
}

export function getShinyStageLevel(characterId) {
  const character = BY_ID.get(characterId);
  return character && character.art.shinyStage != null ? character.art.shinyStage + 1 : null;
}
