import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { body, validationResult } from 'express-validator';
import User from '../models/User.js';

const router = Router();

// ─── Validation rules ─────────────────────────────────────────────────────────

const registerRules = [
  body('email')
    .isEmail().withMessage('A valid email is required')
    .normalizeEmail()
    .isLength({ max: 255 }).withMessage('Email too long'),
  body('password')
    .isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
    .isLength({ max: 128 }).withMessage('Password too long'),
  body('name')
    .optional({ checkFalsy: true })   // treats "", null, undefined all as "not provided"
    .trim()
    .isLength({ min: 1, max: 100 }).withMessage('Name must be 1–100 characters')
    .escape(),
];

const loginRules = [
  body('email').isEmail().withMessage('A valid email is required').normalizeEmail(),
  body('password').notEmpty().withMessage('Password is required'),
];

// Returns true if there were validation errors (response already sent)
const handleValidation = (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ errors: errors.array() });
    return true;
  }
  return false;
};

// ─── POST /register ───────────────────────────────────────────────────────────

router.post('/register', registerRules, async (req, res) => {
  if (handleValidation(req, res)) return;

  const { email, password, name } = req.body;

  try {
    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(409).json({ error: 'Email is already registered' });
    }

    // bcrypt cost 12: ~250ms per hash — strong enough against brute force
    const hashed = await bcrypt.hash(password, 12);
    await User.create({ email, password: hashed, name: name ?? null });

    return res.status(201).json({ message: 'User registered successfully' });
  } catch (err) {
    console.error('Register error:', err);
    return res.status(500).json({ error: 'Registration failed' });
  }
});

// ─── POST /login ──────────────────────────────────────────────────────────────

router.post('/login', loginRules, async (req, res) => {
  if (handleValidation(req, res)) return;

  const { email, password } = req.body;

  try {
    // .select('+password') overrides schema-level { select: false }
    const user = await User.findOne({ email }).select('+password');

    // Always call bcrypt.compare even when user is not found.
    // This prevents timing-based user enumeration attacks.
    const DUMMY_HASH = '$2a$12$invalidhashplaceholdertopreventtimingattacks000000000';
    const isMatch = user
      ? await bcrypt.compare(password, user.password)
      : await bcrypt.compare(password, DUMMY_HASH);

    if (!user || !isMatch) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const access_token = jwt.sign(
      { userId: user._id.toString(), email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    return res.json({
      access_token,
      user: { id: user._id.toString(), email: user.email, name: user.name },
    });
  } catch (err) {
    console.error('Login error:', err);
    return res.status(500).json({ error: 'Login failed' });
  }
});

export default router;
