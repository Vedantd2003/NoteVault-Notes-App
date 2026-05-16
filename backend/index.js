// Load .env variables before any other import reads process.env
import 'dotenv/config';

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { query, validationResult } from 'express-validator';

import { connectDB }          from './src/config/database.js';
import { authenticateToken }  from './src/middleware/auth.js';
import authRoutes             from './src/routes/auth.js';
import notesRoutes            from './src/routes/notes.js';
import openApiSpec            from './src/openapi.js';
import Note                   from './src/models/Note.js';

const app  = express();
const PORT = process.env.PORT || 3001;

// ─── Security middleware ──────────────────────────────────────────────────────

app.use(helmet());

app.use(cors({
  origin: true,          // reflect any origin — safe for a JWT-auth API
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
}));

// Global rate limit — 200 req / 15 min per IP
app.use(rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests — please try again later.' },
}));

// Stricter limit on auth routes to slow brute-force attacks
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { error: 'Too many auth attempts — please wait before retrying.' },
});
app.use(['/login', '/register'], authLimiter);

app.use(express.json({ limit: '10kb' }));

// Catch malformed JSON bodies and return a clear 400 instead of a 500
app.use((err, req, res, next) => {
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ error: 'Invalid JSON in request body' });
  }
  next(err);
});

// ─── Routes ───────────────────────────────────────────────────────────────────

app.use('/', authRoutes);
app.use('/notes', notesRoutes);

// GET /search?q=keyword  — full-text search (stretch goal)
app.get('/search', [
  authenticateToken,
  query('q').trim().notEmpty().withMessage('Search query (q) is required').isLength({ max: 255 }),
  query('page').optional().isInt({ min: 1 }).toInt(),
  query('limit').optional().isInt({ min: 1, max: 100 }).toInt(),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  const { userId } = req.user;
  const q     = req.query.q;
  const page  = req.query.page  ?? 1;
  const limit = req.query.limit ?? 20;
  const skip  = (page - 1) * limit;
  const re    = new RegExp(q, 'i');

  const filter = {
    $or:  [{ owner: userId }, { sharedWith: userId }],
    $and: [{ $or: [{ title: re }, { content: re }] }],
  };

  try {
    const [notes, total] = await Promise.all([
      Note.find(filter)
        .populate('owner', 'email name')
        .sort({ isPinned: -1, updatedAt: -1 })
        .skip(skip)
        .limit(limit),
      Note.countDocuments(filter),
    ]);

    const serialize = (note) => ({
      id:          note._id.toString(),
      title:       note.title,
      content:     note.content,
      owner_id:    note.owner?._id?.toString() ?? note.owner?.toString(),
      owner_email: note.owner?.email,
      is_pinned:   note.isPinned,
      color:       note.color,
      tag:         note.tag,
      is_shared:   note.owner?._id?.toString() !== userId,
      created_at:  note.createdAt,
      updated_at:  note.updatedAt,
    });

    return res.json({
      notes: notes.map(serialize),
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (err) {
    console.error('GET /search:', err);
    return res.status(500).json({ error: 'Search failed' });
  }
});

// GET /openapi.json
app.get('/openapi.json', (_req, res) => res.json(openApiSpec));

// GET /about
app.get('/about', (_req, res) => {
  res.json({
    name:  'Vedant Deshpande',
    email: 'abc844023@gmail.com',
    'my features': {
      'Smart Note Organisation':
        'Notes can be pinned to stay at the top of the list, colour-coded with 8 pastel ' +
        'labels for instant visual scanning, and assigned a free-text tag (e.g. "work", "personal") ' +
        'for category filtering. The dashboard provides real-time debounced search and sidebar tag filters. ' +
        'Chosen because it meaningfully improves note discoverability without requiring any additional ' +
        'collections — all data lives in three lightweight extra fields on the Note document.',
    },
  });
});

// GET /health
app.get('/health', (_req, res) =>
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
);

// ─── 404 + global error handler ──────────────────────────────────────────────

app.use((_req, res) => res.status(404).json({ error: 'Route not found' }));

// The 4-argument signature is required for Express to treat this as an error handler
// eslint-disable-next-line no-unused-vars
app.use((err, _req, res, _next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// ─── Start ────────────────────────────────────────────────────────────────────

const start = async () => {
  await connectDB();
  app.listen(PORT, () =>
    console.log(`NoteVault API running → http://localhost:${PORT}`)
  );
};

start();
