// @task TASK-003
// @ac AC-9.1: Multi-Agent Directive Adapters
// @ac AC-9.2: Automated GitHub Task Synchronization & CI Gates
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

test('TASK-003 AC-9.1: All multi-agent directive adapters exist and reference AGENTS.md / DEVELOPMENT_RULES.md', () => {
  const adapters = [
    'CLAUDE.md',
    '.github/copilot-instructions.md',
    '.cursorrules',
    '.windsurfrules',
  ];

  for (const adapter of adapters) {
    const filePath = path.resolve(process.cwd(), adapter);
    assert.ok(fs.existsSync(filePath), `Missing agent directive adapter: ${adapter}`);
    const content = fs.readFileSync(filePath, 'utf8');
    assert.match(content, /AGENTS\.md|DEVELOPMENT_RULES\.md/i, `${adapter} does not link to project guidelines`);
  }
});

test('TASK-003 AC-9.2: GitHub Issue templates and Actions workflows exist', () => {
  const requiredFiles = [
    '.github/ISSUE_TEMPLATE/task.yml',
    '.github/workflows/sync-tasks.yml',
    '.github/workflows/agent-ci.yml',
    '.github/workflows/deploy.yml',
  ];

  for (const reqFile of requiredFiles) {
    const filePath = path.resolve(process.cwd(), reqFile);
    assert.ok(fs.existsSync(filePath), `Missing required GitHub ecosystem file: ${reqFile}`);
  }
});
