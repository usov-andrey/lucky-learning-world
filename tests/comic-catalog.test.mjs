import test from "node:test";
import assert from "node:assert/strict";
import fs from "fs";
import path from "path";
import { CHARACTERS } from "../content/characters.js";
import { COMIC_CHARACTERS, getComicCharacterById } from "../content/comic-characters.js";

test("Comic Catalog: covers 100% of Pokémon character IDs (20 characters)", () => {
  assert.equal(CHARACTERS.length, 20);

  for (const pokemonChar of CHARACTERS) {
    const comicChar = getComicCharacterById(pokemonChar.id);
    assert.ok(comicChar, `Missing comic character mapping for ID: ${pokemonChar.id}`);
    assert.ok(comicChar.name, `Comic character ${pokemonChar.id} missing name`);
    assert.ok(comicChar.art && comicChar.art.src, `Comic character ${pokemonChar.id} missing art src`);
  }
});

test("Comic Catalog: artwork files exist on disk for all comic characters and stages", () => {
  for (const pokemonChar of CHARACTERS) {
    const comicChar = getComicCharacterById(pokemonChar.id);
    const stages = comicChar.art.stages;
    assert.ok(Array.isArray(stages) && stages.length > 0, `Stages array invalid for ${pokemonChar.id}`);

    for (const stagePath of stages) {
      const fullPath = path.resolve(stagePath);
      assert.ok(fs.existsSync(fullPath), `Comic SVG asset file missing at: ${stagePath}`);
    }
  }
});
