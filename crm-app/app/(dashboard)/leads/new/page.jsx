'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createLead } from '@/lib/api';

export default function CreateLeadPage() {
    const router = useRouter();
    const [form, setForm] = useState({ name: '', phone: '', city: '', source: '', status: 'new' });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [duplicateLeadId, setDuplicateLeadId] = useState(null);
    const [fieldErrors, setFieldErrors] = useState({});
    const [customSource, setCustomSource] = useState('');

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
        setFieldErrors({ ...fieldErrors, [e.target.name]: '' });
        setError('');
        setDuplicateLeadId(null);
    };

    const validate = () => {
        const errors = {};
        if (!form.name.trim()) errors.name = 'Name is required';
        if (!form.phone.trim()) {
            errors.phone = 'Phone number is required';
        } else if (!/^[+\d][\d\s\-()]*$/.test(form.phone.trim())) {
            errors.phone = 'Please enter a valid phone number (digits, spaces, +, - allowed)';
        }
        return errors;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const errors = validate();
        if (Object.keys(errors).length > 0) { setFieldErrors(errors); return; }

        setLoading(true);
        setError('');
        setDuplicateLeadId(null);

        try {
            const data = await createLead({
                name: form.name.trim(),
                phone: form.phone.trim(),
                city: form.city.trim() || undefined,
                source: form.source === 'other' ? customSource.trim() : (form.source || undefined),
                status: form.status || 'new',
            });
            router.push(`/leads/${data.lead.id}`);
        } catch (err) {
            if (err.status === 409 && err.data?.existing_lead) {
                setDuplicateLeadId(err.data.existing_lead.id);
                setError(`Lead already exists: "${err.data.existing_lead.name}" has this phone number.`);
            } else {
                setError(err.message || 'Failed to create lead.');
            }
            setLoading(false);
        }
    };

    return (
        <div className="fade-in">
            <div className="breadcrumbs">
                <Link href="/leads">Leads</Link>
                <span className="breadcrumbs-sep">›</span>
                <span>Create New Lead</span>
            </div>

            <div className="page-header">
                <div>
                    <h1 className="page-title">Create New Lead</h1>
                    <p className="page-subtitle">Add a new potential customer to your pipeline</p>
                </div>
            </div>

            <div style={{ maxWidth: 680 }}>
                <div className="card">
                    {error && (
                        <div className="alert alert-error" style={{ marginBottom: 24 }}>
                            <div style={{ flex: 1 }}>
                                <div>{error}</div>
                                {duplicateLeadId && (
                                    <Link
                                        href={`/leads/${duplicateLeadId}`}
                                        style={{
                                            display: 'inline-flex', alignItems: 'center',
                                            marginTop: 8, padding: '6px 14px',
                                            background: 'var(--danger)', color: '#fff',
                                            borderRadius: 'var(--radius-md)', fontSize: 13, fontWeight: 500,
                                        }}
                                    >
                                        View Existing Lead →
                                    </Link>
                                )}
                            </div>
                        </div>
                    )}

                    <form onSubmit={handleSubmit}>
                        <div style={{ marginBottom: 16 }}><div className="tag">Required</div></div>
                        <div className="form-row">
                            <div className="form-group">
                                <label className="form-label" htmlFor="name">Full Name <span className="required">*</span></label>
                                <input
                                    id="name" name="name" type="text"
                                    className={`form-input ${fieldErrors.name ? 'input-error' : ''}`}
                                    placeholder="Tharun Sharma"
                                    value={form.name} onChange={handleChange}
                                />
                                {fieldErrors.name && <span className="form-error">{fieldErrors.name}</span>}
                            </div>
                            <div className="form-group">
                                <label className="form-label" htmlFor="phone">Phone Number <span className="required">*</span></label>
                                <input
                                    id="phone" name="phone" type="tel"
                                    className={`form-input ${fieldErrors.phone ? 'input-error' : ''}`}
                                    placeholder="+91 99555 52671"
                                    value={form.phone} onChange={handleChange}
                                />
                                {fieldErrors.phone && <span className="form-error">{fieldErrors.phone}</span>}
                            </div>
                        </div>

                        <div className="divider" />
                        <div style={{ marginBottom: 16 }}><div className="tag">Optional</div></div>

                        <div className="form-group">
                            <label className="form-label" htmlFor="city">City</label>
                            <input
                                id="city" name="city" type="text"
                                className="form-input" placeholder="Hyderabad"
                                value={form.city} onChange={handleChange}
                            />
                        </div>
                        <div className="form-row">
                            <div className="form-group">
                                <label className="form-label" htmlFor="source">Lead Source</label>
                                <select id="source" name="source" className="form-select" value={form.source} onChange={handleChange}>
                                    <option value="">Select source...</option>
                                    <option value="website">Website</option>
                                    <option value="whatsapp">WhatsApp</option>
                                    <option value="referral">Referral</option>
                                    <option value="ads">Ads</option>
                                    <option value="other">Other (specify)</option>
                                </select>
                                {form.source === 'other' && (
                                    <input
                                        type="text"
                                        className="form-input"
                                        placeholder="e.g. In-person event"
                                        value={customSource}
                                        onChange={(e) => setCustomSource(e.target.value)}
                                        style={{ marginTop: 8 }}
                                        autoFocus
                                    />
                                )}
                            </div>
                            <div className="form-group">
                                <label className="form-label" htmlFor="status">Status</label>
                                <select id="status" name="status" className="form-select" value={form.status} onChange={handleChange}>
                                    <option value="new">New</option>
                                    <option value="follow_up">Follow Up</option>
                                    <option value="closed">Closed</option>
                                </select>
                            </div>
                        </div>

                        <div className="flex gap-12">
                            <button
                                type="submit" className="btn btn-primary"
                                disabled={loading} id="submit-create-lead"
                                style={{ flex: 1, justifyContent: 'center' }}
                            >
                                {loading ? <><span className="spinner" /> Creating...</> : 'Create Lead'}
                            </button>
                            <Link href="/leads" className="btn btn-secondary">Cancel</Link>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
