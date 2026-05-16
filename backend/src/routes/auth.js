import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const router = Router();

// ─── POST /register ───────────────────────────────────────────────────────────

router.post('/register', async (req, res) => {
  try {
    const body = req.body;
    const ct   = req.headers['content-type'] || 'missing';

    // Debug info returned in every 400 so you can see it in browser Network tab
    const debug = {
      contentType: ct,
      bodyType: typeof body,
      bodyReceived: body,
    };

    console.log('[Register]', JSON.stringify(debug));

    if (!body || typeof body !== 'object' || Array.isArray(body)) {
      return res.status(400).json({
        error: 'Body not parsed — Content-Type must be application/json',
        debug,
      });
    }

    const { email, password, name } = body;

    if (!email || typeof email !== 'string' || !email.trim()) {
      return res.status(400).json({ error: 'Email is required', debug });
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      return res.status(400).json({ error: 'A valid email is required', debug });
    }
    if (email.length > 255) {
      return res.status(400).json({ error: 'Email too long', debug });
    }
    if (!password || typeof password !== 'string') {
      return res.status(400).json({ error: 'Password is required', debug });
    }
    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters', debug });
    }
    if (password.length > 128) {
      return res.status(400).json({ error: 'Password too long', debug });
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
      name: (name && typeof name === 'string' && name.trim()) || null,
    });

    return res.status(201).json({ message: 'User registered successfully' });
  } catch (err) {
    console.error('[Register] server error:', err);
    return res.status(500).json({ error: 'Registration failed' });
  }
});

// ─── POST /login ──────────────────────────────────────────────────────────────

router.post('/login', async (req, res) => {
  try {
    const body = req.body;
    console.log('[Login] body:', JSON.stringify({ email: body?.email, hasPassword: Boolean(body?.password) }));

    if (!body || typeof body !== 'object') {
      return res.status(400).json({ error: 'Body not parsed — Content-Type must be application/json' });
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
    console.error('[Login] server error:', err);
    return res.status(500).json({ error: 'Login failed' });
  }
});

export default router;
