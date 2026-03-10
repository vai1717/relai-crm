const express = require('express');
const { v4: uuidv4 } = require('uuid');
const db = require('../db');
const { requireAuth, requireApiKey } = require('../middleware/auth');

const router = express.Router();

// ── GET /api/leads ──────────────────────────────────────────────────────────
// List all leads; supports ?search=, ?status=, ?source= query params
// Protected by JWT auth
router.get('/', requireAuth, (req, res) => {
    const { search = '', status = '', source = '' } = req.query;

    let sql = 'SELECT * FROM leads WHERE 1=1';
    const params = [];

    if (search) {
        sql += ' AND (name LIKE ? OR phone LIKE ?)';
        params.push(`%${search}%`, `%${search}%`);
    }
    if (status) {
        sql += ' AND status = ?';
        params.push(status);
    }
    if (source) {
        sql += ' AND source = ?';
        params.push(source);
    }

    sql += ' ORDER BY created_at DESC';

    const leads = db.prepare(sql).all(...params);
    res.json({ leads });
});

// ── POST /api/leads ─────────────────────────────────────────────────────────
// Create a new lead — protected by x-api-key header (automation endpoint)
router.post('/', requireApiKey, (req, res) => {
    const { name, phone, city, source, status } = req.body;

    // Required field validation
    if (!name || !name.trim()) {
        return res.status(400).json({ error: 'name is required' });
    }
    if (!phone || !phone.trim()) {
        return res.status(400).json({ error: 'phone is required' });
    }

    // Enum validation
    const validStatuses = ['new', 'follow_up', 'closed'];
    if (status && !validStatuses.includes(status)) {
        return res.status(400).json({ error: `status must be one of: ${validStatuses.join(', ')}` });
    }

    // Duplicate phone check
    const existing = db.prepare('SELECT id, name, phone FROM leads WHERE phone = ?').get(phone.trim());
    if (existing) {
        return res.status(409).json({
            error: 'Lead already exists',
            message: `A lead with phone ${phone} already exists`,
            existing_lead: existing,
        });
    }

    const id = uuidv4();
    db.prepare(
        'INSERT INTO leads (id, name, phone, city, source, status) VALUES (?, ?, ?, ?, ?, ?)'
    ).run(
        id,
        name.trim(),
        phone.trim(),
        city ? city.trim() : null,
        source || null,
        status || 'new'
    );

    const lead = db.prepare('SELECT * FROM leads WHERE id = ?').get(id);
    res.status(201).json({ lead });
});

// ── GET /api/leads/:id ──────────────────────────────────────────────────────
router.get('/:id', requireAuth, (req, res) => {
    const lead = db.prepare('SELECT * FROM leads WHERE id = ?').get(req.params.id);
    if (!lead) return res.status(404).json({ error: 'Lead not found' });
    res.json({ lead });
});

// ── PUT /api/leads/:id ──────────────────────────────────────────────────────
// Update a lead (JWT protected)
router.put('/:id', requireAuth, (req, res) => {
    const { id } = req.params;
    const lead = db.prepare('SELECT * FROM leads WHERE id = ?').get(id);
    if (!lead) return res.status(404).json({ error: 'Lead not found' });

    const { name, phone, city, source, status } = req.body;

    // Enum validation
    const validStatuses = ['new', 'follow_up', 'closed'];
    if (status && !validStatuses.includes(status)) {
        return res.status(400).json({ error: `status must be one of: ${validStatuses.join(', ')}` });
    }

    // Check duplicate phone if changing phone
    if (phone && phone !== lead.phone) {
        const dup = db.prepare('SELECT id FROM leads WHERE phone = ? AND id != ?').get(phone.trim(), id);
        if (dup) {
            return res.status(409).json({ error: 'Another lead already has this phone number' });
        }
    }

    db.prepare(`
    UPDATE leads SET
      name   = COALESCE(?, name),
      phone  = COALESCE(?, phone),
      city   = CASE WHEN ? IS NOT NULL THEN ? ELSE city END,
      source = CASE WHEN ? IS NOT NULL THEN ? ELSE source END,
      status = COALESCE(?, status)
    WHERE id = ?
  `).run(
        name ? name.trim() : null,
        phone ? phone.trim() : null,
        city !== undefined ? city : null, city !== undefined ? city : null,
        source !== undefined ? source : null, source !== undefined ? source : null,
        status ? status : null,
        id
    );

    const updated = db.prepare('SELECT * FROM leads WHERE id = ?').get(id);
    res.json({ lead: updated });
});

// ── DELETE /api/leads/:id ───────────────────────────────────────────────────
router.delete('/:id', requireAuth, (req, res) => {
    const { id } = req.params;
    const lead = db.prepare('SELECT id FROM leads WHERE id = ?').get(id);
    if (!lead) return res.status(404).json({ error: 'Lead not found' });

    db.prepare('DELETE FROM leads WHERE id = ?').run(id);
    res.json({ message: 'Lead deleted successfully' });
});

module.exports = router;
