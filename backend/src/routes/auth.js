import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const router = Router();

// ─── POST /register ───────────────────────────────────────────────────────────

router.post('/register', async (req, res) => {
  try {
    // Log everything so Render logs show exactly what arrives
    console.log('[Register] content-type:', req.headers['content-type']);
    console.log('[Register] body:', JSON.stringify(req.body));

    const body = req.body;

    if (!body || typeof body !== 'object') {
      return res.status(400).json({ error: 'Request body must be valid JSON' });
    }

    const { email, password, name } = body;

    // Manual validation — no library, no edge cases
    if (!email || typeof email !== 'string' || !email.trim()) {
      return res.status(400).json({ error: 'Email is required' });
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      return res.status(400).json({ error: 'A valid email is required' });
    }
    if (email.trim().length > 255) {
      return res.status(400).json({ error: 'Email too long' });
    }

    if (!password || typeof password !== 'string') {
      return res.status(400).json({ error: 'Password is required' });
    }
    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }
    if (password.length > 128) {
      return res.status(400).json({ error: 'Password too long' });
    }

    if (name !== undefined && name !== null && name !== '' && typeof name === 'string' && name.trim().length > 100) {
      return res.status(400).json({ error: 'Name too long (max 100 characters)' });
    }

    const normalizedEmail = email.trim().toLowerCase();

    const existing = await User.findOne({ email: normalizedEmail });
    if (existing) {
      return res.status(409).json({ error: 'Email is already registered' });
    }

    const hashed = await bcrypt.hash(password, 12);
    await User.create({
      email: normalizedEmail,
      password: hashed,
      name: (name && name.trim()) || null,
    });

    return res.status(201).json({ message: 'User registered successfully' });
  } catch (err) {
    console.error('[Register] error:', err);
    return res.status(500).json({ error: 'Registration failed' });
  }
});

// ─── POST /login ──────────────────────────────────────────────────────────────

router.post('/login', async (req, res) => {
  try {
    console.log('[Login] content-type:', req.headers['content-type']);
    console.log('[Login] body:', JSON.stringify({ email: req.body?.email, hasPassword: Boolean(req.body?.password) }));

    const body = req.body;

    if (!body || typeof body !== 'object') {
      return res.status(400).json({ error: 'Request body must be valid JSON' });
    }

    const { email, password } = body;

    if (!email || typeof email !== 'string' || !email.trim()) {
      return res.status(400).json({ error: 'Email is required' });
    }
    if (!password || typeof password !== 'string') {
      return res.status(400).json({ error: 'Password is required' });
    }

    const normalizedEmail = email.trim().toLowerCase();

    const user = await User.findOne({ email: normalizedEmail }).select('+password');

    // Always run bcrypt even when user not found — prevents timing attacks
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
    console.error('[Login] error:', err);
    return res.status(500).json({ error: 'Login failed' });
  }
});

export default router;
