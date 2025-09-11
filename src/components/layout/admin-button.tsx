'use client';

import * as React from 'react';
import Link from 'next/link';
import { useApp } from '@/context/app-context';
import { Button, type ButtonProps } from '@/components/ui/button';

interface AdminButtonProps extends ButtonProps {
    href: string;
    children: React.ReactNode;
}

export function AdminButton({ href, children, ...props }: AdminButtonProps) {
  const { user } = useApp();

  if (!user || !user.isAdmin) {
    return null;
  }

  return (
    <Button asChild {...props}>
      <Link href={href}>
        {children}
      </Link>
    </Button>
  );
}
