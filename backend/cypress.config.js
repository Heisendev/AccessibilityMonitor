import { defineConfig } from 'cypress';
import { existsSync, readFileSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const violationsFile = join(__dirname, 'cypress/fixtures/violations-pending.json');

export default defineConfig({
  e2e: {
    supportFile: 'cypress/support/e2e.js',
    fixturesFolder: 'cypress/fixtures',
    video: false,
    screenshotOnRunFailure: false,
    defaultCommandTimeout: 30000,
    pageLoadTimeout: 60000,
    setupNodeEvents(on) {
      on('task', {
        reportViolations({ urlId, violations }) {
          const runId = process.env.MONITOR_RUN_ID;
          if (!runId) {
            console.warn('[cypress task] No MONITOR_RUN_ID — violations not saved');
            return null;
          }
/* 
          const existing = existsSync(violationsFile)
            ? JSON.parse(readFileSync(violationsFile, 'utf8'))
            : [];

          existing.push(...violations.map((v) => ({ ...v, urlId, runId })));
          writeFileSync(violationsFile, JSON.stringify(existing)); */

          console.log(`[cypress task] Queued ${violations.length} violations for url_id=${urlId}`);
          return null;
        },
      });
    },
  },
});
