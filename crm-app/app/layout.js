import './globals.css';

import { ThemeProvider } from '@/components/ThemeProvider';

export const metadata = {
  title: 'RelAI CRM — Lead Management',
  description: 'Internal lead management system to capture, track, and manage potential customers.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
