import { Router } from 'express';
import db from '../db.js';
import { triggerRun } from '../runner.js';

const router = Router();

router.get('/', (_req, res) => {
  const runs = db.prepare(`
    SELECT r.*, COUNT(DISTINCT v.url_id) as urls_tested,
           COUNT(v.id) as total_violations
    FROM test_runs r
    LEFT JOIN violations v ON v.run_id = r.id
    GROUP BY r.id
    ORDER BY r.started_at DESC
    LIMIT 50
  `).all();
  res.json(runs);
});

router.post('/', async (_req, res) => {
  const existing = db.prepare("SELECT id FROM test_runs WHERE status = 'running'").get();
  if (existing) return res.status(409).json({ error: 'A run is already in progress' });

  const runId = db.prepare("INSERT INTO test_runs (status) VALUES ('running')").run().lastInsertRowid;
  res.status(202).json({ runId, status: 'running' });

  // Fire and forget — updates run status when done
  triggerRun(runId).catch(console.error);
});

export default router;
