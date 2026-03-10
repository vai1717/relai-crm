'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { getLeads, exportCSV } from '@/lib/api';
import {
    getStatusBadgeClass,
    getSourceBadgeClass,
    formatStatus,
    formatSource,
    formatRelativeTime,
    formatDateTime,
} from '@/lib/utils';

export default function LeadsPage() {
    const router = useRouter();
    const [leads, setLeads] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [sourceFilter, setSourceFilter] = useState('');
    const [exporting, setExporting] = useState(false);
    const [error, setError] = useState('');

    const fetchLeads = useCallback(async () => {
        setLoading(true);
        setError('');
        try {
            const data = await getLeads({ search, status: statusFilter, source: sourceFilter });
            setLeads(data.leads || []);
        } catch (err) {
            if (err.status === 401) {
                router.replace('/login');
            } else {
                setError(err.message);
            }
        } finally {
            setLoading(false);
        }
    }, [search, statusFilter, sourceFilter, router]);

    useEffect(() => {
        const t = setTimeout(fetchLeads, 300);
        return () => clearTimeout(t);
    }, [fetchLeads]);

    const handleExport = async () => {
        setExporting(true);
        try {
            const blob = await exportCSV();
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `leads_${new Date().toISOString().slice(0, 10)}.csv`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        } catch (err) {
            alert('Export failed: ' + err.message);
        } finally {
            setExporting(false);
        }
    };

    const newLeads = leads.filter((l) => l.status === 'new').length;
    const followUpLeads = leads.filter((l) => l.status === 'follow_up').length;
    const closedLeads = leads.filter((l) => l.status === 'closed').length;

    return (
        <div className="fade-in">
            {/* Page Header */}
            <div className="page-header">
                <div>
                    <h1 className="page-title">Leads Dashboard</h1>
                    <p className="page-subtitle">Track and manage your potential customers</p>
                </div>
                <div className="flex gap-12">
                    <button onClick={handleExport} className="btn btn-secondary" disabled={exporting} id="export-csv-btn">
                        {exporting ? <span className="spinner" /> : null} Export CSV
                    </button>
                    <Link href="/leads/new" className="btn btn-primary" id="create-lead-btn">
                        + Create Lead
                    </Link>
                </div>
            </div>

            {/* Stats */}
            <div className="stats-row">
                <div className="stat-card">
                    <span className="stat-label">Total Leads</span>
                    <span className="stat-value">{leads.length}</span>
                </div>
                <div className="stat-card accent">
                    <span className="stat-label">New</span>
                    <span className="stat-value">{newLeads}</span>
                </div>
                <div className="stat-card warning">
                    <span className="stat-label">Follow Up</span>
                    <span className="stat-value">{followUpLeads}</span>
                </div>
                <div className="stat-card success">
                    <span className="stat-label">Closed</span>
                    <span className="stat-value">{closedLeads}</span>
                </div>
            </div>

            {/* Search & Filter */}
            <div className="search-filter-bar">
                <div className="search-wrapper">
                    <span className="search-icon"></span>
                    <input
                        type="text"
                        className="search-input"
                        placeholder="Search by name or phone..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        id="search-leads"
                    />
                </div>
                <select className="filter-select" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} id="filter-status">
                    <option value="">All Statuses</option>
                    <option value="new">New</option>
                    <option value="follow_up">Follow Up</option>
                    <option value="closed">Closed</option>
                </select>
                <select className="filter-select" value={sourceFilter} onChange={(e) => setSourceFilter(e.target.value)} id="filter-source">
                    <option value="">All Sources</option>
                    <option value="website">Website</option>
                    <option value="whatsapp">WhatsApp</option>
                    <option value="referral">Referral</option>
                    <option value="ads">Ads</option>
                </select>
                {(search || statusFilter || sourceFilter) && (
                    <button className="btn btn-ghost btn-sm" onClick={() => { setSearch(''); setStatusFilter(''); setSourceFilter(''); }}>
                        ✕ Clear
                    </button>
                )}
            </div>

            {/* Error */}
            {error && (
                <div className="alert alert-error" style={{ marginBottom: 16 }}>{error}</div>
            )}

            {/* Table */}
            <div className="table-container">
                <div className="table-header-row">
                    <span className="table-meta">
                        {loading ? 'Loading...' : `${leads.length} lead${leads.length !== 1 ? 's' : ''} found`}
                    </span>
                </div>

                {loading ? (
                    <div className="empty-state">
                        <span className="spinner" style={{ width: 32, height: 32, borderWidth: 3 }} />
                        <p className="empty-title" style={{ marginTop: 16 }}>Loading leads...</p>
                    </div>
                ) : leads.length === 0 ? (
                    <div className="empty-state">
                        <div className="empty-icon"></div>
                        <p className="empty-title">No leads found</p>
                        <p className="empty-desc">
                            {search || statusFilter || sourceFilter
                                ? 'Try adjusting your search or filters.'
                                : 'Create your first lead to get started.'}
                        </p>
                        {!search && !statusFilter && !sourceFilter && (
                            <Link href="/leads/new" className="btn btn-primary">+ Create Lead</Link>
                        )}
                    </div>
                ) : (
                    <div style={{ overflowX: 'auto' }}>
                        <table>
                            <thead>
                                <tr>
                                    <th>Name</th>
                                    <th>Phone</th>
                                    <th>City</th>
                                    <th>Source</th>
                                    <th>Status</th>
                                    <th>Created At</th>
                                </tr>
                            </thead>
                            <tbody>
                                {leads.map((lead) => (
                                    <tr key={lead.id} onClick={() => router.push(`/leads/${lead.id}`)} title="View lead details">
                                        <td className="td-name">{lead.name}</td>
                                        <td className="td-phone">{lead.phone}</td>
                                        <td className="td-city">{lead.city || <span className="text-muted">—</span>}</td>
                                        <td>
                                            {lead.source
                                                ? <span className={getSourceBadgeClass(lead.source)}>{formatSource(lead.source)}</span>
                                                : <span className="text-muted">—</span>}
                                        </td>
                                        <td>
                                            <span className={getStatusBadgeClass(lead.status)}>{formatStatus(lead.status)}</span>
                                        </td>
                                        <td style={{ color: 'var(--text-secondary)', fontSize: 13, whiteSpace: 'nowrap' }}>
                                            {formatDateTime(lead.created_at)}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}
