'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  FileText,
  Users,
  MessageCircle,
  Building2,
  LogOut,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/stores/auth.store';

const navItems = [
  { href: '/', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/stellen', label: 'Stellen', icon: FileText },
  { href: '/bewerber', label: 'Bewerber', icon: Users },
  { href: '/chat', label: 'Chat', icon: MessageCircle },
  { href: '/profil', label: 'Profil', icon: Building2 },
];

export function Sidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuthStore();

  return (
    <aside className="sticky top-0 flex h-screen w-[260px] flex-col bg-white shadow-sidebar">
      {/* Brand */}
      <div className="flex items-center gap-3 px-6 py-6">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-primary-dark text-white font-bold text-sm tracking-tight">
          LM
        </div>
        <div>
          <p className="text-[15px] font-semibold tracking-tight text-text">LehrMatch</p>
          <p className="text-[11px] font-medium text-text-tertiary tracking-wide uppercase">Firmen-Dashboard</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-2">
        <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-widest text-text-tertiary">
          Navigation
        </p>
        <div className="space-y-0.5">
          {navItems.map((item) => {
            const isActive =
              item.href === '/'
                ? pathname === '/'
                : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-[13px] font-medium transition-all duration-150',
                  isActive
                    ? 'bg-primary/8 text-primary-dark font-semibold'
                    : 'text-text-secondary hover:bg-background hover:text-text',
                )}
              >
                {isActive && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 h-5 w-[3px] rounded-r-full bg-primary" />
                )}
                <item.icon className={cn('h-[18px] w-[18px] transition-colors', isActive ? 'text-primary' : 'text-text-tertiary group-hover:text-text-secondary')} />
                {item.label}
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Footer */}
      <div className="border-t border-border-light px-3 py-4">
        {user && (
          <div className="mb-3 rounded-lg bg-background px-3 py-2">
            <p className="truncate text-[12px] font-medium text-text-secondary">
              {user.email}
            </p>
          </div>
        )}
        <button
          onClick={logout}
          className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-[13px] font-medium text-text-secondary hover:bg-error/5 hover:text-error transition-all duration-150"
        >
          <LogOut className="h-[18px] w-[18px]" />
          Abmelden
        </button>
      </div>
    </aside>
  );
}
