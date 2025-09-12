
import { getMolds, getComponents, getUser } from '@/lib/data';
import { notFound } from 'next/navigation';
import { UserPermissionsForm } from './user-permissions-form';
import { RestrictedPage } from '@/components/layout/restricted-page';
import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function EditUserPage({ params }: { params: { id: string } }) {
  const user = await getUser(params.id);
  if (!user) {
    notFound();
  }

  const molds = await getMolds();
  const components = await getComponents();

  return (
    <RestrictedPage adminOnly>
      <div className="container mx-auto py-10">
        <Link
            href="/users/manage"
            className="text-sm text-muted-foreground hover:underline flex items-center mb-4"
        >
            <ChevronLeft className="h-4 w-4 mr-1" />
            Back to User Management
        </Link>
        <h1 className="text-3xl font-bold font-headline mb-2">Manage Permissions for {user.name}</h1>
        <p className="text-muted-foreground mb-6">Select the molds and components this user can access.</p>
        
        <UserPermissionsForm 
          user={user} 
          allMolds={molds} 
          allComponents={components} 
        />
      </div>
    </RestrictedPage>
  );
}
