const express = require('express');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
const db = require('../db');
const { signToken } = require('../middleware/auth');

const router = express.Router();

// POST /auth/register — Create a new user account
router.post('/register', async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ error: 'email and password are required' });
    }

    if (password.length < 6) {
        return res.status(400).json({ error: 'password must be at least 6 characters' });
    }

    // Check if user already exists
    const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(email);
    if (existing) {
        return res.status(409).json({ error: 'An account with this email already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const id = uuidv4();

    db.prepare('INSERT INTO users (id, email, password) VALUES (?, ?, ?)').run(id, email, hashedPassword);

    const token = signToken({ id, email });

    res.status(201).json({
        message: 'Account created successfully',
        token,
        user: { id, email },
    });
});

// POST /auth/login — Login with email + password, returns JWT
router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ error: 'email and password are required' });
    }

    const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
    if (!user) {
        return res.status(401).json({ error: 'Invalid email or password' });
    }

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
        return res.status(401).json({ error: 'Invalid email or password' });
    }

    const token = signToken({ id: user.id, email: user.email });

    res.json({
        message: 'Login successful',
        token,
        user: { id: user.id, email: user.email },
    });
});

// GET /auth/me — Get current user info from token
router.get('/me', (req, res) => {
    const authHeader = req.headers['authorization'];
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'No token provided' });
    }

    const jwt = require('jsonwebtoken');
    try {
        const payload = jwt.verify(authHeader.slice(7), process.env.JWT_SECRET);
        return res.json({ user: { id: payload.id, email: payload.email } });
    } catch {
        return res.status(401).json({ error: 'Token expired or invalid' });
    }
});

module.exports = router;
