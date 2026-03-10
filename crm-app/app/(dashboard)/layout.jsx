'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { isAuthenticated } from '@/lib/api';
import Navbar from '@/components/Navbar';

export default function DashboardLayout({ children }) {
    const router = useRouter();

    useEffect(() => {
        if (!isAuthenticated()) {
            router.replace('/login');
        }
    }, [router]);

    return (
        <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
            <Navbar />
            <main className="main-content">
                {children}
            </main>
        </div>
    );
}
