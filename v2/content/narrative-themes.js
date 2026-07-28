// Narrative Theme Data Catalog for Pokémon Adventure and Comic Quest.
// All copy is 100% English, positive, and encouraging (no negative terms).

export const NARRATIVE_THEMES = {
  pokemon: {
    "session.started": {
      caption: "Trainer Challenge!",
      speech: "A wild math duel approaches! Get ready!",
      actionWord: "READY!",
      effect: "reveal-pulse",
      tone: "neutral"
    },
    "question.presented": {
      caption: "Wild Encounter",
      speech: "Solve the fact to reveal the mystery pet!",
      actionWord: "FOCUS!",
      effect: "none",
      tone: "neutral"
    },
    "answer.correct": {
      caption: "Direct Hit!",
      speech: "Great move! The mystery Pokémon is getting clearer!",
      actionWord: "SUPER!",
      effect: "move-impact",
      tone: "success"
    },
    "answer.incorrect": {
      caption: "Trainer Tip",
      speech: "Let's review this math fact together!",
      actionWord: "TRY!",
      effect: "none",
      tone: "coach"
    },
    "correction.shown": {
      caption: "Fact Guide",
      speech: "Recite the fact aloud to master it!",
      actionWord: "LISTEN!",
      effect: "none",
      tone: "coach"
    },
    "correction.confirmed": {
      caption: "Fact Mastered!",
      speech: "Awesome training! Power restored!",
      actionWord: "POWER UP!",
      effect: "move-impact",
      tone: "success"
    },
    "item.requeued": {
      caption: "Requeued for Practice",
      speech: "No worries! We'll try this fact again soon.",
      actionWord: "AGAIN!",
      effect: "none",
      tone: "coach"
    },
    "milestone.reached": {
      caption: "Badge Progress!",
      speech: "You're charging up! Silhouette almost revealed!",
      actionWord: "CHARGING!",
      effect: "reveal-pulse",
      tone: "milestone"
    },
    "session.completed": {
      caption: "Victory Duel!",
      speech: "Incredible battle! You earned your stars!",
      actionWord: "VICTORY!",
      effect: "capture-flash",
      tone: "celebrate"
    },
    "reward.new": {
      caption: "New Teammate!",
      speech: "{name} joined your Pokédex collection!",
      actionWord: "RESCUED!",
      effect: "capture-flash",
      tone: "celebrate"
    },
    "reward.levelup": {
      caption: "Evolution!",
      speech: "{name} powered up to Level {level}!",
      actionWord: "EVOLVE!",
      effect: "evolution-glow",
      tone: "celebrate"
    }
  },
  comic: {
    "session.started": {
      caption: "Issue #1 Begins!",
      speech: "Open the comic book and complete the story panels!",
      actionWord: "ACTION!",
      effect: "page-turn",
      tone: "neutral"
    },
    "question.presented": {
      caption: "New Panel Scene",
      speech: "Fill in the speech bubble with the correct answer!",
      actionWord: "DRAW!",
      effect: "none",
      tone: "neutral"
    },
    "answer.correct": {
      caption: "Panel Complete!",
      speech: "BAM! You solved the panel perfectly!",
      actionWord: "BAM!",
      effect: "panel-stamp",
      tone: "success"
    },
    "answer.incorrect": {
      caption: "Fix the Panel",
      speech: "Your helper has a clue for this scene!",
      actionWord: "CLUE!",
      effect: "helper-bubble",
      tone: "coach"
    },
    "correction.shown": {
      caption: "Comic Clue",
      speech: "Read the correct fact to repair the panel!",
      actionWord: "CHECK!",
      effect: "helper-bubble",
      tone: "coach"
    },
    "correction.confirmed": {
      caption: "Panel Repaired!",
      speech: "POW! Story line restored!",
      actionWord: "POW!",
      effect: "panel-stamp",
      tone: "success"
    },
    "item.requeued": {
      caption: "Requeued Scene",
      speech: "This panel will reappear later in the issue!",
      actionWord: "REPLAY!",
      effect: "none",
      tone: "coach"
    },
    "milestone.reached": {
      caption: "Comic Page Finished!",
      speech: "KAPOW! Page complete! Turning to the next page!",
      actionWord: "KAPOW!",
      effect: "page-turn",
      tone: "milestone"
    },
    "session.completed": {
      caption: "Issue Completed!",
      speech: "BOOM! You finished the entire comic book issue!",
      actionWord: "BOOM!",
      effect: "issue-complete",
      tone: "celebrate"
    },
    "reward.new": {
      caption: "New Hero!",
      speech: "{name} joined the Comic Crew!",
      actionWord: "RECRUITED!",
      effect: "crew-join",
      tone: "celebrate"
    },
    "reward.levelup": {
      caption: "Hero Level Up!",
      speech: "{name} unlocked a new comic form (Level {level})!",
      actionWord: "LEVEL UP!",
      effect: "crew-join",
      tone: "celebrate"
    }
  }
};
