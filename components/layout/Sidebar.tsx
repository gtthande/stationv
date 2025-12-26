// components/layout/Sidebar.tsx
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  GaugeCircle,
  Boxes,
  ClipboardList,
  RefreshCcw,
  Wrench,
  Building2,
  Users,
  FileBarChart2,
  Settings,
  User,
} from 'lucide-react';

type NavItem = {
  href: string;
  label: string;
  icon: React.ElementType;
};

const navItems: NavItem[] = [
  { href: '/dashboard', label: 'Dashboard', icon: GaugeCircle },
  { href: '/dashboard/inventory', label: 'Inventory', icon: Boxes },
  { href: '/dashboard/job-cards', label: 'Job Cards', icon: ClipboardList },
  { href: '/dashboard/rotables', label: 'Rotables', icon: RefreshCcw },
  { href: '/dashboard/tools', label: 'Tools', icon: Wrench },
  { href: '/dashboard/suppliers', label: 'Suppliers', icon: Building2 },
  { href: '/dashboard/customers', label: 'Customers', icon: Users },
  { href: '/dashboard/reports', label: 'Reports', icon: FileBarChart2 },
  { href: '/dashboard/admin', label: 'Admin', icon: User },
  { href: '/dashboard/settings', label: 'Settings', icon: Settings },
];

export default function Sidebar() {
  const pathname = usePathname();
  return (
    <aside className="w-56 border-r border-border/30 bg-muted/10 p-4">
      <h2 className="mb-8 text-xl font-semibold text-foreground/90">Station‑2100</h2>
      <nav className="space-y-1">
      {navItems.map(({ href, label, icon: Icon }) => {
        const active = pathname === href;
        return (
          <Link
            key={href}
            href={href}
            className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors relative
              ${active 
                ? 'bg-accent/8 text-foreground font-medium' 
                : 'hover:bg-accent/5 text-foreground/70'
              }`}
          >
            {active && (
              <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-primary/60 rounded-r-full" />
            )}
            <Icon size={18} className={active ? 'text-primary/80' : 'text-foreground/60'} />
            <span>{label}</span>
          </Link>
        );
      })}
      </nav>
    </aside>
  );
}

