import { defineConfig } from 'cypress';
import db from './src/db.js';
import { getCurrentRunId } from './src/runner.js';

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
          const runId = getCurrentRunId();
          if (!runId) {
            console.warn('[cypress task] No active run ID — violations not saved');
            return null;
          }

          const insert = db.prepare(`
            INSERT INTO violations (run_id, url_id, violation_id, impact, description, help, help_url, nodes_count)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
          `);

          const insertMany = db.transaction((items) => {
            for (const v of items) {
              insert.run(runId, urlId, v.id, v.impact, v.description, v.help, v.helpUrl, v.nodesCount);
            }
          });

          insertMany(violations);
          console.log(`[cypress task] Saved ${violations.length} violations for url_id=${urlId}`);
          return null;
        },
      });
    },
  },
});
