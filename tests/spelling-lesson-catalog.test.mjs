// @task TASK-005
// @task TASK-008
// @task TASK-010
// @task TASK-014
// @task TASK-025
// @task TASK-028
// @task TASK-030
// @task TASK-031
// @task TASK-032
// @task TASK-033
// @ac AC-25 New lesson catalog integrity
// @ac AC-26 Complete local learning content
// @ac AC-29 Correct Sonia audio replacement
// @ac AC-10 Lesson Catalog Default and Integrity
// @ac AC-12 Complete Schwa ‹er› Learning Content
// @ac AC-15 Safe Selection Fallback
// @ac AC-17 Local Offline Assets
// @ac AC-48 'ear' saying /er/ lesson catalog integrity
// @ac AC-49 Complete local learning content and Sonia audio for 'ear' saying /er/
// @ac AC-50 New default lesson and safe-fallback target
// @ac AC-51 Existing lessons preserved unchanged
// @ac AC-84 'u' saying long /oo/ lesson catalog integrity, default unchanged
// @ac AC-85 Complete local learning content and Sonia audio for 'u' saying long /oo/
// @ac AC-96 ‹ough›, ‹gh› and ‹augh› lesson catalog integrity, default unchanged
// @ac AC-97 Complete local learning content and Sonia audio for ‹ough›, ‹gh› and ‹augh›
// @ac AC-103 ‹ive› saying /iv/ lesson catalog integrity, default unchanged
// @ac AC-104 Complete local learning content and Sonia audio for ‹ive› saying /iv/
// @ac AC-107 ‹-ic› lesson catalog integrity, default unchanged
// @ac AC-108 Complete local learning content and Sonia audio for ‹-ic›
// @ac AC-112 Newest catalog lesson is the safe default
// @ac AC-114 ‹st› saying /s/ lesson catalog integrity and newest default
// @ac AC-115 Complete local learning content and Sonia audio for ‹st› saying /s/

import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { fileURLToPath } from "node:url";

import {
  PAGE_22_LESSON,
  SCHWA_ER_LESSON,
  OR_SAYING_ER_LESSON,
  EAR_SAYING_ER_LESSON,
  U_SAYING_OO_LESSON,
  OUGH_GH_AUGH_LESSON,
  IVE_SAYING_IV_LESSON,
  IC_ENDING_LESSON,
  ST_SAYING_S_LESSON,
  SPELLING_LESSONS,
  DEFAULT_SPELLING_LESSON_ID,
  getSpellingLesson,
  getSelectedSpellingLessonId,
  setSelectedSpellingLessonId
} from "../content/spelling-catalog.js";

test("TASK-005 AC-10 through TASK-033 AC-114: catalog exposes all nine lessons and defaults to the newest record", () => {
  assert.equal(SPELLING_LESSONS.length, 9);
  assert.equal(PAGE_22_LESSON.id, "page-22");
  assert.equal(PAGE_22_LESSON.words.length, 18);
  assert.equal(SCHWA_ER_LESSON.id, "schwa-er");
  assert.equal(SCHWA_ER_LESSON.words.length, 18);
  assert.equal(OR_SAYING_ER_LESSON.id, "or-saying-er");
  assert.equal(OR_SAYING_ER_LESSON.words.length, 18);
  assert.equal(EAR_SAYING_ER_LESSON.id, "ear-saying-er");
  assert.equal(EAR_SAYING_ER_LESSON.words.length, 18);
  assert.equal(U_SAYING_OO_LESSON.id, "u-saying-oo");
  assert.equal(U_SAYING_OO_LESSON.words.length, 18);
  assert.equal(OUGH_GH_AUGH_LESSON.id, "ough-gh-augh");
  assert.equal(OUGH_GH_AUGH_LESSON.words.length, 18);
  assert.equal(IVE_SAYING_IV_LESSON.id, "ive-saying-iv");
  assert.equal(IVE_SAYING_IV_LESSON.words.length, 18);
  assert.equal(IC_ENDING_LESSON.id, "ic-ending");
  assert.equal(IC_ENDING_LESSON.words.length, 18);
  assert.equal(ST_SAYING_S_LESSON.id, "st-saying-s");
  assert.equal(ST_SAYING_S_LESSON.words.length, 18);
  assert.equal(DEFAULT_SPELLING_LESSON_ID, "st-saying-s");
});

test("TASK-005 AC-10 & AC-15, updated by TASK-032 AC-112: getSpellingLesson returns requested lesson or safely falls back to the newest lesson", () => {
  assert.equal(getSpellingLesson("schwa-er").id, "schwa-er");
  assert.equal(getSpellingLesson("page-22").id, "page-22");
  assert.equal(getSpellingLesson("or-saying-er").id, "or-saying-er");
  assert.equal(getSpellingLesson("ear-saying-er").id, "ear-saying-er");
  assert.equal(getSpellingLesson("u-saying-oo").id, "u-saying-oo");
  assert.equal(getSpellingLesson("ough-gh-augh").id, "ough-gh-augh");
  assert.equal(getSpellingLesson("ive-saying-iv").id, "ive-saying-iv");
  assert.equal(getSpellingLesson("ic-ending").id, "ic-ending");
  assert.equal(getSpellingLesson("st-saying-s").id, "st-saying-s");
  assert.equal(getSpellingLesson("unknown-lesson-id").id, "st-saying-s");
  assert.equal(getSpellingLesson(null).id, "st-saying-s");
});

test("TASK-008 AC-25 & AC-26 and TASK-010 AC-29: catalog exposes complete Sonia-backed lesson content", () => {
  const expectedWords = [
    "worm", "word", "world", "worst", "worker", "worse", "workable", "worthy", "worship",
    "fireworks", "worksheet", "worthless", "workmanship", "worldliness", "workforce",
    "worldwide", "worthwhile", "worthlessness"
  ];

  assert.equal(OR_SAYING_ER_LESSON.id, "or-saying-er");
  assert.equal(OR_SAYING_ER_LESSON.topic, "'or' saying /er/");
  assert.deepEqual(OR_SAYING_ER_LESSON.words.map(item => item.word), expectedWords);
  assert.equal(OR_SAYING_ER_LESSON.wordCount, expectedWords.length);

  OR_SAYING_ER_LESSON.words.forEach((item) => {
    assert.ok(item.definition, `Missing definition for ${item.word}`);
    assert.ok(item.extendedExplanation, `Missing extended explanation for ${item.word}`);
    assert.ok(item.exampleSentence, `Missing example sentence for ${item.word}`);
    assert.ok(item.hint, `Missing hint for ${item.word}`);
    assert.ok(item.imageAlt, `Missing image alt text for ${item.word}`);
    assert.match(item.image, /^content\/or-saying-er\/images\/.+\.svg$/);
    assert.match(item.audio, /^content\/or-saying-er\/audio\/.+\.mp3$/);
    assert.match(item.definitionAudio, /^content\/or-saying-er\/audio\/definitions\/.+\.mp3$/);
    for (const assetPath of [item.image, item.audio, item.definitionAudio]) {
      const absoluteAssetPath = fileURLToPath(new URL(`../${assetPath}`, import.meta.url));
      assert.ok(fs.existsSync(absoluteAssetPath), `Missing local asset ${assetPath}`);
      assert.ok(fs.statSync(absoluteAssetPath).size > 0, `Empty local asset ${assetPath}`);
      if (assetPath.endsWith(".mp3")) {
        const header = fs.readFileSync(absoluteAssetPath).subarray(0, 3);
        const hasId3Header = header.toString("ascii") === "ID3";
        const hasMpegFrame = header[0] === 0xff && (header[1] & 0xe0) === 0xe0;
        assert.ok(hasId3Header || hasMpegFrame, `Invalid MP3 header for ${assetPath}`);
      }
    }
  });

  const audioDirectory = fileURLToPath(new URL("../content/or-saying-er/audio/", import.meta.url));
  const legacyWavFiles = fs.readdirSync(audioDirectory, { recursive: true })
    .filter(name => String(name).toLowerCase().endsWith(".wav"));
  assert.deepEqual(legacyWavFiles, [], "Incorrect legacy WAV tracks must not remain");

  const manifestPath = fileURLToPath(new URL("../content/or-saying-er/audio-manifest.json", import.meta.url));
  const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
  assert.deepEqual(
    manifest.words.map(item => ({ word: item.word, definition: item.definition })),
    OR_SAYING_ER_LESSON.words.map(item => ({ word: item.word, definition: item.definition })),
    "Audio source manifest must exactly match catalog speech text"
  );
  const provenance = fs.readFileSync(`${audioDirectory}/PROVENANCE.md`, "utf8");
  assert.match(provenance, /en-GB-SoniaNeural/);
  assert.match(provenance, /-15%/);
  assert.match(provenance, /User approved/i);
});

test("TASK-005 AC-12: Schwa ‹er› words match canonical order and contain all mandatory content fields", () => {
  const expectedWords = [
    "pattern", "referee", "opera", "cavern", "modern", "manners",
    "general", "interest", "average", "weather", "different", "interrupt",
    "exaggerate", "whether", "caterpillar", "desperate", "rhinoceros", "temperature"
  ];

  assert.equal(SCHWA_ER_LESSON.words.length, 18);

  SCHWA_ER_LESSON.words.forEach((w, idx) => {
    assert.equal(w.word, expectedWords[idx]);
    assert.ok(w.definition && w.definition.length > 0, `Missing definition for ${w.word}`);
    assert.ok(w.extendedExplanation && w.extendedExplanation.length > 0, `Missing extendedExplanation for ${w.word}`);
    assert.ok(w.exampleSentence && w.exampleSentence.length > 0, `Missing exampleSentence for ${w.word}`);
    assert.ok(w.image && w.image.startsWith("content/schwa-er/images/"), `Invalid image path for ${w.word}`);
    assert.ok(w.imageAlt && w.imageAlt.length > 0, `Missing imageAlt for ${w.word}`);
    assert.ok(w.audio && w.audio.startsWith("content/schwa-er/audio/"), `Invalid audio path for ${w.word}`);
    assert.ok(w.definitionAudio && w.definitionAudio.startsWith("content/schwa-er/audio/definitions/"), `Invalid definitionAudio path for ${w.word}`);
    assert.ok(w.hint && w.hint.length > 0, `Missing hint for ${w.word}`);
  });
});

test("TASK-005 AC-17: Page 22 words maintain complete fields and local audio/image paths", () => {
  PAGE_22_LESSON.words.forEach((w) => {
    assert.ok(w.word);
    assert.ok(w.definition);
    assert.ok(w.image && w.image.startsWith("content/page-22/images/"));
    assert.ok(w.audio && w.audio.startsWith("content/page-22/audio/"));
    assert.ok(w.definitionAudio && w.definitionAudio.startsWith("content/page-22/audio/definitions/"));
  });
});

test("TASK-014 AC-48 & AC-49: catalog exposes complete Sonia-backed 'ear' saying /er/ lesson content", () => {
  const expectedWords = [
    "earn", "learn", "heard", "earth", "search", "earnings", "yearn", "early", "pearl",
    "dearth", "hearse", "earnest", "rehearse", "overheard", "researcher", "searchlight",
    "earthworm", "earthquake"
  ];

  assert.equal(EAR_SAYING_ER_LESSON.id, "ear-saying-er");
  assert.equal(EAR_SAYING_ER_LESSON.topic, "'ear' saying /er/");
  assert.deepEqual(EAR_SAYING_ER_LESSON.words.map(item => item.word), expectedWords);
  assert.equal(EAR_SAYING_ER_LESSON.wordCount, expectedWords.length);

  EAR_SAYING_ER_LESSON.words.forEach((item) => {
    assert.ok(item.definition, `Missing definition for ${item.word}`);
    assert.ok(item.extendedExplanation, `Missing extended explanation for ${item.word}`);
    assert.ok(item.exampleSentence, `Missing example sentence for ${item.word}`);
    assert.ok(item.hint, `Missing hint for ${item.word}`);
    assert.ok(item.imageAlt, `Missing image alt text for ${item.word}`);
    assert.match(item.image, /^content\/ear-saying-er\/images\/.+\.svg$/);
    assert.match(item.audio, /^content\/ear-saying-er\/audio\/.+\.mp3$/);
    assert.match(item.definitionAudio, /^content\/ear-saying-er\/audio\/definitions\/.+\.mp3$/);
    for (const assetPath of [item.image, item.audio, item.definitionAudio]) {
      const absoluteAssetPath = fileURLToPath(new URL(`../${assetPath}`, import.meta.url));
      assert.ok(fs.existsSync(absoluteAssetPath), `Missing local asset ${assetPath}`);
      assert.ok(fs.statSync(absoluteAssetPath).size > 0, `Empty local asset ${assetPath}`);
      if (assetPath.endsWith(".mp3")) {
        const header = fs.readFileSync(absoluteAssetPath).subarray(0, 3);
        const hasId3Header = header.toString("ascii") === "ID3";
        const hasMpegFrame = header[0] === 0xff && (header[1] & 0xe0) === 0xe0;
        assert.ok(hasId3Header || hasMpegFrame, `Invalid MP3 header for ${assetPath}`);
      }
    }
  });

  const audioDirectory = fileURLToPath(new URL("../content/ear-saying-er/audio/", import.meta.url));
  const legacyWavFiles = fs.readdirSync(audioDirectory, { recursive: true })
    .filter(name => String(name).toLowerCase().endsWith(".wav"));
  assert.deepEqual(legacyWavFiles, [], "Incorrect legacy WAV tracks must not remain");

  const manifestPath = fileURLToPath(new URL("../content/ear-saying-er/audio-manifest.json", import.meta.url));
  const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
  assert.deepEqual(
    manifest.words.map(item => ({ word: item.word, definition: item.definition })),
    EAR_SAYING_ER_LESSON.words.map(item => ({ word: item.word, definition: item.definition })),
    "Audio source manifest must exactly match catalog speech text"
  );
  const provenance = fs.readFileSync(`${audioDirectory}/PROVENANCE.md`, "utf8");
  assert.match(provenance, /en-GB-SoniaNeural/);
  assert.match(provenance, /-15%/);
});

test("TASK-025 AC-84 & AC-85: catalog exposes complete Sonia-backed 'u' saying long /oo/ lesson content", () => {
  const expectedWords = [
    "super", "ruin", "flu", "fluid", "gnu", "truth", "truly", "cruel", "lunar", "ruby",
    "fluent", "superb", "crucial", "frugal", "glucose", "superior", "plumage", "translucent"
  ];

  assert.equal(U_SAYING_OO_LESSON.id, "u-saying-oo");
  assert.equal(U_SAYING_OO_LESSON.topic, "'u' saying long /oo/");
  assert.deepEqual(U_SAYING_OO_LESSON.words.map(item => item.word), expectedWords);
  assert.equal(U_SAYING_OO_LESSON.wordCount, expectedWords.length);

  U_SAYING_OO_LESSON.words.forEach((item) => {
    assert.ok(item.definition, `Missing definition for ${item.word}`);
    assert.ok(item.extendedExplanation, `Missing extended explanation for ${item.word}`);
    assert.ok(item.exampleSentence, `Missing example sentence for ${item.word}`);
    assert.ok(item.hint, `Missing hint for ${item.word}`);
    assert.ok(item.imageAlt, `Missing image alt text for ${item.word}`);
    assert.match(item.image, /^content\/u-saying-oo\/images\/.+\.svg$/);
    assert.match(item.audio, /^content\/u-saying-oo\/audio\/.+\.mp3$/);
    assert.match(item.definitionAudio, /^content\/u-saying-oo\/audio\/definitions\/.+\.mp3$/);
    for (const assetPath of [item.image, item.audio, item.definitionAudio]) {
      const absoluteAssetPath = fileURLToPath(new URL(`../${assetPath}`, import.meta.url));
      assert.ok(fs.existsSync(absoluteAssetPath), `Missing local asset ${assetPath}`);
      assert.ok(fs.statSync(absoluteAssetPath).size > 0, `Empty local asset ${assetPath}`);
      if (assetPath.endsWith(".mp3")) {
        const header = fs.readFileSync(absoluteAssetPath).subarray(0, 3);
        const hasId3Header = header.toString("ascii") === "ID3";
        const hasMpegFrame = header[0] === 0xff && (header[1] & 0xe0) === 0xe0;
        assert.ok(hasId3Header || hasMpegFrame, `Invalid MP3 header for ${assetPath}`);
      }
    }
  });

  const audioDirectory = fileURLToPath(new URL("../content/u-saying-oo/audio/", import.meta.url));
  const legacyWavFiles = fs.readdirSync(audioDirectory, { recursive: true })
    .filter(name => String(name).toLowerCase().endsWith(".wav"));
  assert.deepEqual(legacyWavFiles, [], "Incorrect legacy WAV tracks must not remain");

  const manifestPath = fileURLToPath(new URL("../content/u-saying-oo/audio-manifest.json", import.meta.url));
  const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
  assert.deepEqual(
    manifest.words.map(item => ({ word: item.word, definition: item.definition })),
    U_SAYING_OO_LESSON.words.map(item => ({ word: item.word, definition: item.definition })),
    "Audio source manifest must exactly match catalog speech text"
  );
  const provenance = fs.readFileSync(`${audioDirectory}/PROVENANCE.md`, "utf8");
  assert.match(provenance, /en-GB-SoniaNeural/);
  assert.match(provenance, /-15%/);

  const imagesDirectory = fileURLToPath(new URL("../content/u-saying-oo/images/", import.meta.url));
  const imageProvenance = fs.readFileSync(`${imagesDirectory}/PROVENANCE.md`, "utf8");
  assert.match(imageProvenance, /TASK-025/);
});

test("TASK-028 AC-96 & AC-97: catalog exposes complete Sonia-backed ‹ough›, ‹gh› and ‹augh› lesson content", () => {
  const expectedWords = [
    "ought", "bought", "brought", "fought", "nought", "thought", "ghostly", "dinghy",
    "ghoul", "aghast", "gherkin", "yoghurt", "naughty", "fraught", "caught", "daughter",
    "distraught", "onslaught"
  ];

  assert.equal(OUGH_GH_AUGH_LESSON.id, "ough-gh-augh");
  assert.equal(OUGH_GH_AUGH_LESSON.topic, "‹ough›, ‹gh› and ‹augh›");
  assert.deepEqual(OUGH_GH_AUGH_LESSON.words.map(item => item.word), expectedWords);
  assert.equal(OUGH_GH_AUGH_LESSON.wordCount, expectedWords.length);

  OUGH_GH_AUGH_LESSON.words.forEach((item) => {
    assert.ok(item.definition, `Missing definition for ${item.word}`);
    assert.ok(item.extendedExplanation, `Missing extended explanation for ${item.word}`);
    assert.ok(item.exampleSentence, `Missing example sentence for ${item.word}`);
    assert.ok(item.hint, `Missing hint for ${item.word}`);
    assert.ok(item.imageAlt, `Missing image alt text for ${item.word}`);
    assert.match(item.image, /^content\/ough-gh-augh\/images\/.+\.svg$/);
    assert.match(item.audio, /^content\/ough-gh-augh\/audio\/.+\.mp3$/);
    assert.match(item.definitionAudio, /^content\/ough-gh-augh\/audio\/definitions\/.+\.mp3$/);
    for (const assetPath of [item.image, item.audio, item.definitionAudio]) {
      const absoluteAssetPath = fileURLToPath(new URL(`../${assetPath}`, import.meta.url));
      assert.ok(fs.existsSync(absoluteAssetPath), `Missing local asset ${assetPath}`);
      assert.ok(fs.statSync(absoluteAssetPath).size > 0, `Empty local asset ${assetPath}`);
      if (assetPath.endsWith(".mp3")) {
        const header = fs.readFileSync(absoluteAssetPath).subarray(0, 3);
        const hasId3Header = header.toString("ascii") === "ID3";
        const hasMpegFrame = header[0] === 0xff && (header[1] & 0xe0) === 0xe0;
        assert.ok(hasId3Header || hasMpegFrame, `Invalid MP3 header for ${assetPath}`);
      }
    }
  });

  const audioDirectory = fileURLToPath(new URL("../content/ough-gh-augh/audio/", import.meta.url));
  const legacyWavFiles = fs.readdirSync(audioDirectory, { recursive: true })
    .filter(name => String(name).toLowerCase().endsWith(".wav"));
  assert.deepEqual(legacyWavFiles, [], "Incorrect legacy WAV tracks must not remain");

  const manifestPath = fileURLToPath(new URL("../content/ough-gh-augh/audio-manifest.json", import.meta.url));
  const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
  assert.deepEqual(
    manifest.words.map(item => ({ word: item.word, definition: item.definition })),
    OUGH_GH_AUGH_LESSON.words.map(item => ({ word: item.word, definition: item.definition })),
    "Audio source manifest must exactly match catalog speech text"
  );
  const provenance = fs.readFileSync(`${audioDirectory}/PROVENANCE.md`, "utf8");
  assert.match(provenance, /en-GB-SoniaNeural/);
  assert.match(provenance, /-15%/);

  const imagesDirectory = fileURLToPath(new URL("../content/ough-gh-augh/images/", import.meta.url));
  const imageProvenance = fs.readFileSync(`${imagesDirectory}/PROVENANCE.md`, "utf8");
  assert.match(imageProvenance, /TASK-028/);
});

test("TASK-030 AC-103 & AC-104: catalog exposes complete Sonia-backed ‹ive› saying /iv/ lesson content", () => {
  const expectedWords = ["festive", "positive", "active", "massive", "negative", "motive", "adjective", "impressive", "explosive", "elusive", "expensive", "superlative", "constructive", "destructive", "exclusive", "inclusive", "alliterative", "imaginative"];
  assert.deepEqual(IVE_SAYING_IV_LESSON.words.map(item => item.word), expectedWords);
  assert.equal(IVE_SAYING_IV_LESSON.topic, "‹ive› saying /iv/");
  for (const item of IVE_SAYING_IV_LESSON.words) {
    for (const field of ["definition", "extendedExplanation", "exampleSentence", "hint", "imageAlt", "image", "audio", "definitionAudio"]) assert.ok(item[field], `Missing ${field} for ${item.word}`);
    for (const assetPath of [item.image, item.audio, item.definitionAudio]) {
      const absoluteAssetPath = fileURLToPath(new URL(`../${assetPath}`, import.meta.url));
      assert.ok(fs.existsSync(absoluteAssetPath), `Missing local asset ${assetPath}`);
      assert.ok(fs.statSync(absoluteAssetPath).size > 0, `Empty local asset ${assetPath}`);
    }
  }
  const audioDirectory = fileURLToPath(new URL("../content/ive-saying-iv/audio/", import.meta.url));
  const manifest = JSON.parse(fs.readFileSync(fileURLToPath(new URL("../content/ive-saying-iv/audio-manifest.json", import.meta.url)), "utf8"));
  assert.deepEqual(manifest.words, IVE_SAYING_IV_LESSON.words.map(({ word, definition }) => ({ word, definition })));
  assert.equal(manifest.voice, "en-GB-SoniaNeural");
  assert.equal(manifest.rate, "-15%");
  assert.match(fs.readFileSync(`${audioDirectory}/PROVENANCE.md`, "utf8"), /en-GB-SoniaNeural/);
  assert.match(fs.readFileSync(`${audioDirectory}/PROVENANCE.md`, "utf8"), /-15%/);
  assert.match(fs.readFileSync(fileURLToPath(new URL("../content/ive-saying-iv/images/PROVENANCE.md", import.meta.url)), "utf8"), /TASK-030/);
});

test("TASK-031 AC-107 & AC-108: catalog exposes complete Sonia-backed ‹-ic› lesson content", () => {
  const expectedWords = ["epic", "comic", "hectic", "toxic", "classic", "exotic", "heroic", "poetic", "athletic", "dramatic", "fantastic", "lunatic", "chaotic", "rhythmic", "scientific", "sympathetic", "monosyllabic", "characteristic"];
  assert.deepEqual(IC_ENDING_LESSON.words.map(item => item.word), expectedWords);
  assert.equal(IC_ENDING_LESSON.topic, "Words ending in ‹-ic›");
  for (const item of IC_ENDING_LESSON.words) {
    for (const field of ["definition", "extendedExplanation", "exampleSentence", "hint", "imageAlt", "image", "audio", "definitionAudio"]) assert.ok(item[field], `Missing ${field} for ${item.word}`);
    for (const assetPath of [item.image, item.audio, item.definitionAudio]) {
      const absoluteAssetPath = fileURLToPath(new URL(`../${assetPath}`, import.meta.url));
      assert.ok(fs.existsSync(absoluteAssetPath), `Missing local asset ${assetPath}`);
      assert.ok(fs.statSync(absoluteAssetPath).size > 0, `Empty local asset ${assetPath}`);
    }
  }
  const audioDirectory = fileURLToPath(new URL("../content/ic-ending/audio/", import.meta.url));
  const manifest = JSON.parse(fs.readFileSync(fileURLToPath(new URL("../content/ic-ending/audio-manifest.json", import.meta.url)), "utf8"));
  assert.deepEqual(manifest.words, IC_ENDING_LESSON.words.map(({ word, definition }) => ({ word, definition })));
  assert.equal(manifest.voice, "en-GB-SoniaNeural");
  assert.equal(manifest.rate, "-15%");
  assert.match(fs.readFileSync(`${audioDirectory}/PROVENANCE.md`, "utf8"), /en-GB-SoniaNeural/);
  assert.match(fs.readFileSync(`${audioDirectory}/PROVENANCE.md`, "utf8"), /-15%/);
  assert.match(fs.readFileSync(fileURLToPath(new URL("../content/ic-ending/images/PROVENANCE.md", import.meta.url)), "utf8"), /TASK-031/);
});

test("TASK-033 AC-114 & AC-115: catalog exposes complete Sonia-backed ‹st› saying /s/ lesson content", () => {
  const expectedWords = ["castle", "bustle", "listen", "thistle", "jostle", "glisten", "bristle", "fasten", "hasten", "moisten", "whistle", "gristle", "christmas", "mistletoe", "chestnut", "nestle", "wrestle", "chasten"];
  assert.deepEqual(ST_SAYING_S_LESSON.words.map(item => item.word), expectedWords);
  assert.equal(ST_SAYING_S_LESSON.topic, "‹st› saying /s/");
  for (const item of ST_SAYING_S_LESSON.words) {
    for (const field of ["definition", "extendedExplanation", "exampleSentence", "hint", "imageAlt", "image", "audio", "definitionAudio"]) assert.ok(item[field], `Missing ${field} for ${item.word}`);
    for (const assetPath of [item.image, item.audio, item.definitionAudio]) {
      const absoluteAssetPath = fileURLToPath(new URL(`../${assetPath}`, import.meta.url));
      assert.ok(fs.existsSync(absoluteAssetPath), `Missing local asset ${assetPath}`);
      assert.ok(fs.statSync(absoluteAssetPath).size > 0, `Empty local asset ${assetPath}`);
    }
  }
  const audioDirectory = fileURLToPath(new URL("../content/st-saying-s/audio/", import.meta.url));
  const manifest = JSON.parse(fs.readFileSync(fileURLToPath(new URL("../content/st-saying-s/audio-manifest.json", import.meta.url)), "utf8"));
  assert.deepEqual(manifest.words, ST_SAYING_S_LESSON.words.map(({ word, definition }) => ({ word, definition })));
  assert.equal(manifest.voice, "en-GB-SoniaNeural");
  assert.equal(manifest.rate, "-15%");
  assert.match(fs.readFileSync(`${audioDirectory}/PROVENANCE.md`, "utf8"), /en-GB-SoniaNeural/);
  assert.match(fs.readFileSync(`${audioDirectory}/PROVENANCE.md`, "utf8"), /-15%/);
  assert.match(fs.readFileSync(fileURLToPath(new URL("../content/st-saying-s/images/PROVENANCE.md", import.meta.url)), "utf8"), /TASK-033/);
});
