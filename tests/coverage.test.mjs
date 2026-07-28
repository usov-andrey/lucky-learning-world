// @task TASK-002
// @ac AC-8.2: Test Traceability & Legacy Waiver Enforcement
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const LEGACY_WAIVER_LIST = new Set([
  'catalog.test.mjs',
  'comic-catalog.test.mjs',
  'engine.test.mjs',
  'integration-imports.test.mjs',
  'narrative-integration.test.mjs',
  'progression.test.mjs',
  'reward-engine.test.mjs',
  'spelling-engine.test.mjs',
  'theme-integration.test.mjs',
  'theme-settings.test.mjs',
  'ui-smoke.test.mjs',
]);

test('TASK-002 AC-8.1: package.json contains coverage and coverage:gate scripts', () => {
  const pkgPath = path.resolve(process.cwd(), 'package.json');
  const pkgContent = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));

  assert.ok(pkgContent.scripts['test:coverage'], 'package.json missing test:coverage script');
  assert.ok(pkgContent.scripts['test:coverage:gate'], 'package.json missing test:coverage:gate script');
  assert.match(pkgContent.scripts['test:coverage'], /--experimental-test-coverage/);
  assert.match(pkgContent.scripts['test:coverage:gate'], /--test-coverage-lines=\d+/);
});

test('TASK-002 AC-8.2: non-waived test files contain valid @task and @ac annotations', () => {
  const testsDir = path.resolve(process.cwd(), 'tests');
  const files = fs.readdirSync(testsDir).filter(f => f.endsWith('.test.mjs'));

  const TASK_TAG_REGEX = /\/\/\s*@task\s+TASK-\d+/i;
  const AC_TAG_REGEX = /\/\/\s*@ac\s+AC-\d+(\.\d+)?/i;

  const violations = [];

  for (const file of files) {
    if (LEGACY_WAIVER_LIST.has(file)) {
      continue;
    }

    const filePath = path.join(testsDir, file);
    const content = fs.readFileSync(filePath, 'utf8');

    const hasTaskTag = TASK_TAG_REGEX.test(content);
    const hasAcTag = AC_TAG_REGEX.test(content);

    if (!hasTaskTag || !hasAcTag) {
      violations.push({
        file,
        hasTaskTag,
        hasAcTag,
      });
    }
  }

  assert.deepEqual(
    violations,
    [],
    `Test files found lacking mandatory @task or @ac annotations: ${JSON.stringify(violations)}`
  );
});

test('TASK-002 AC-8.2: legacy waiver table is strictly bounded', () => {
  const testsDir = path.resolve(process.cwd(), 'tests');
  const actualFiles = new Set(fs.readdirSync(testsDir).filter(f => f.endsWith('.test.mjs')));

  for (const waivedFile of LEGACY_WAIVER_LIST) {
    assert.ok(
      actualFiles.has(waivedFile),
      `Waiver table contains non-existent file: ${waivedFile}`
    );
  }
});
