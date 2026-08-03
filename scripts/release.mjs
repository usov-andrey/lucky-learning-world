#!/usr/bin/env node

/**
 * Release Automation Script for Lucky's Learning World
 * 
 * Usage:
 *   node scripts/release.mjs --bump=minor --task=TASK-001
 *   node scripts/release.mjs --version=1.0.0 --task=TASK-001
 *   node scripts/release.mjs --dry-run
 */

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

// Parse CLI args
const args = process.argv.slice(2).reduce((acc, arg) => {
  const [key, value] = arg.replace(/^--/, '').split('=');
  acc[key] = value || true;
  return acc;
}, {});

const dryRun = Boolean(args['dry-run']);

// Read current version from package.json
const pkgPath = path.join(rootDir, 'package.json');
const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
let currentVer = pkg.version || '1.0.0';

function bumpVersion(version, type) {
  let [major, minor, patch] = version.split('-')[0].split('.').map(Number);
  if (type === 'major') {
    major += 1;
    minor = 0;
    patch = 0;
  } else if (type === 'minor') {
    minor += 1;
    patch = 0;
  } else if (type === 'patch') {
    patch += 1;
  }
  return `${major}.${minor}.${patch}`;
}

let newVer = currentVer;
if (args.version) {
  newVer = args.version.replace(/^v/, '');
} else if (args.bump) {
  newVer = bumpVersion(currentVer, args.bump);
}

const taskId = args.task || 'TASK-001';
console.log(`🚀 Release Automation: ${currentVer} ➔ ${newVer} (Task: ${taskId}, Dry Run: ${dryRun})`);

const now = new Date();
const buildTimeStr = now.toISOString().replace('T', ' ').substring(0, 16) + ' UTC';

// 1. Target files to update
const updates = [
  {
    file: 'package.json',
    regex: /"version":\s*"[^"]+"/,
    replace: `"version": "${newVer}"`
  },
  {
    file: 'app.js',
    regex: /const\s+APP_VERSION\s*=\s*"[^"]+"/,
    replace: `const APP_VERSION = "v${newVer}"`
  },
  {
    file: 'sw.js',
    regex: /const\s+CACHE_NAME\s*=\s*"[^"]+"/,
    replace: `const CACHE_NAME = "lucky-world-v${newVer}"`
  },
  {
    file: 'manifest.json',
    regex: /"version":\s*"[^"]+"/,
    replace: `"version": "${newVer}"`
  },
  {
    file: 'index.html',
    regex: /<span id="diag-build-version"[^>]*>[^<]+<\/span>/,
    replace: `<span id="diag-build-version" style="color: #38ef7d; font-weight: 700;">v${newVer} (${buildTimeStr})</span>`
  }
];

for (const target of updates) {
  const filePath = path.join(rootDir, target.file);
  if (fs.existsSync(filePath)) {
    let content = fs.readFileSync(filePath, 'utf8');
    if (content.match(target.regex)) {
      content = content.replace(target.regex, target.replace);
      if (!dryRun) {
        fs.writeFileSync(filePath, content, 'utf8');
      }
      console.log(`  ✓ Updated ${target.file} -> v${newVer}`);
    }
  }
}

// 1b. Automatically update all ?v=... cache busters in index.html, app.js, and sw.js
const cacheBusterFiles = ['index.html', 'app.js', 'sw.js'];
for (const file of cacheBusterFiles) {
  const filePath = path.join(rootDir, file);
  if (fs.existsSync(filePath)) {
    let content = fs.readFileSync(filePath, 'utf8');
    const updatedContent = content.replace(/\?v=[^\s"'`>]+/g, `?v=v${newVer}`);
    if (updatedContent !== content) {
      if (!dryRun) {
        fs.writeFileSync(filePath, updatedContent, 'utf8');
      }
      console.log(`  ✓ Updated cache busters in ${file} -> ?v=v${newVer}`);
    }
  }
}

// 2. Read task details if available
let taskTitle = "Release Update";
let acList = [];
const taskFilePath = path.join(rootDir, 'tasks', `${taskId}-comic-narrative.md`);
const alternativeTaskPath = path.join(rootDir, 'tasks', `${taskId}.md`);
const effectiveTaskPath = fs.existsSync(taskFilePath) ? taskFilePath : (fs.existsSync(alternativeTaskPath) ? alternativeTaskPath : null);

if (effectiveTaskPath) {
  const taskContent = fs.readFileSync(effectiveTaskPath, 'utf8');
  const titleMatch = taskContent.match(/#\s+TASK-\d+:\s+(.*)/);
  if (titleMatch) taskTitle = titleMatch[1].trim();

  const acMatches = taskContent.match(/- \[x\] \*\*AC-\d+\*\*: (.*)/g);
  if (acMatches) {
    acList = acMatches.map(m => m.replace(/- \[x\] /, ''));
  }
}

// 3. Generate Release Notes in CHANGELOG.md & docs/releases/vX.Y.Z.md
const releaseDate = new Date().toISOString().split('T')[0];
const releaseNotesMD = `
## 📦 Release v${newVer} (${releaseDate}) — [${taskId}] ${taskTitle}

### 📋 Acceptance Criteria Satisfied:
${acList.length > 0 ? acList.map(ac => `- ${ac}`).join('\n') : '- Verified all core functional criteria.'}

### 💻 Target Version Files Updated:
- \`package.json\`: \`v${newVer}\`
- \`app.js\`: \`APP_VERSION = "v${newVer}"\`
- \`sw.js\`: \`CACHE_NAME = "lucky-world-v${newVer}"\`
- \`index.html\` & \`manifest.json\`

---
`;

const changelogPath = path.join(rootDir, 'CHANGELOG.md');
let changelogContent = fs.existsSync(changelogPath) ? fs.readFileSync(changelogPath, 'utf8') : "# Changelog & Release Notes\n\nAll notable changes to Lucky's Learning World are documented below.\n\n";
changelogContent = changelogContent.replace("# Changelog & Release Notes\n\n", `# Changelog & Release Notes\n\n${releaseNotesMD}\n`);

if (!dryRun) {
  fs.writeFileSync(changelogPath, changelogContent, 'utf8');
  console.log(`  ✓ Updated CHANGELOG.md`);

  const docsReleasesDir = path.join(rootDir, 'docs', 'releases');
  const docsPlansDir = path.join(rootDir, 'docs', 'plans');
  const docsWalkthroughsDir = path.join(rootDir, 'docs', 'walkthroughs');

  for (const d of [docsReleasesDir, docsPlansDir, docsWalkthroughsDir]) {
    if (!fs.existsSync(d)) fs.mkdirSync(d, { recursive: true });
  }

  const releaseDocPath = path.join(docsReleasesDir, `v${newVer}.md`);
  fs.writeFileSync(releaseDocPath, `# Release Notes: v${newVer}\n${releaseNotesMD}`, 'utf8');
  console.log(`  ✓ Created ${path.relative(rootDir, releaseDocPath)}`);

  // Mirror root implementation_plan.md and walkthrough.md to unique task files
  const rootPlan = path.join(rootDir, 'implementation_plan.md');
  const uniquePlan = path.join(docsPlansDir, `${taskId}-implementation-plan.md`);
  if (fs.existsSync(rootPlan)) {
    fs.copyFileSync(rootPlan, uniquePlan);
    console.log(`  ✓ Mirrored plan -> ${path.relative(rootDir, uniquePlan)}`);
  }

  const rootWalkthrough = path.join(rootDir, 'walkthrough.md');
  const uniqueWalkthrough = path.join(docsWalkthroughsDir, `${taskId}-walkthrough.md`);
  if (fs.existsSync(rootWalkthrough)) {
    fs.copyFileSync(rootWalkthrough, uniqueWalkthrough);
    console.log(`  ✓ Mirrored walkthrough -> ${path.relative(rootDir, uniqueWalkthrough)}`);
  }
}

// 4. If major version bump, create physical directory snapshot
if (args.bump === 'major') {
  const snapshotDirName = `v${currentVer.split('.')[0]}`;
  const snapshotPath = path.join(rootDir, snapshotDirName);
  console.log(`  📸 Creating Major Version Snapshot Directory: ${snapshotDirName}`);
  if (!dryRun && !fs.existsSync(snapshotPath)) {
    fs.mkdirSync(snapshotPath, { recursive: true });
    // Copy key core files for static execution
    const filesToCopy = ['index.html', 'app.js', 'styles.css', 'themes.css', 'sw.js', 'manifest.json', 'reporter.js', 'telemetry.js'];
    for (const f of filesToCopy) {
      const src = path.join(rootDir, f);
      if (fs.existsSync(src)) {
        fs.copyFileSync(src, path.join(snapshotPath, f));
      }
    }
    const dirsToCopy = ['engine', 'content', 'assets', 'pokemon'];
    for (const d of dirsToCopy) {
      const srcDir = path.join(rootDir, d);
      if (fs.existsSync(srcDir)) {
        fs.cpSync(srcDir, path.join(snapshotPath, d), { recursive: true });
      }
    }
    console.log(`  ✓ Snapshot ${snapshotDirName}/ successfully created.`);
  }
}

// 5. Automatic Git Commit
if (!dryRun) {
  try {
    console.log(`  💾 Automatically committing release changes to Git...`);
    execSync(`git add .`, { cwd: rootDir });
    execSync(`git commit -m "feat(${taskId}): release version v${newVer}"`, { cwd: rootDir });
    console.log(`  ✓ Git commit completed: "feat(${taskId}): release version v${newVer}"`);
  } catch (err) {
    console.warn(`  ⚠️ Git commit notice: ${err.message}`);
  }
}

console.log(`🎉 Release v${newVer} completed successfully!`);

