#!/usr/bin/env node

/**
 * Task Index & GitHub Issues Sync Script
 * 
 * Usage:
 *   node scripts/sync-issues.mjs
 *   node scripts/sync-issues.mjs --github
 */

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const tasksDir = path.join(rootDir, 'tasks');
const args = process.argv.slice(2);
const syncGithub = args.includes('--github');

console.log("🔍 Scanning task directory...");

if (!fs.existsSync(tasksDir)) {
  fs.mkdirSync(tasksDir, { recursive: true });
}

const taskFiles = fs.readdirSync(tasksDir).filter(f => f.startsWith('TASK-') && f.endsWith('.md'));
const taskRecords = [];

for (const file of taskFiles) {
  const filePath = path.join(tasksDir, file);
  const content = fs.readFileSync(filePath, 'utf8');

  const idMatch = content.match(/id:\s*(TASK-\d+)/);
  const titleMatch = content.match(/title:\s*"([^"]+)"/) || content.match(/#\s+TASK-\d+:\s+(.*)/);
  const statusMatch = content.match(/status:\s*(\w+)/);
  const versionMatch = content.match(/version:\s*([^\s]+)/);
  const issueMatch = content.match(/github_issue:\s*([^\s]+)/);
  const acMatches = content.match(/- \[[x ]\] \*\*AC-\d+\*\*/g);
  const testMatches = content.match(/`tests\/[^`]+\.mjs`/g);

  const taskId = idMatch ? idMatch[1] : file.split('-')[0];
  const title = titleMatch ? titleMatch[1].trim() : file;
  const status = statusMatch ? statusMatch[1] : 'PROPOSED';
  const version = versionMatch ? versionMatch[1] : 'v1.0.0';
  const issue = issueMatch && issueMatch[1] !== 'null' ? issueMatch[1] : '-';
  const acCount = acMatches ? acMatches.length : 0;
  const primaryTest = testMatches && testMatches[0] ? testMatches[0].replace(/`/g, '') : '-';

  taskRecords.push({
    file,
    taskId,
    title,
    status,
    version,
    issue,
    acCount,
    primaryTest,
    filePath
  });
}

// Sort by Task ID
taskRecords.sort((a, b) => a.taskId.localeCompare(b.taskId, undefined, { numeric: true }));

// Re-generate tasks/INDEX.md
const indexMD = `# Lucky's Learning World — Master Task Index

This table is automatically generated and synchronized by \`node scripts/sync-issues.mjs\`.
Every feature, bugfix, or plan MUST have a corresponding task file in \`tasks/\`.

| Task ID | Title | Status | Version | AC Count | Primary Test File | GitHub Issue |
|---|---|---|---|---|---|---|
${taskRecords.map(t => `| [${t.taskId}](file:///${t.filePath.replace(/\\/g, '/')}) | ${t.title} | ${t.status} | ${t.version} | ${t.acCount} ACs | \`${t.primaryTest}\` | ${t.issue} |`).join('\n')}

---

## Task Lifecycles
- \`PROPOSED\`: Plan drafted and pending review.
- \`ACCEPTED\`: Acceptance Criteria (AC) defined and approved.
- \`IN_PROGRESS\`: Tests written and implementation under development.
- \`TESTED\`: All unit/integration tests passing.
- \`RELEASED\`: Version bumped, release notes published, and code deployed.
`;

const indexPath = path.join(tasksDir, 'INDEX.md');
fs.writeFileSync(indexPath, indexMD, 'utf8');
console.log(`  ✓ Successfully updated tasks/INDEX.md (${taskRecords.length} tasks indexed).`);

// Optional GitHub Issues Sync via gh CLI
if (syncGithub) {
  console.log("🌐 Attempting GitHub Issues sync via gh CLI...");
  try {
    for (const t of taskRecords) {
      if (t.issue === '-') {
        console.log(`  ➕ Creating GitHub Issue for ${t.taskId}: "${t.title}"...`);
        const cmd = `gh issue create --title "${t.taskId}: ${t.title}" --body "Task Specification: tasks/${t.file}\nTarget Version: ${t.version}" --label "task"`;
        const output = execSync(cmd, { cwd: rootDir, encoding: 'utf8' }).trim();
        const issueUrlMatch = output.match(/\/issues\/(\d+)/);
        if (issueUrlMatch) {
          const issueNum = `#${issueUrlMatch[1]}`;
          console.log(`    ✓ Created GitHub Issue ${issueNum}`);
          let content = fs.readFileSync(t.filePath, 'utf8');
          content = content.replace(/github_issue:\s*null/, `github_issue: "${issueNum}"`);
          fs.writeFileSync(t.filePath, content, 'utf8');
        }
      }
    }
  } catch (err) {
    console.warn(`  ⚠️ GitHub CLI (gh) sync warning: ${err.message}`);
    console.warn("  Make sure `gh` CLI is installed and authenticated (`gh auth login`). Local task files remain intact.");
  }
}
