

'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Package, LayoutDashboard, Component as ComponentIcon, Users, HardHat, Calendar, Wrench } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useApp } from '@/context/app-context';

export function MainNav() {
  const pathname = usePathname();
  const { user, t } = useApp();

  const routes = [
    { href: '/dashboard', label: t('dashboard'), icon: LayoutDashboard },
    { href: '/molds', label: t('molds'), icon: Package },
    { href: '/components', label: t('components'), icon: ComponentIcon },
    { href: '/machines', label: t('machines'), icon: HardHat, admin: true },
    { href: '/calendar', label: 'Calendar', icon: Calendar, admin: true },
    { href: '/requests/new', label: 'Maintenance Requests', icon: Wrench, admin: true },
    { href: '/users/manage', label: t('users'), icon: Users, admin: true },
  ];

  return (
    <div className="mr-4 hidden md:flex">
      <Link href="/" className="mr-6 flex items-center space-x-2">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="h-6 w-6 text-primary"
        >
          <path d="M21.5 8.5L12 3.5L2.5 8.5" />
          <path d="M2.5 15.5L12 20.5L21.5 15.5" />
          <path d="M12 3.5V20.5" />
          <path d="M21.5 8.5V15.5" />
          <path d="M2.5 8.5V15.5" />
          <path d="M17 6L7 11" />
        </svg>
        <span className="hidden font-bold sm:inline-block">{t('moldManager')}</span>
      </Link>
      <nav className="flex items-center gap-4 text-sm lg:gap-6">
        {routes.map((route) => {
            if (route.admin && !user?.isAdmin) return null;
            if (!user && (route.href !== '/')) return null;
            if (user && route.href === '/') return null;
            return (
              <Link
                key={route.href}
                href={route.href}
                className={cn(
                  'transition-colors hover:text-foreground/80',
                  pathname.startsWith(route.href)
                    ? 'text-foreground'
                    : 'text-foreground/60'
                )}
              >
                {route.label}
              </Link>
            )
        })}
      </nav>
    </div>
  );
}
