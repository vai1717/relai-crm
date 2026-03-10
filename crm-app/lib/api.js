/**
 * Centralized API client for the Express backend.
 * Reads JWT token from localStorage and attaches it to all requests.
 */

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
const API_KEY = process.env.NEXT_PUBLIC_API_KEY || 'my_secret_key';

function getToken() {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('crm_token');
}

function authHeaders() {
    const token = getToken();
    return token ? { Authorization: `Bearer ${token}` } : {};
}

async function request(path, options = {}) {
    const { apiKey = false, ...rest } = options;
    const headers = {
        'Content-Type': 'application/json',
        ...(apiKey ? { 'x-api-key': API_KEY } : authHeaders()),
        ...(options.headers || {}),
    };

    const res = await fetch(`${API_URL}${path}`, { ...rest, headers });
    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
        const err = new Error(data.error || `HTTP ${res.status}`);
        err.status = res.status;
        err.data = data;
        throw err;
    }

    return data;
}

// ── Auth ─────────────────────────────────────────────────────────────────────

export async function login(email, password) {
    const data = await request('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
    });
    localStorage.setItem('crm_token', data.token);
    localStorage.setItem('crm_user', JSON.stringify(data.user));
    return data;
}

export async function register(email, password) {
    const data = await request('/auth/register', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
    });
    localStorage.setItem('crm_token', data.token);
    localStorage.setItem('crm_user', JSON.stringify(data.user));
    return data;
}

export function logout() {
    localStorage.removeItem('crm_token');
    localStorage.removeItem('crm_user');
}

export function getCurrentUser() {
    if (typeof window === 'undefined') return null;
    try {
        return JSON.parse(localStorage.getItem('crm_user'));
    } catch {
        return null;
    }
}

export function isAuthenticated() {
    return !!getToken();
}

// ── Leads ─────────────────────────────────────────────────────────────────────

export function getLeads({ search = '', status = '', source = '' } = {}) {
    const params = new URLSearchParams();
    if (search) params.set('search', search);
    if (status) params.set('status', status);
    if (source) params.set('source', source);
    return request(`/api/leads?${params.toString()}`);
}

export function getLead(id) {
    return request(`/api/leads/${id}`);
}

export function createLead(payload) {
    return request('/api/leads', {
        method: 'POST',
        apiKey: true,
        body: JSON.stringify(payload),
    });
}

export function updateLead(id, payload) {
    return request(`/api/leads/${id}`, {
        method: 'PUT',
        body: JSON.stringify(payload),
    });
}

export function deleteLead(id) {
    return request(`/api/leads/${id}`, { method: 'DELETE' });
}

// ── Notes ─────────────────────────────────────────────────────────────────────

export function getNotes(leadId) {
    return request(`/api/leads/${leadId}/notes`);
}

export function createNote(leadId, note_text) {
    return request(`/api/leads/${leadId}/notes`, {
        method: 'POST',
        apiKey: true,
        body: JSON.stringify({ note_text }),
    });
}

// ── Export ────────────────────────────────────────────────────────────────────

export async function exportCSV() {
    const token = getToken();
    const res = await fetch(`${API_URL}/api/export`, {
        headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) throw new Error('Export failed');
    return res.blob();
}
