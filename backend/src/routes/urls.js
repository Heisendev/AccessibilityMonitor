import { Router } from 'express';
import db from '../db.js';

const router = Router();

router.get('/', (_req, res) => {
  const urls = db.prepare('SELECT * FROM urls ORDER BY created_at DESC').all();
  res.json(urls);
});

router.post('/', (req, res) => {
  const { name, url } = req.body;
  if (!name || !url) return res.status(400).json({ error: 'name and url are required' });
  try {
    const result = db.prepare('INSERT INTO urls (name, url) VALUES (?, ?)').run(name, url);
    const created = db.prepare('SELECT * FROM urls WHERE id = ?').get(result.lastInsertRowid);
    res.status(201).json(created);
  } catch (err) {
    if (err.code === 'SQLITE_CONSTRAINT_UNIQUE') {
      return res.status(409).json({ error: 'URL already exists' });
    }
    throw err;
  }
});

router.put('/:id', (req, res) => {
  const { name, url, active } = req.body;
  const existing = db.prepare('SELECT * FROM urls WHERE id = ?').get(req.params.id);
  if (!existing) return res.status(404).json({ error: 'Not found' });

  db.prepare('UPDATE urls SET name = ?, url = ?, active = ? WHERE id = ?').run(
    name ?? existing.name,
    url ?? existing.url,
    active !== undefined ? (active ? 1 : 0) : existing.active,
    req.params.id
  );
  res.json(db.prepare('SELECT * FROM urls WHERE id = ?').get(req.params.id));
});

router.delete('/:id', (req, res) => {
  const result = db.prepare('DELETE FROM urls WHERE id = ?').run(req.params.id);
  if (result.changes === 0) return res.status(404).json({ error: 'Not found' });
  res.status(204).send();
});

export default router;
