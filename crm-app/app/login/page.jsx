'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { login } from '@/lib/api';

export default function LoginPage() {
    const router = useRouter();
    const [tab, setTab] = useState('login'); // 'login' | 'register'
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            const { register } = await import('@/lib/api');
            const fn = tab === 'login' ? login : register;
            await fn(email, password);
            router.push('/leads');
        } catch (err) {
            setError(err.message || 'Authentication failed. Please try again.');
            setLoading(false);
        }
    };

    return (
        <div className="login-page">
            <div className="login-bg-glow" />

            <div className="login-card fade-in">
                {/* Logo */}
                <div className="login-logo">
                    <div className="login-logo-icon">R</div>
                    <div className="login-logo-text">RelAI CRM</div>
                </div>

                {/* Tab Toggle */}
                <div style={{
                    display: 'flex',
                    background: 'var(--bg-secondary)',
                    border: '1px solid var(--border)',
                    borderRadius: 'var(--radius-md)',
                    padding: 4,
                    marginBottom: 28,
                    gap: 4,
                }}>
                    {['login', 'register'].map((t) => (
                        <button
                            key={t}
                            onClick={() => { setTab(t); setError(''); }}
                            style={{
                                flex: 1,
                                padding: '8px 0',
                                borderRadius: 'var(--radius-sm)',
                                border: 'none',
                                fontSize: 14,
                                fontWeight: 500,
                                background: tab === t ? 'var(--accent)' : 'transparent',
                                color: tab === t ? '#fff' : 'var(--text-secondary)',
                                cursor: 'pointer',
                                transition: 'var(--transition)',
                            }}
                        >
                            {t === 'login' ? 'Sign In' : 'Register'}
                        </button>
                    ))}
                </div>

                <h1 className="login-title">
                    {tab === 'login' ? 'Welcome back' : 'Create account'}
                </h1>
                <p className="login-subtitle">
                    {tab === 'login'
                        ? 'Sign in to your team\'s lead management dashboard'
                        : 'Register a new team account to get started'}
                </p>

                {error && (
                    <div className="login-alert login-alert-error">
                        <span>{error}</span>
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label className="form-label" htmlFor="email">Email Address</label>
                        <input
                            id="email"
                            type="email"
                            className="form-input"
                            placeholder="you@company.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            autoComplete="email"
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label" htmlFor="password">Password</label>
                        <input
                            id="password"
                            type="password"
                            className="form-input"
                            placeholder={tab === 'register' ? 'At least 6 characters' : 'Your password'}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            autoComplete={tab === 'login' ? 'current-password' : 'new-password'}
                        />
                    </div>

                    <button
                        type="submit"
                        className="btn btn-primary"
                        disabled={loading}
                        style={{ width: '100%', justifyContent: 'center', padding: '14px' }}
                        id="auth-submit-btn"
                    >
                        {loading
                            ? <><span className="spinner" /> {tab === 'login' ? 'Signing in...' : 'Creating account...'}</>
                            : tab === 'login' ? 'Sign In →' : 'Create Account →'
                        }
                    </button>
                </form>

                <div className="login-footer">
                    <p style={{ marginTop: '8px', fontSize: 12, color: 'var(--text-muted)' }}>
                        Backend: Node.js + Express + SQLite
                    </p>
                </div>
            </div>
        </div>
    );
}
