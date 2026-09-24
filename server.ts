import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { handleApiRoute } from './api/server-middleware.ts';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT || 3000;

// API routes handled by server middleware
app.use('/api', async (req, res, next) => {
  try {
    const handled = await handleApiRoute(req, res, next);
    if (!handled) next();
  } catch (err) {
    console.error('Server error on API route:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Serve static frontend build
app.use(express.static(path.join(__dirname, 'dist')));

// Fallback to index.html for SPA routing
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(port, () => {
  console.log(`SolveSpace India server running on port ${port}`);
});
