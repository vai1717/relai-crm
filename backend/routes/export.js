const express = require('express');
const db = require('../db');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

// GET /api/export — Export all leads as CSV (JWT protected)
router.get('/', requireAuth, (req, res) => {
    const leads = db
        .prepare('SELECT id, name, phone, city, source, status, created_at FROM leads ORDER BY created_at DESC')
        .all();

    const escapeCSV = (val) => {
        if (val === null || val === undefined) return '';
        const str = String(val);
        if (str.includes(',') || str.includes('"') || str.includes('\n')) {
            return `"${str.replace(/"/g, '""')}"`;
        }
        return str;
    };

    const headers = ['id', 'name', 'phone', 'city', 'source', 'status', 'created_at'];
    const rows = [
        headers.join(','),
        ...leads.map((lead) =>
            headers.map((h) => escapeCSV(lead[h])).join(',')
        ),
    ];

    const csv = rows.join('\n');
    const filename = `leads_export_${new Date().toISOString().slice(0, 10)}.csv`;

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(csv);
});

module.exports = router;
