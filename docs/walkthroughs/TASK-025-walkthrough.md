# TASK-025 Walkthrough: Add 'u' Saying Long /oo/ Spelling Lesson

## Result

A fifth selectable spelling lesson, `u-saying-oo`, is live alongside Page 22, Schwa ‹er›,
'or' saying /er/, and 'ear' saying /er/ (unchanged default):

1. **18 words, photographed order.** `super`, `ruin`, `flu`, `fluid`, `gnu`, `truth`,
   `truly`, `cruel`, `lunar`, `ruby`, `fluent`, `superb`, `crucial`, `frugal`, `glucose`,
   `superior`, `plumage`, `translucent` — each with a child-friendly definition, extended
   explanation, example sentence, and hint.
2. **Full local assets.** 18 original house-style SVG illustrations and 36 local Sonia
   (`en-GB-SoniaNeural`, `-15%`) MP3 tracks (word + definition), each with a provenance
   file, verified by asset-existence and MP3-header tests.
3. **Picker and engine wiring.** The lesson picker now renders 5 cards; selecting
   'u' saying long /oo/ persists to `localStorage` and drives Learn, Game, and Test
   through the same shared spelling engine as every other lesson.
4. **Default untouched.** `DEFAULT_SPELLING_LESSON_ID` stays `ear-saying-er`; all four
   existing lessons are unchanged.
