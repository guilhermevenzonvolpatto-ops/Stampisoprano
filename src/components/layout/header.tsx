import { MainNav } from '@/components/layout/main-nav';
import { UserNav } from '@/components/layout/user-nav';
import { Button } from '../ui/button';
import { PlusCircle } from 'lucide-react';
import Link from 'next/link';
import { AdminButton } from './admin-button';

export default function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 max-w-screen-2xl items-center">
        <MainNav />
        <div className="flex flex-1 items-center justify-end space-x-4">
          <AdminButton href="/molds/new">
            <PlusCircle className="mr-2 h-4 w-4" /> Add Mold
          </AdminButton>
          <UserNav />
        </div>
      </div>
    </header>
  );
}
