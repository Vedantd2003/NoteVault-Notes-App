import { Router } from 'express';
import mongoose from 'mongoose';
import { body, query, validationResult } from 'express-validator';
import Note, { VALID_COLORS } from '../models/Note.js';
import User from '../models/User.js';
import { authenticateToken } from '../middleware/auth.js';

const router = Router();

// Every note route requires a valid JWT
router.use(authenticateToken);

// ─── Helpers ──────────────────────────────────────────────────────────────────

const handleValidation = (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ errors: errors.array() });
    return true;
  }
  return false;
};

const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

/**
 * Maps a Mongoose Note document to the API response shape.
 * Converts camelCase Mongoose fields → snake_case API contract.
 */
const serializeNote = (note, currentUserId) => {
  const ownerId = note.owner?._id
    ? note.owner._id.toString()
    : note.owner?.toString();

  return {
    id:          note._id.toString(),
    title:       note.title,
    content:     note.content,
    owner_id:    ownerId,
    owner_email: note.owner?.email ?? undefined,
    owner_name:  note.owner?.name  ?? undefined,
    is_pinned:   note.isPinned,
    color:       note.color,
    tag:         note.tag,
    is_shared:   ownerId !== currentUserId.toString(),
    created_at:  note.createdAt,
    updated_at:  note.updatedAt,
  };
};

// Shared body validation for create + update
const noteBodyRules = [
  body('title')
    .trim()
    .notEmpty().withMessage('Title is required')
    .isLength({ max: 255 }).withMessage('Title too long (max 255 chars)')
    .escape(),
  body('content')
    .trim()
    .notEmpty().withMessage('Content is required')
    .isLength({ max: 50000 }).withMessage('Content too long'),
  body('color')
    .optional()
    .isIn(VALID_COLORS)
    .withMessage(`color must be one of: ${VALID_COLORS.join(', ')}`),
  body('tag')
    .optional({ nullable: true, checkFalsy: true })
    .trim()
    .isLength({ max: 50 }).withMessage('Tag too long (max 50 chars)')
    .escape(),
  body('is_pinned')
    .optional()
    .isBoolean().withMessage('is_pinned must be true or false'),
];

// ─── GET /notes ───────────────────────────────────────────────────────────────

router.get('/', [
  query('page').optional().isInt({ min: 1 }).toInt(),
  query('limit').optional().isInt({ min: 1, max: 100 }).toInt(),
  query('q').optional().trim().isLength({ max: 255 }),
  query('tag').optional().trim().isLength({ max: 50 }),
], async (req, res) => {
  if (handleValidation(req, res)) return;

  const { userId } = req.user;
  const page  = req.query.page  ?? 1;
  const limit = req.query.limit ?? 20;
  const skip  = (page - 1) * limit;

  // Base: notes owned by OR shared with the user
  const filter = { $or: [{ owner: userId }, { sharedWith: userId }] };

  if (req.query.q) {
    const re = new RegExp(req.query.q, 'i');
    filter.$and = [{ $or: [{ title: re }, { content: re }] }];
  }
  if (req.query.tag) filter.tag = req.query.tag;

  try {
    const [notes, total] = await Promise.all([
      Note.find(filter)
        .populate('owner', 'email name')
        .sort({ isPinned: -1, updatedAt: -1 })
        .skip(skip)
        .limit(limit),
      Note.countDocuments(filter),
    ]);

    return res.json({
      notes: notes.map((n) => serializeNote(n, userId)),
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (err) {
    console.error('GET /notes:', err);
    return res.status(500).json({ error: 'Failed to fetch notes' });
  }
});

// ─── GET /notes/:id ───────────────────────────────────────────────────────────

router.get('/:id', async (req, res) => {
  if (!isValidObjectId(req.params.id)) {
    return res.status(400).json({ error: 'Invalid note ID' });
  }

  const { userId } = req.user;

  try {
    const note = await Note.findOne({
      _id: req.params.id,
      $or: [{ owner: userId }, { sharedWith: userId }],
    }).populate('owner', 'email name');

    if (!note) return res.status(404).json({ error: 'Note not found or access denied' });

    return res.json(serializeNote(note, userId));
  } catch (err) {
    console.error('GET /notes/:id:', err);
    return res.status(500).json({ error: 'Failed to fetch note' });
  }
});

// ─── POST /notes ──────────────────────────────────────────────────────────────

router.post('/', noteBodyRules, async (req, res) => {
  if (handleValidation(req, res)) return;

  const { userId } = req.user;
  const { title, content, color = 'default', tag = null, is_pinned = false } = req.body;

  try {
    const note = await Note.create({
      title, content, color, tag,
      isPinned: is_pinned,
      owner: userId,
    });

    await note.populate('owner', 'email name');
    return res.status(201).json(serializeNote(note, userId));
  } catch (err) {
    console.error('POST /notes:', err);
    return res.status(500).json({ error: 'Failed to create note' });
  }
});

// ─── PUT /notes/:id ───────────────────────────────────────────────────────────

router.put('/:id', noteBodyRules, async (req, res) => {
  if (!isValidObjectId(req.params.id)) {
    return res.status(400).json({ error: 'Invalid note ID' });
  }
  if (handleValidation(req, res)) return;

  const { userId } = req.user;
  const { title, content, color, tag, is_pinned } = req.body;

  try {
    // Only the owner can update
    const note = await Note.findOne({ _id: req.params.id, owner: userId });
    if (!note) return res.status(404).json({ error: 'Note not found or you are not the owner' });

    if (title     !== undefined) note.title    = title;
    if (content   !== undefined) note.content  = content;
    if (color     !== undefined) note.color    = color;
    if (tag       !== undefined) note.tag      = tag;
    if (is_pinned !== undefined) note.isPinned = is_pinned;

    await note.save();
    await note.populate('owner', 'email name');
    return res.json(serializeNote(note, userId));
  } catch (err) {
    console.error('PUT /notes/:id:', err);
    return res.status(500).json({ error: 'Failed to update note' });
  }
});

// ─── DELETE /notes/:id ────────────────────────────────────────────────────────

router.delete('/:id', async (req, res) => {
  if (!isValidObjectId(req.params.id)) {
    return res.status(400).json({ error: 'Invalid note ID' });
  }

  const { userId } = req.user;

  try {
    const deleted = await Note.findOneAndDelete({ _id: req.params.id, owner: userId });
    if (!deleted) return res.status(404).json({ error: 'Note not found or you are not the owner' });

    return res.status(204).send();
  } catch (err) {
    console.error('DELETE /notes/:id:', err);
    return res.status(500).json({ error: 'Failed to delete note' });
  }
});

// ─── POST /notes/:id/share ────────────────────────────────────────────────────

router.post('/:id/share', [
  body('share_with_email')
    .isEmail().withMessage('A valid email is required')
    .normalizeEmail(),
], async (req, res) => {
  if (!isValidObjectId(req.params.id)) {
    return res.status(400).json({ error: 'Invalid note ID' });
  }
  if (handleValidation(req, res)) return;

  const { userId, email: ownerEmail } = req.user;
  const { share_with_email } = req.body;

  try {
    // Only the owner can share
    const note = await Note.findOne({ _id: req.params.id, owner: userId });
    if (!note) return res.status(404).json({ error: 'Note not found or you are not the owner' });

    if (ownerEmail === share_with_email) {
      return res.status(400).json({ error: 'You cannot share a note with yourself' });
    }

    const target = await User.findOne({ email: share_with_email });
    if (!target) return res.status(404).json({ error: 'No user found with that email' });

    const alreadyShared = note.sharedWith.some(
      (id) => id.toString() === target._id.toString()
    );
    if (alreadyShared) {
      return res.status(409).json({ error: 'Note is already shared with this user' });
    }

    note.sharedWith.push(target._id);
    await note.save();

    return res.json({ message: `Note shared with ${share_with_email} successfully` });
  } catch (err) {
    console.error('POST /notes/:id/share:', err);
    return res.status(500).json({ error: 'Failed to share note' });
  }
});

export default router;
