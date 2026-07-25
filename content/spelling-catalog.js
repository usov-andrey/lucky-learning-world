/**
 * Spelling Curriculum Catalog for Cambridge & Oxford Primary (Grade 1 - 5)
 */

export const SPELLING_DECKS = [
  {
    id: "g1-sightwords",
    name: "Grade 1 / Year 1 Sight Words",
    grade: "g1",
    words: [
      { word: "cat", hint: "A cute pet that meows", audio: "" },
      { word: "dog", hint: "A loyal pet that barks", audio: "" },
      { word: "sun", hint: "Shines bright in the daytime sky", audio: "" },
      { word: "star", hint: "Twinkles in the night sky", audio: "" },
      { word: "blue", hint: "The color of the ocean and sky", audio: "" },
      { word: "jump", hint: "Spring up off your feet", audio: "" },
      { word: "book", hint: "Something you read", audio: "" },
      { word: "fish", hint: "Swims in the water", audio: "" },
      { word: "tree", hint: "Has leaves and a wooden trunk", audio: "" },
      { word: "play", hint: "Have fun with friends", audio: "" }
    ]
  },
  {
    id: "g2-exception",
    name: "Grade 2 / Year 2 Common Exception Words",
    grade: "g2",
    words: [
      { word: "child", hint: "A young person", audio: "" },
      { word: "children", hint: "More than one child", audio: "" },
      { word: "climb", hint: "Go up a mountain or tree", audio: "" },
      { word: "behind", hint: "At the back of something", audio: "" },
      { word: "pretty", hint: "Attractive or beautiful", audio: "" },
      { word: "water", hint: "Clear liquid we drink", audio: "" },
      { word: "friend", hint: "Someone you enjoy spending time with", audio: "" },
      { word: "school", hint: "Where children learn", audio: "" },
      { word: "people", hint: "Human beings in general", audio: "" },
      { word: "beautiful", hint: "Very pleasing to look at", audio: "" }
    ]
  },
  {
    id: "y3-sightwords",
    name: "Grade 3 / Year 3 School Spelling (Lucky's Level)",
    grade: "g3",
    words: [
      { word: "island", hint: "Land surrounded by water", audio: "" },
      { word: "answer", hint: "Solution to a question", audio: "" },
      { word: "length", hint: "How long something is", audio: "" },
      { word: "height", hint: "How tall something is", audio: "" },
      { word: "history", hint: "Study of past events", audio: "" },
      { word: "century", hint: "A period of one hundred years", audio: "" },
      { word: "experiment", hint: "A scientific test or trial", audio: "" },
      { word: "famous", hint: "Known by many people", audio: "" },
      { word: "weight", hint: "How heavy something is", audio: "" },
      { word: "dragon", hint: "Mythical fire-breathing creature", audio: "" }
    ]
  },
  {
    id: "phonics-blend",
    name: "Phonics & Complex Blends (Schwa & Prefixes)",
    grade: "g3",
    words: [
      { word: "teacher", hint: "Person who helps students learn", audio: "" },
      { word: "monster", hint: "Fierce creature in adventure stories", audio: "" },
      { word: "dinosaur", hint: "Prehistoric ancient reptile", audio: "" },
      { word: "adventure", hint: "An exciting or daring experience", audio: "" },
      { word: "disappear", hint: "Vanish or cease to be visible", audio: "" },
      { word: "rebuild", hint: "Build something again", audio: "" },
      { word: "superman", hint: "A hero with super powers", audio: "" },
      { word: "umbrella", hint: "Keeps you dry in the rain", audio: "" }
    ]
  },
  {
    id: "oxford-g3",
    name: "Oxford Primary G3 International Deck",
    grade: "g3",
    words: [
      { word: "thailand", hint: "Land of Smiles in Southeast Asia", audio: "" },
      { word: "bangkok", hint: "Capital city of Thailand", audio: "" },
      { word: "elephant", hint: "Gentle giant with a long trunk", audio: "" },
      { word: "tropical", hint: "Warm and humid climate", audio: "" },
      { word: "butterfly", hint: "Insect with colorful wings", audio: "" },
      { word: "rainbow", hint: "Multi-colored arc in the sky after rain", audio: "" },
      { word: "treasure", hint: "Valuable jewels or gold", audio: "" },
      { word: "kingdom", hint: "A country ruled by a king or queen", audio: "" }
    ]
  }
];

export function getDeckById(deckId) {
  return SPELLING_DECKS.find(d => d.id === deckId) || SPELLING_DECKS[2];
}
