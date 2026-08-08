import { chromium } from "playwright";

const url = process.env.REPRO_URL || "http://localhost:8934/";

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 390, height: 844 } }); // iPhone-ish size

page.on("console", (msg) => console.log("[console]", msg.text()));
page.on("pageerror", (err) => console.log("[pageerror]", err.message));

await page.goto(url, { waitUntil: "networkidle" });

// First-run onboarding modal blocks everything; dismiss it with defaults.
const startBtn = page.locator("#btn-start-onboarding");
if (await startBtn.count()) {
  await startBtn.click().catch(() => {});
  await page.waitForTimeout(300);
}

// Navigate: Hub -> Spelling -> Learn mode should be default; find the "Tell me more" button.
// First try clicking the Spelling nav item to get to the spelling section.
await page.click("#btn-enter-word").catch(() => {});
await page.waitForTimeout(500);
await page.screenshot({ path: "C:\\Users\\Andrey\\AppData\\Local\\Temp\\claude\\d--SD\\94438d40-ede1-4c73-9515-3716a0bb9a52\\scratchpad\\step-word-nav.png" });

// A lesson library grid may appear first; pick the default/first lesson card.
const lessonCard = page.locator('[data-lesson-id]');
if (await lessonCard.count()) {
  await lessonCard.first().click().catch(() => {});
  await page.waitForTimeout(400);
}

// Make sure we're in Learn sub-mode (chip) if chips exist.
const learnChip = page.locator('[data-spelling-mode="learn"]');
if (await learnChip.count()) {
  await learnChip.first().click().catch(() => {});
  await page.waitForTimeout(300);
}

await page.screenshot({ path: "C:\\Users\\Andrey\\AppData\\Local\\Temp\\claude\\d--SD\\94438d40-ede1-4c73-9515-3716a0bb9a52\\scratchpad\\step-before-click.png" });

const btn = page.locator("#btn-tell-me-more");
await btn.waitFor({ state: "visible", timeout: 5000 });

console.log("--- BEFORE CLICK ---");
const before = await page.evaluate(() => {
  const m = document.getElementById("modal-tell-me-more");
  const cs = getComputedStyle(m);
  return { display: cs.display, classes: m.className };
});
console.log(before);

await btn.click();
await page.waitForTimeout(300);

console.log("--- AFTER CLICK ---");
const after = await page.evaluate(() => {
  const m = document.getElementById("modal-tell-me-more");
  const cs = getComputedStyle(m);
  const r = m.getBoundingClientRect();
  const centerTop = document.elementFromPoint(innerWidth / 2, innerHeight / 2);

  const chain = [];
  let el = m;
  while (el) {
    const ecs = getComputedStyle(el);
    const er = el.getBoundingClientRect();
    chain.push({
      tag: el.tagName,
      id: el.id || null,
      cls: typeof el.className === "string" ? el.className : null,
      display: ecs.display,
      position: ecs.position,
      overflow: ecs.overflow,
      transform: ecs.transform,
      filter: ecs.filter,
      contain: ecs.contain,
      rect: { w: er.width, h: er.height }
    });
    el = el.parentElement;
  }

  return {
    display: cs.display,
    visibility: cs.visibility,
    opacity: cs.opacity,
    zIndex: cs.zIndex,
    position: cs.position,
    classes: m.className,
    rect: { w: r.width, h: r.height, top: r.top, left: r.left },
    centerElement: centerTop ? (centerTop.id || centerTop.className || centerTop.tagName) : null,
    ancestorChain: chain
  };
});
console.log(JSON.stringify(after, null, 2));

await page.screenshot({ path: "C:\\Users\\Andrey\\AppData\\Local\\Temp\\claude\\d--SD\\94438d40-ede1-4c73-9515-3716a0bb9a52\\scratchpad\\after-click.png" });

await browser.close();
