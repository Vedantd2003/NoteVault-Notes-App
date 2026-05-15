import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { body, validationResult } from 'express-validator';
import User from '../models/User.js';

const router = Router();

// ─── Validation rules ─────────────────────────────────────────────────────────

const registerRules = [
  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('A valid email is required')
    .isLength({ max: 255 }).withMessage('Email too long')
    .customSanitizer((val) => val.toLowerCase()),   // simple lowercase, no normalizeEmail
  body('password')
    .notEmpty().withMessage('Password is required')
    .isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
    .isLength({ max: 128 }).withMessage('Password too long'),
  body('name')
    .optional({ checkFalsy: true })  // empty string / null / undefined → skip validation
    .trim()
    .isLength({ min: 1, max: 100 }).withMessage('Name must be 1–100 characters')
    .escape(),
];

const loginRules = [
  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('A valid email is required')
    .customSanitizer((val) => val.toLowerCase()),
  body('password')
    .notEmpty().withMessage('Password is required'),
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

const handleValidation = (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    // Log to Render so we can see exactly which field fails
    console.error('[Validation 400]', JSON.stringify(errors.array()));
    res.status(400).json({ errors: errors.array() });
    return true;
  }
  return false;
};

// ─── POST /register ───────────────────────────────────────────────────────────

router.post('/register', registerRules, async (req, res) => {
  // Log incoming body (mask password) to debug on Render
  console.log('[Register] body:', {
    email: req.body?.email,
    name: req.body?.name,
    hasPassword: Boolean(req.body?.password),
  });

  if (handleValidation(req, res)) return;

  const { email, password, name } = req.body;

  try {
    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(409).json({ error: 'Email is already registered' });
    }

    const hashed = await bcrypt.hash(password, 12);
    await User.create({ email, password: hashed, name: name || null });

    return res.status(201).json({ message: 'User registered successfully' });
  } catch (err) {
    console.error('Register error:', err);
    return res.status(500).json({ error: 'Registration failed' });
  }
});

// ─── POST /login ──────────────────────────────────────────────────────────────

router.post('/login', loginRules, async (req, res) => {
  console.log('[Login] email:', req.body?.email);

  if (handleValidation(req, res)) return;

  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email }).select('+password');

    // Always run compare even for missing user — prevents timing attacks
    const DUMMY = '$2a$12$invalidhashplaceholdertopreventtimingattacks000000000';
    const isMatch = user
      ? await bcrypt.compare(password, user.password)
      : await bcrypt.compare(password, DUMMY);

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
