# TASK-037 walkthrough

Schwa ‹el› contains the 18 words from the schoolbook, from **level** to **scoundrel**. Each card has an English definition, a longer explanation, an example, a hint and an original illustration. The new lesson opens by default for a fresh profile. Returning players can choose it under Word Realm.

## Checks before publication

- All 151 unit and integration tests passed. Coverage reached 83.27% of lines, 66.35% of branches and 74.74% of functions.
- Chromium completed Learn navigation through the 18 cards, Digital Test, Paper Test and the Tiles game.
- All 18 illustrations were rendered and inspected. FFmpeg decoded all 36 British Sonia recordings generated at -15% with edge-tts 7.3.1.

## Publication

GitHub Pages published v1.16.0 from commit `912c2a192da990f68debfd28bb54743d175b2501`. The public site served the matching entry point, application, version metadata, service worker, lesson catalogue, audio manifest and all 54 lesson assets. [Deployment run](https://github.com/usov-andrey/lucky-learning-world/actions/runs/44764425338)
