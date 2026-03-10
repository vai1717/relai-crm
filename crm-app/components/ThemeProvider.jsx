'use client';

import { createContext, useContext, useEffect, useState } from 'react';

const ThemeContext = createContext({
    theme: 'dark',
    toggleTheme: () => null,
});

export function ThemeProvider({ children }) {
    const [theme, setTheme] = useState('dark');

    useEffect(() => {
        // Check local storage or system preference on mount
        const savedTheme = localStorage.getItem('crm-theme');
        if (savedTheme) {
            setTheme(savedTheme);
            document.documentElement.setAttribute('data-theme', savedTheme);
        } else {
            const prefersLight = window.matchMedia('(prefers-color-scheme: light)').matches;
            const initialTheme = prefersLight ? 'light' : 'dark';
            setTheme(initialTheme);
            document.documentElement.setAttribute('data-theme', initialTheme);
        }
    }, []);

    const toggleTheme = () => {
        const newTheme = theme === 'dark' ? 'light' : 'dark';
        setTheme(newTheme);
        localStorage.setItem('crm-theme', newTheme);
        document.documentElement.setAttribute('data-theme', newTheme);
    };

    return (
        <ThemeContext.Provider value={{ theme, toggleTheme }}>
            {children}
        </ThemeContext.Provider>
    );
}

export const useTheme = () => useContext(ThemeContext);
