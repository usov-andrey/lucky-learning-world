// Comic Quest character presentation catalog.
// Provides 1:1 replacement artwork and original comic character names for all 20 character IDs.

const RESIDENTS = [
  { id: "res_x6", name: "Officer Paws", art: { kind: "image", src: "assets/themes/comic/res_x6.svg", stages: ["assets/themes/comic/res_x6.svg"], shinyStage: null, legendary: false } },
  { id: "res_x7", name: "Chippy", art: { kind: "image", src: "assets/themes/comic/res_x7.svg", stages: ["assets/themes/comic/res_x7.svg"], shinyStage: null, legendary: false } },
  { id: "res_x8", name: "Sprout Hero", art: { kind: "image", src: "assets/themes/comic/res_x8.svg", stages: ["assets/themes/comic/res_x8.svg"], shinyStage: null, legendary: false } },
  { id: "res_x9", name: "Blaze Kid", art: { kind: "image", src: "assets/themes/comic/res_x9.svg", stages: ["assets/themes/comic/res_x9.svg"], shinyStage: null, legendary: false } },
  { id: "res_x10", name: "Splash Captain", art: { kind: "image", src: "assets/themes/comic/res_x10.svg", stages: ["assets/themes/comic/res_x10.svg"], shinyStage: null, legendary: false } },
];

const POOL = [
  {
    id: "embercub", name: "Ember Pup",
    art: { kind: "image", src: "assets/themes/comic/embercub_st1.svg", stages: ["assets/themes/comic/embercub_st1.svg", "assets/themes/comic/embercub_st2.svg", "assets/themes/comic/embercub_st3.svg"], shinyStage: 2, legendary: false }
  },
  {
    id: "leafling", name: "Leafy Bud",
    art: { kind: "image", src: "assets/themes/comic/leafling_st1.svg", stages: ["assets/themes/comic/leafling_st1.svg", "assets/themes/comic/leafling_st2.svg", "assets/themes/comic/leafling_st3.svg", "assets/themes/comic/leafling_st4.svg"], shinyStage: 3, legendary: false }
  },
  {
    id: "bubblit", name: "Bubble Tad",
    art: { kind: "image", src: "assets/themes/comic/bubblit_st1.svg", stages: ["assets/themes/comic/bubblit_st1.svg", "assets/themes/comic/bubblit_st2.svg", "assets/themes/comic/bubblit_st3.svg", "assets/themes/comic/bubblit_st4.svg"], shinyStage: 3, legendary: false }
  },
  {
    id: "sparkitty", name: "Zap Cat",
    art: { kind: "image", src: "assets/themes/comic/sparkitty_st1.svg", stages: ["assets/themes/comic/sparkitty_st1.svg", "assets/themes/comic/sparkitty_st2.svg"], shinyStage: 1, legendary: false }
  },
  {
    id: "coraly", name: "Coral Champ",
    art: { kind: "image", src: "assets/themes/comic/coraly_st1.svg", stages: ["assets/themes/comic/coraly_st1.svg", "assets/themes/comic/coraly_st2.svg"], shinyStage: 1, legendary: false }
  },
  {
    id: "frosty", name: "Frost Fox",
    art: { kind: "image", src: "assets/themes/comic/frosty_st1.svg", stages: ["assets/themes/comic/frosty_st1.svg", "assets/themes/comic/frosty_st2.svg"], shinyStage: 1, legendary: false }
  },
  {
    id: "glimmowl", name: "Glimmer Owl",
    art: { kind: "image", src: "assets/themes/comic/glimmowl_st1.svg", stages: ["assets/themes/comic/glimmowl_st1.svg", "assets/themes/comic/glimmowl_st2.svg", "assets/themes/comic/glimmowl_st3.svg", "assets/themes/comic/glimmowl_st4.svg"], shinyStage: 3, legendary: false }
  },
  {
    id: "duskit", name: "Dusk Knight",
    art: { kind: "image", src: "assets/themes/comic/duskit_st1.svg", stages: ["assets/themes/comic/duskit_st1.svg", "assets/themes/comic/duskit_st2.svg"], shinyStage: 1, legendary: false }
  },
  {
    id: "pebblin", name: "Rocky Puncher",
    art: { kind: "image", src: "assets/themes/comic/pebblin_st1.svg", stages: ["assets/themes/comic/pebblin_st1.svg", "assets/themes/comic/pebblin_st2.svg", "assets/themes/comic/pebblin_st3.svg", "assets/themes/comic/pebblin_st4.svg"], shinyStage: 3, legendary: false }
  },
  {
    id: "wispurr", name: "Psi Cat",
    art: { kind: "image", src: "assets/themes/comic/wispurr_st1.svg", stages: ["assets/themes/comic/wispurr_st1.svg", "assets/themes/comic/wispurr_st2.svg"], shinyStage: 1, legendary: false }
  },
  {
    id: "glowmoth", name: "Glow Flutter",
    art: { kind: "image", src: "assets/themes/comic/glowmoth_st1.svg", stages: ["assets/themes/comic/glowmoth_st1.svg", "assets/themes/comic/glowmoth_st2.svg", "assets/themes/comic/glowmoth_st3.svg", "assets/themes/comic/glowmoth_st4.svg"], shinyStage: 3, legendary: false }
  },
  {
    id: "tidalpup", name: "Wave Hound",
    art: { kind: "image", src: "assets/themes/comic/tidalpup_st1.svg", stages: ["assets/themes/comic/tidalpup_st1.svg", "assets/themes/comic/tidalpup_st2.svg"], shinyStage: 1, legendary: false }
  },
  {
    id: "starhorn", name: "Cosmic Titan",
    art: { kind: "image", src: "assets/themes/comic/starhorn_st1.svg", stages: ["assets/themes/comic/starhorn_st1.svg", "assets/themes/comic/starhorn_st2.svg", "assets/themes/comic/starhorn_st3.svg", "assets/themes/comic/starhorn_st4.svg"], shinyStage: 3, legendary: true }
  },
  {
    id: "aurelio", name: "Star Sprite",
    art: { kind: "image", src: "assets/themes/comic/aurelio_st1.svg", stages: ["assets/themes/comic/aurelio_st1.svg", "assets/themes/comic/aurelio_st2.svg"], shinyStage: 1, legendary: true }
  },
  {
    id: "moonkit", name: "Ribbon Tail",
    art: { kind: "image", src: "assets/themes/comic/moonkit_st1.svg", stages: ["assets/themes/comic/moonkit_st1.svg", "assets/themes/comic/moonkit_st2.svg"], shinyStage: 1, legendary: false }
  }
];

export const COMIC_CHARACTERS = {};

[...RESIDENTS, ...POOL].forEach((c) => {
  COMIC_CHARACTERS[c.id] = c;
});

if (typeof window !== "undefined") {
  window.COMIC_CHARACTERS = COMIC_CHARACTERS;
}

export function getComicCharacterById(id) {
  return COMIC_CHARACTERS[id] || null;
}
