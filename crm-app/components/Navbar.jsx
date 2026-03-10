'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getCurrentUser, logout } from '@/lib/api';
import Link from 'next/link';
import { useTheme } from '@/components/ThemeProvider';

export default function Navbar() {
    const router = useRouter();
    const [user, setUser] = useState(null);
    const { theme, toggleTheme } = useTheme();

    useEffect(() => {
        setUser(getCurrentUser());
    }, []);

    const handleLogout = () => {
        logout();
        router.push('/login');
    };

    const initials = user?.email ? user.email[0].toUpperCase() : '?';

    return (
        <nav className="navbar">
            <Link href="/leads" className="navbar-logo">
                <div className="logo-icon">R</div>
                <span>RelAI CRM</span>
            </Link>

            <div className="navbar-right">
                {user && (
                    <div className="navbar-user">
                        <div className="navbar-avatar">{initials}</div>
                        <span className="navbar-email">{user.email}</span>
                    </div>
                )}
                <div className="theme-switch-wrapper" onClick={toggleTheme} title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}>
                    <div className="theme-switch">
                        <span className="theme-switch-icon">🌙</span>
                        <span className="theme-switch-icon">☀️</span>
                        <div className="theme-switch-thumb" />
                    </div>
                </div>
                <button onClick={handleLogout} className="btn btn-ghost btn-sm" id="logout-btn">
                    Logout
                </button>
            </div>
        </nav>
    );
}
