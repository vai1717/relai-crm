const express = require('express');
const { v4: uuidv4 } = require('uuid');
const db = require('../db');
const { requireAuth, requireApiKey } = require('../middleware/auth');

const router = express.Router({ mergeParams: true });

// ── GET /api/leads/:id/notes ────────────────────────────────────────────────
// List all notes for a lead, newest first
router.get('/', requireAuth, (req, res) => {
    const { id } = req.params;

    // Verify lead exists
    const lead = db.prepare('SELECT id FROM leads WHERE id = ?').get(id);
    if (!lead) return res.status(404).json({ error: 'Lead not found' });

    const notes = db
        .prepare('SELECT * FROM lead_notes WHERE lead_id = ? ORDER BY created_at DESC')
        .all(id);

    res.json({ notes });
});

// ── POST /api/leads/:id/notes ───────────────────────────────────────────────
// Add a note to a lead — protected by x-api-key (automation endpoint)
router.post('/', requireApiKey, (req, res) => {
    const { id } = req.params;
    const { note_text } = req.body;

    if (!note_text || !note_text.trim()) {
        return res.status(400).json({ error: 'note_text is required' });
    }

    // Verify lead exists
    const lead = db.prepare('SELECT id FROM leads WHERE id = ?').get(id);
    if (!lead) return res.status(404).json({ error: 'Lead not found' });

    const noteId = uuidv4();
    db.prepare(
        'INSERT INTO lead_notes (id, lead_id, note_text) VALUES (?, ?, ?)'
    ).run(noteId, id, note_text.trim());

    const note = db.prepare('SELECT * FROM lead_notes WHERE id = ?').get(noteId);
    res.status(201).json({ note });
});

module.exports = router;
