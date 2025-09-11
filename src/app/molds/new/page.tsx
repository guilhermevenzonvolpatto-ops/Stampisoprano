
import { AddMoldForm } from './add-mold-form';
import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';
import { RestrictedPage } from '@/components/layout/restricted-page';
import { getMolds } from '@/lib/data';


export default async function NewMoldPage() {
  const molds = await getMolds();

  return (
    <RestrictedPage adminOnly>
      <div className="container mx-auto py-10">
        <Link
            href="/molds"
            className="text-sm text-muted-foreground hover:underline flex items-center mb-4"
        >
            <ChevronLeft className="h-4 w-4 mr-1" />
            Back to Mold Inventory
        </Link>
        <h1 className="text-3xl font-bold font-headline mb-2">Add New Mold</h1>
        <p className="text-muted-foreground mb-6">Fill out the form below to add a new mold to the system.</p>
        <AddMoldForm allMolds={molds} />
      </div>
    </RestrictedPage>
  );
}
