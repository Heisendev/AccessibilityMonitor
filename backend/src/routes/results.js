import { Router } from 'express';
import db from '../db.js';

const router = Router();

// Latest violation counts per URL (for dashboard cards)
router.get('/latest', (_req, res) => {
  const latestRun = db.prepare("SELECT id FROM test_runs WHERE status = 'completed' ORDER BY finished_at DESC LIMIT 1").get();
  if (!latestRun) return res.json([]);

  const rows = db.prepare(`
    SELECT
      u.id, u.name, u.url,
      r.started_at as run_date,
      SUM(CASE WHEN v.impact = 'critical' THEN v.nodes_count ELSE 0 END) as critical,
      SUM(CASE WHEN v.impact = 'serious' THEN v.nodes_count ELSE 0 END) as serious,
      SUM(CASE WHEN v.impact = 'moderate' THEN v.nodes_count ELSE 0 END) as moderate,
      SUM(CASE WHEN v.impact = 'minor' THEN v.nodes_count ELSE 0 END) as minor,
      COUNT(v.id) as total_violations
    FROM urls u
    LEFT JOIN violations v ON v.url_id = u.id AND v.run_id = ?
    LEFT JOIN test_runs r ON r.id = ?
    WHERE u.active = 1
    GROUP BY u.id
    ORDER BY total_violations DESC
  `).all(latestRun.id, latestRun.id);

  res.json(rows);
});

// Trend data: violation counts per run for a specific URL
router.get('/trend/:urlId', (req, res) => {
  const rows = db.prepare(`
    SELECT
      r.id as run_id,
      r.started_at as run_date,
      SUM(CASE WHEN v.impact = 'critical' THEN v.nodes_count ELSE 0 END) as critical,
      SUM(CASE WHEN v.impact = 'serious' THEN v.nodes_count ELSE 0 END) as serious,
      SUM(CASE WHEN v.impact = 'moderate' THEN v.nodes_count ELSE 0 END) as moderate,
      SUM(CASE WHEN v.impact = 'minor' THEN v.nodes_count ELSE 0 END) as minor,
      COUNT(v.id) as total_violations
    FROM test_runs r
    LEFT JOIN violations v ON v.run_id = r.id AND v.url_id = ?
    WHERE r.status = 'completed'
    GROUP BY r.id
    ORDER BY r.started_at ASC
  `).all(req.params.urlId);
  res.json(rows);
});

// All violations for a URL from the latest completed run
router.get('/violations/:urlId', (req, res) => {
  const latestRun = db.prepare(`
    SELECT r.id FROM test_runs r
    JOIN violations v ON v.run_id = r.id AND v.url_id = ?
    WHERE r.status = 'completed'
    ORDER BY r.finished_at DESC LIMIT 1
  `).get(req.params.urlId);

  if (!latestRun) return res.json([]);

  const violations = db.prepare(`
    SELECT * FROM violations
    WHERE run_id = ? AND url_id = ?
    ORDER BY
      CASE impact WHEN 'critical' THEN 1 WHEN 'serious' THEN 2 WHEN 'moderate' THEN 3 ELSE 4 END
  `).all(latestRun.id, req.params.urlId);

  res.json(violations);
});

export default router;
