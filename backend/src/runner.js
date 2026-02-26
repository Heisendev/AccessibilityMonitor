import cypress from 'cypress';
import { writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import db from './db.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const fixturesDir = join(__dirname, '../cypress/fixtures');

// Shared state: current run ID for the Cypress task to use
let currentRunId = null;

export function getCurrentRunId() {
  return currentRunId;
}

export async function triggerRun(runId) {
  currentRunId = runId;

  // Write active URLs to fixture file for Cypress to read
  const urls = db.prepare('SELECT id, name, url FROM urls WHERE active = 1').all();
  writeFileSync(join(fixturesDir, 'urls.json'), JSON.stringify(urls, null, 2));

  try {
    await cypress.run({
      spec: 'cypress/e2e/axe-audit.cy.js',
      config: {
        video: false,
        screenshotOnRunFailure: false,
      },
    });

    db.prepare("UPDATE test_runs SET status = 'completed', finished_at = datetime('now') WHERE id = ?").run(runId);
  } catch (err) {
    console.error('Cypress run failed:', err);
    db.prepare("UPDATE test_runs SET status = 'failed', finished_at = datetime('now') WHERE id = ?").run(runId);
  } finally {
    currentRunId = null;
  }
}
