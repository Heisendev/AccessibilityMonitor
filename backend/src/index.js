import express from 'express';
import cors from 'cors';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { existsSync } from 'fs';

import urlsRouter from './routes/urls.js';
import runsRouter from './routes/runs.js';
import resultsRouter from './routes/results.js';
import './cron.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.use('/api/urls', urlsRouter);
app.use('/api/runs', runsRouter);
app.use('/api/results', resultsRouter);

// Serve React build in production
const distPath = join(__dirname, '../../frontend/dist');
if (existsSync(distPath)) {
  app.use(express.static(distPath));
  app.get('*splat', (_req, res) => res.sendFile(join(distPath, 'index.html')));
}

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
