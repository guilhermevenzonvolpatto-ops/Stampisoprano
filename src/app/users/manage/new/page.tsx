
import { AddUserForm } from './add-user-form';
import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';
import { RestrictedPage } from '@/components/layout/restricted-page';
import Header from '@/components/layout/header';

export default function NewUserPage() {
  return (
    <RestrictedPage adminOnly>
      <Header />
      <div className="container mx-auto py-10">
        <Link
          href="/users/manage"
          className="text-sm text-muted-foreground hover:underline flex items-center mb-4"
        >
          <ChevronLeft className="h-4 w-4 mr-1" />
          Back to User Management
        </Link>
        <h1 className="text-3xl font-bold font-headline mb-2">Create New User</h1>
        <p className="text-muted-foreground mb-6">
          Create a new non-administrator user account. You can set specific permissions after creation.
        </p>
        <AddUserForm />
      </div>
    </RestrictedPage>
  );
}
