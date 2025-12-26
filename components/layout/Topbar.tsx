// components/layout/Topbar.tsx
'use client';

import { usePathname } from 'next/navigation';
import ThemeToggle from './ThemeToggle';

const pageTitles: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/inventory': 'Inventory',
  '/job-cards': 'Job Cards',
  '/rotables': 'Rotables',
  '/tools': 'Tools',
  '/suppliers': 'Suppliers',
  '/customers': 'Customers',
  '/reports': 'Reports',
  '/admin': 'Admin',
  '/settings': 'Settings',
};

export default function Topbar() {
  const pathname = usePathname();
  const title = pageTitles[pathname] || 'Dashboard';

  return (
    <header className="flex items-center justify-between border-b border-border/30 bg-background/80 backdrop-blur-sm px-8 py-4 h-16">
      <h1 className="text-xl font-semibold text-foreground/90">{title}</h1>
      <div className="flex items-center gap-3">
        {/* Extend with notifications/user profile later */}
        <div className="flex items-center gap-2">
          {/* Avatar placeholder */}
          <div className="w-8 h-8 rounded-full bg-muted/50 flex items-center justify-center">
            <span className="text-xs font-medium text-muted-foreground">U</span>
          </div>
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}

