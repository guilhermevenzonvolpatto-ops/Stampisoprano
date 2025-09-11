
import { getMolds } from '@/lib/data';
import { AddComponentForm } from './add-component-form';
import { RestrictedPage } from '@/components/layout/restricted-page';
import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';

export default async function NewComponentPage() {
  const molds = await getMolds();

  return (
    <RestrictedPage adminOnly>
      <div className="container mx-auto py-10">
        <Link
          href="/components"
          className="text-sm text-muted-foreground hover:underline flex items-center mb-4"
        >
          <ChevronLeft className="h-4 w-4 mr-1" />
          Back to Component Inventory
        </Link>
        <h1 className="text-3xl font-bold font-headline mb-2">Add New Component</h1>
        <p className="text-muted-foreground mb-6">Fill out the form below to add a new component to the system.</p>
        <AddComponentForm allMolds={molds} />
      </div>
    </RestrictedPage>
  );
}
