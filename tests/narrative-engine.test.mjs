import test from "node:test";
import assert from "node:assert/strict";
import { NarrativeEngine } from "../engine/narrative-engine.js";

// @task TASK-001
// @ac AC-4: Full narrative event coverage
// @ac AC-5: Dynamic narrative page calculation formula
test("TASK-001 AC-4 AC-5: NarrativeEngine resolves 'comic' answer.correct with page and panel calculation", () => {
  const event = {
    type: "answer.correct",
    context: {
      realm: "math",
      itemIndex: 5, // item index 5 = 6th question -> Page 2, Panel 2
      totalItems: 12
    }
  };

  const vm = NarrativeEngine.resolveViewModel(event, "comic");
  assert.equal(vm.themeId, "comic");
  assert.equal(vm.eventType, "answer.correct");
  assert.equal(vm.tone, "success");
  assert.equal(vm.caption, "Panel Complete!");
  assert.equal(vm.actionWord, "BAM!");
  assert.equal(vm.progress.page, 2);
  assert.equal(vm.progress.current, 2);
  assert.equal(vm.progress.totalPages, 3);
});

// @task TASK-001
// @ac AC-5: Dynamic page calculation for arbitrary Spelling word count
test("TASK-001 AC-5: NarrativeEngine dynamic page calculation for arbitrary Spelling word count", () => {
  const event = {
    type: "answer.correct",
    context: {
      realm: "spelling",
      itemIndex: 7, // item index 7 = 8th word -> Page 2, Panel 2 (6 per page)
      totalItems: 18
    }
  };

  const vm = NarrativeEngine.resolveViewModel(event, "comic");
  assert.equal(vm.progress.page, 2);
  assert.equal(vm.progress.current, 2);
  assert.equal(vm.progress.totalPages, 3);
});

// @task TASK-001
// @ac AC-4: Event interpolation for reward.levelup
test("TASK-001 AC-4: NarrativeEngine interpolates character name and level for reward.levelup", () => {
  const event = {
    type: "reward.levelup",
    context: {
      characterName: "Officer Paws",
      level: 3
    }
  };

  const vm = NarrativeEngine.resolveViewModel(event, "comic");
  assert.equal(vm.caption, "Hero Level Up!");
  assert.ok(vm.speech.includes("Officer Paws"));
  assert.ok(vm.speech.includes("Level 3"));
});

// @task TASK-001
// @ac AC-4: Handles item.requeued and correction events
test("TASK-001 AC-4: NarrativeEngine handles item.requeued and correction events", () => {
  const requeuedEvt = { type: "item.requeued", context: { realm: "math" } };
  const vmRequeued = NarrativeEngine.resolveViewModel(requeuedEvt, "pokemon");
  assert.equal(vmRequeued.caption, "Requeued for Practice");

  const confirmedEvt = { type: "correction.confirmed", context: { realm: "math" } };
  assert.equal(NarrativeEngine.resolveViewModel(confirmedEvt, "comic").caption, "Panel Repaired!");
});

