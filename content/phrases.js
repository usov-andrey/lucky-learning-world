// Voice phrase data. No DOM/Audio here — app.js does playback + fallback.

export const PHRASES = {
  reveal_step: { en: "Yes! One more piece!" },
  dodge: { en: "Almost! Let's look at this one.", thAudio: "audio/th/dodge_th.mp3" },
  recatch: { en: "Got it back!" },
  praise_th: { en: "Yes!", thAudio: "audio/th/praise_th.mp3" },
  caught_th: { en: "You got it!", thAudio: "audio/th/caught_th.mp3" },
  tomorrow: { en: "See you again soon!", thAudio: "audio/th/tomorrow_th.mp3" },
  resultWarm: { en: "Nice try! Let's visit this place again soon." },
  resultOneStar: { en: "You did it! One star!" },
  resultTwoStar: { en: "Awesome! Two stars! A new place is open!" },
  resultThreeStar: { en: "Amazing! Three stars! A new friend is here!" },
  collectionComplete: { en: "Wow, you caught them all!" },
  evolving: { en: "What? Something is happening!" },
  evolved: { en: "It evolved!" },
  grewStronger: { en: "It grew stronger!" },
  mixIntro: { en: "Mix-Up time! Let's beat your tricky numbers!" },
  shining: { en: "Whoa... it's shining!" },
};

export const PRAISE_POOL = ["Yes!", "Great!", "Nice!", "Awesome!"];

export function factTeachText(a, b) {
  return `${a} times ${b} is ${a * b}.`;
}

export function questionText(question) {
  if (question.type === "missing") {
    return `What number times ${question.a} is ${question.a * question.b}?`;
  }
  return `What is ${question.a} times ${question.b}?`;
}

export function levelIntroText(table) {
  return `Let's practice the ${table} times table!`;
}

export function caughtText(name) {
  return `You got it! It's ${name}!`;
}

// Spoken while a level-up reveal is transforming.
export function evolvingText(name) {
  return `What? ${name} is changing!`;
}

// Spoken when a level-up actually advances the art to a new stage.
export function evolvedText(name) {
  return `Amazing! ${name} evolved!`;
}

// Spoken when a level-up happens but the art is already at its top stage.
export function grewStrongerText(name, level) {
  return `${name} grew stronger! Level ${level}!`;
}

// Spoken when the Mix / Daily-Challenge starts (no single table).
export function mixIntroText() {
  return PHRASES.mixIntro.en;
}

// Spoken on a Mix shiny-jump reward.
export function shinyJumpText(name) {
  return `Whoa! ${name} is shining bright!`;
}

export function resultText(stars) {
  if (stars <= 0) return PHRASES.resultWarm.en;
  if (stars === 1) return PHRASES.resultOneStar.en;
  if (stars === 2) return PHRASES.resultTwoStar.en;
  return PHRASES.resultThreeStar.en;
}

// Big headline shown on the result screen (kept short — the full sentence is
// resultText, spoken and shown as the note underneath).
export function resultHeadline(stars) {
  if (stars <= 0) return "Nice try!";
  if (stars === 1) return "You did it!";
  if (stars === 2) return "Great job!";
  return "Amazing!";
}

// Visible caption above the equation.
export function questionCaption(question) {
  return question.type === "missing" ? "Find the missing number!" : "Solve it to reveal the Pokémon!";
}

// Nickname shown under each level node on the map.
const TABLE_NICKNAMES = { 6: "Sixes", 7: "Sevens", 8: "Eights", 9: "Nines", 10: "Tens" };
export function tableNickname(table) {
  return TABLE_NICKNAMES[table] || `${table}× Table`;
}
