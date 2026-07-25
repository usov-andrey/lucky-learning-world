// Static character roster. `id` is permanent and never reused; presentation
// (art) can be replaced wholesale without touching stored collection data.
//
// Art is real Pokémon official artwork (PNG in pokemon/<slug>.png, same free
// source as the Lucky spelling test). Each entry maps a permanent `id` to a
// `pokemon` slug + display `name`; swapping art later is a one-line content
// change, never an engine change. Pokémon images © Nintendo / Creatures /
// GAME FREAK — bundled for personal, non-commercial family use.
//
// Collectible pool characters carry an evolution/shiny/mega art LADDER
// (`art.stages`, index 0 = base) generated from PokeAPI by
// scripts/fetch-pokemon-art.mjs into stages.generated.js. The displayed art for
// a collection entry at `level` L is stages[min(L-1, stages.length-1)]; past the
// top stage the art holds and only the Lv./star badge climbs.
//
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

// `collectible` characters get their generated evolution ladder; residents keep
// a single-stage ladder (their art never levels up).
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
        shinySrc: null, // back-compat; display is stage-driven now
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

// Number of art stages in a character's ladder (>=1). A collection entry is at
// its "top stage" once its level reaches this count.
export function getStageCount(characterId) {
  const character = BY_ID.get(characterId);
  return character && Array.isArray(character.art.stages) ? character.art.stages.length : 1;
}

// The collection `level` at which a character's art reaches its shiny stage, or
// null if it has none. Used to flip the entry's `shiny` flag meaningfully.
export function getShinyStageLevel(characterId) {
  const character = BY_ID.get(characterId);
  return character && character.art.shinyStage != null ? character.art.shinyStage + 1 : null;
}
