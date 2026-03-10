'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { getLead, getNotes, createNote, updateLead, deleteLead } from '@/lib/api';
import {
    getStatusBadgeClass,
    getSourceBadgeClass,
    formatStatus,
    formatSource,
    formatRelativeTime,
    formatDateTime,
    formatDate,
} from '@/lib/utils';

export default function LeadDetailPage() {
    const { id } = useParams();
    const router = useRouter();

    const [lead, setLead] = useState(null);
    const [notes, setNotes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [noteText, setNoteText] = useState('');
    const [addingNote, setAddingNote] = useState(false);
    const [noteError, setNoteError] = useState('');
    const [noteSuccess, setNoteSuccess] = useState('');
    const [updatingStatus, setUpdatingStatus] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchAll = async () => {
            setLoading(true);
            try {
                const [leadData, notesData] = await Promise.all([
                    getLead(id),
                    getNotes(id),
                ]);
                setLead(leadData.lead);
                setNotes(notesData.notes);
            } catch (err) {
                if (err.status === 401) router.replace('/login');
                else if (err.status === 404) router.replace('/leads');
                else setError(err.message);
            } finally {
                setLoading(false);
            }
        };
        if (id) fetchAll();
    }, [id, router]);

    const handleAddNote = async (e) => {
        e.preventDefault();
        if (!noteText.trim()) { setNoteError('Note cannot be empty'); return; }
        setAddingNote(true);
        setNoteError('');
        setNoteSuccess('');
        try {
            const data = await createNote(id, noteText.trim());
            setNotes([data.note, ...notes]);
            setNoteText('');
            setNoteSuccess('Note added successfully!');
            setTimeout(() => setNoteSuccess(''), 3000);
        } catch (err) {
            setNoteError(err.message);
        } finally {
            setAddingNote(false);
        }
    };

    const handleStatusChange = async (newStatus) => {
        setUpdatingStatus(true);
        try {
            const data = await updateLead(id, { status: newStatus });
            setLead(data.lead);
        } catch (err) {
            alert('Failed to update status: ' + err.message);
        } finally {
            setUpdatingStatus(false);
        }
    };

    const handleDelete = async () => {
        if (!confirm(`Are you sure you want to delete "${lead.name}"? This cannot be undone.`)) return;
        setDeleting(true);
        try {
            await deleteLead(id);
            router.push('/leads');
        } catch (err) {
            alert('Delete failed: ' + err.message);
            setDeleting(false);
        }
    };

    if (loading) {
        return (
            <div className="empty-state" style={{ marginTop: 80 }}>
                <span className="spinner" style={{ width: 36, height: 36, borderWidth: 3 }} />
                <p className="empty-title" style={{ marginTop: 16 }}>Loading lead...</p>
            </div>
        );
    }

    if (error || !lead) {
        return (
            <div className="empty-state">
                <div className="empty-icon"></div>
                <p className="empty-title">Lead not found</p>
                <Link href="/leads" className="btn btn-secondary">← Back to Leads</Link>
            </div>
        );
    }

    return (
        <div className="fade-in">
            {/* Breadcrumbs */}
            <div className="breadcrumbs">
                <Link href="/leads">Leads</Link>
                <span className="breadcrumbs-sep">›</span>
                <span>{lead.name}</span>
            </div>

            {/* Page Header */}
            <div className="page-header">
                <div>
                    <h1 className="page-title">{lead.name}</h1>
                    <p className="page-subtitle">Lead created on {formatDate(lead.created_at)}</p>
                </div>
                <div className="flex gap-12">
                    <button onClick={handleDelete} className="btn btn-danger" disabled={deleting} id="delete-lead-btn">
                        {deleting ? <span className="spinner" /> : null} Delete Lead
                    </button>
                </div>
            </div>

            <div className="lead-detail-layout">
                {/* ── Left: Lead Info ── */}
                <div>
                    <div className="card" style={{ marginBottom: 20 }}>
                        <div className="section-title">Lead Information</div>

                        <div className="detail-info-row">
                            <span className="detail-info-label">Name</span>
                            <span className="detail-info-value">{lead.name}</span>
                        </div>
                        <div className="detail-info-row">
                            <span className="detail-info-label">Phone</span>
                            <span className="detail-info-value" style={{ fontFamily: 'monospace' }}>{lead.phone}</span>
                        </div>
                        <div className="detail-info-row">
                            <span className="detail-info-label">City</span>
                            <span className="detail-info-value">{lead.city || <span className="text-muted">Not specified</span>}</span>
                        </div>
                        <div className="detail-info-row">
                            <span className="detail-info-label">Source</span>
                            <div style={{ marginTop: 4 }}>
                                {lead.source
                                    ? <span className={getSourceBadgeClass(lead.source)}>{formatSource(lead.source)}</span>
                                    : <span className="text-muted">Not specified</span>}
                            </div>
                        </div>
                        <div className="detail-info-row">
                            <span className="detail-info-label">Created</span>
                            <span className="detail-info-value" style={{ fontSize: 13 }}>{formatDateTime(lead.created_at)}</span>
                        </div>
                    </div>

                    {/* Status Card */}
                    <div className="card">
                        <div className="section-title">Update Status</div>
                        <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 16 }}>
                            Current: <span className={getStatusBadgeClass(lead.status)}>{formatStatus(lead.status)}</span>
                        </p>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                            {['new', 'follow_up', 'closed'].map((s) => (
                                <button
                                    key={s}
                                    className={`btn ${lead.status === s ? 'btn-primary' : 'btn-secondary'}`}
                                    style={{ justifyContent: 'center' }}
                                    onClick={() => handleStatusChange(s)}
                                    disabled={updatingStatus || lead.status === s}
                                    id={`status-btn-${s}`}
                                >
                                    {updatingStatus && lead.status !== s ? <span className="spinner" /> : null}
                                    {formatStatus(s)}
                                    {lead.status === s && ' •'}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* ── Right: Notes ── */}
                <div>
                    {/* Add Note Form */}
                    <div className="card" style={{ marginBottom: 24 }}>
                        <div className="section-title">Add a Note</div>

                        {noteSuccess && (
                            <div className="alert alert-success" style={{ marginBottom: 16 }}>{noteSuccess}</div>
                        )}

                        <form onSubmit={handleAddNote}>
                            <div className="form-group">
                                <textarea
                                    className="form-textarea"
                                    placeholder="e.g. Customer asked for pricing details, follow-up call scheduled..."
                                    value={noteText}
                                    onChange={(e) => { setNoteText(e.target.value); setNoteError(''); }}
                                    rows={4}
                                    id="note-textarea"
                                />
                                {noteError && <span className="form-error">{noteError}</span>}
                            </div>
                            <button
                                type="submit" className="btn btn-primary"
                                disabled={addingNote || !noteText.trim()}
                                id="add-note-btn"
                            >
                                {addingNote ? <><span className="spinner" /> Adding...</> : '+ Add Note'}
                            </button>
                        </form>
                    </div>

                    {/* Notes Timeline */}
                    <div className="card">
                        <div className="section-title">
                            Interaction History
                            {notes.length > 0 && (
                                <span className="tag" style={{ marginLeft: 8 }}>{notes.length} note{notes.length !== 1 ? 's' : ''}</span>
                            )}
                        </div>

                        {notes.length === 0 ? (
                            <div style={{ textAlign: 'center', padding: '32px 0', color: 'var(--text-muted)' }}>
                                <div style={{ fontSize: 40, marginBottom: 12 }}></div>
                                <p>No notes yet. Add the first note above.</p>
                            </div>
                        ) : (
                            <div className="notes-timeline">
                                {notes.map((note, i) => (
                                    <div key={note.id} className="note-item">
                                        <div className="note-dot-col">
                                            <div className="note-dot" />
                                            {i < notes.length - 1 && <div className="note-line" />}
                                        </div>
                                        <div className="note-body">
                                            <div className="note-text">{note.note_text}</div>
                                            <div className="note-time" title={formatDateTime(note.created_at)}>
                                                {formatRelativeTime(note.created_at)} · {formatDateTime(note.created_at)}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
