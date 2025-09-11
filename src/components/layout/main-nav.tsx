'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Package, LayoutDashboard, Component as ComponentIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

export function MainNav() {
  const pathname = usePathname();

  const routes = [
    { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/molds', label: 'Stampi', icon: Package },
    { href: '/components', label: 'Componenti', icon: ComponentIcon },
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
        <span className="hidden font-bold sm:inline-block">Sopranostampi</span>
      </Link>
      <nav className="flex items-center gap-4 text-sm lg:gap-6">
        {routes.map((route) => (
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
        ))}
      </nav>
    </div>
  );
}
