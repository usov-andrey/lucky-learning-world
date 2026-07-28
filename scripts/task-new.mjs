#!/usr/bin/env node

/**
 * Task Creation Helper Script
 * 
 * Automatically calculates the next available Task ID (TASK-001, TASK-002...),
 * generates tasks/TASK-XXX-<slug>.md from template, and updates tasks/INDEX.md.
 * 
 * Usage:
 *   node scripts/task-new.mjs --title="Add Audio Volume Controls"
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const tasksDir = path.join(rootDir, 'tasks');

const args = process.argv.slice(2).reduce((acc, arg) => {
  const [key, value] = arg.replace(/^--/, '').split('=');
  acc[key] = value || true;
  return acc;
}, {});

const rawTitle = args.title || 'New Task Proposal';
const slug = rawTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

// 1. Scan tasks/ for highest TASK-XXX number
if (!fs.existsSync(tasksDir)) {
  fs.mkdirSync(tasksDir, { recursive: true });
}

const existingFiles = fs.readdirSync(tasksDir).filter(f => f.startsWith('TASK-') && f.endsWith('.md'));
let maxId = 0;

for (const file of existingFiles) {
  const match = file.match(/^TASK-(\d+)/);
  if (match) {
    const num = parseInt(match[1], 10);
    if (num > maxId) maxId = num;
  }
}

const nextIdNum = maxId + 1;
const nextTaskId = `TASK-${String(nextIdNum).padStart(3, '0')}`;
const taskFileName = `${nextTaskId}-${slug}.md`;
const newTaskFilePath = path.join(tasksDir, taskFileName);

console.log(`📌 Generating next available task: ${nextTaskId} ("${rawTitle}")`);

// 2. Read template
const templatePath = path.join(tasksDir, 'templates', 'TASK-TEMPLATE.md');
let templateContent = fs.existsSync(templatePath) 
  ? fs.readFileSync(templatePath, 'utf8') 
  : `---
id: ${nextTaskId}
title: "${rawTitle}"
status: PROPOSED
version: v1.0.0
created: ${new Date().toISOString().split('T')[0]}
github_issue: null
---

# ${nextTaskId}: ${rawTitle}

## 💡 1. Idea & Proposal
- Context and proposed solution.

## 📋 2. Acceptance Criteria (AC)
- [ ] **AC-1**: First condition.

## 🧪 3. Test Coverage
- \`tests/task-xxx.test.mjs\`

## 💻 4. Impacted Code Files
- \`app.js\`

## 📦 5. Release & Artifacts
- Version: \`v1.0.0\`
- Release Notes: \`docs/releases/v1.0.0.md\`
`;

const createdDate = new Date().toISOString().split('T')[0];
let newContent = templateContent
  .replace(/TASK-XXX/g, nextTaskId)
  .replace(/\[Short Task Title\]/g, rawTitle)
  .replace(/YYYY-MM-DD/g, createdDate);

fs.writeFileSync(newTaskFilePath, newContent, 'utf8');
console.log(`  ✓ Created ${path.relative(rootDir, newTaskFilePath)}`);

// 3. Re-sync tasks/INDEX.md
try {
  execSync('node scripts/sync-issues.mjs', { cwd: rootDir, stdio: 'inherit' });
} catch (e) {
  console.warn(`  ⚠️ Could not auto-sync index: ${e.message}`);
}

console.log(`🎉 Task ${nextTaskId} created successfully!`);
