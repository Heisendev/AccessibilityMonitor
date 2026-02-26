import cron from 'node-cron';
import db from './db.js';
import { triggerRun } from './runner.js';

// Every Monday at 8:00 AM
cron.schedule('0 8 * * 1', async () => {
  console.log('[cron] Starting weekly accessibility run...');

  const existing = db.prepare("SELECT id FROM test_runs WHERE status = 'running'").get();
  if (existing) {
    console.log('[cron] Skipping — a run is already in progress');
    return;
  }

  const runId = db.prepare("INSERT INTO test_runs (status) VALUES ('running')").run().lastInsertRowid;
  try {
    await triggerRun(runId);
    console.log(`[cron] Run ${runId} completed`);
  } catch (err) {
    console.error(`[cron] Run ${runId} failed:`, err);
  }
});

console.log('[cron] Weekly scheduler active — runs every Monday at 08:00');
