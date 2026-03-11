require('dotenv').config();
const express = require('express');
const cors = require('cors');

const authRoutes = require('./routes/auth');
const leadsRoutes = require('./routes/leads');
const notesRoutes = require('./routes/notes');
const exportRoutes = require('./routes/export');

const app = express();
const PORT = process.env.PORT || 5000;

// ── Middleware ───────────────────────────────────────────────────────────────
app.use(cors({
    origin: [
        'http://localhost:3000',
        'http://127.0.0.1:3000',
        ...(process.env.FRONTEND_URL ? [process.env.FRONTEND_URL] : []),
    ],
    credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ── Routes ───────────────────────────────────────────────────────────────────
app.use('/auth', authRoutes);
app.use('/api/leads', leadsRoutes);
app.use('/api/leads/:id/notes', notesRoutes);
app.use('/api/export', exportRoutes);

// ── Health Check ─────────────────────────────────────────────────────────────
app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ── 404 Handler ───────────────────────────────────────────────────────────────
app.use((req, res) => {
    res.status(404).json({ error: `Route ${req.method} ${req.path} not found` });
});

// ── Error Handler ─────────────────────────────────────────────────────────────
app.use((err, req, res, next) => {
    console.error('Unhandled error:', err);
    res.status(500).json({ error: 'Internal server error', details: err.message });
});

// ── Start ─────────────────────────────────────────────────────────────────────
app.listen(PORT, () => {
    console.log(`\n🚀 CRM Backend running on http://localhost:${PORT}`);
    console.log(`   Health:  http://localhost:${PORT}/health`);
    console.log(`   Auth:    http://localhost:${PORT}/auth/login`);
    console.log(`   Leads:   http://localhost:${PORT}/api/leads`);
    console.log(`   Export:  http://localhost:${PORT}/api/export\n`);
});

module.exports = app;
