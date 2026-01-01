import './globals.css';
import { ThemeProvider } from '@/lib/ThemeProvider';
import { ToastProvider } from '@/components/ui/Toast';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Station‑2100',
  description: 'Aviation maintenance & inventory platform',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      {/* next-themes will toggle class on <html> via ThemeProvider */}
      <body className="min-h-screen font-sans antialiased bg-background text-foreground">
        <ThemeProvider>
          <ToastProvider>
            {children}
          </ToastProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}