
import { AddMachineForm } from './add-machine-form';
import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';
import { RestrictedPage } from '@/components/layout/restricted-page';

export default async function NewMachinePage() {
  return (
    <RestrictedPage adminOnly>
      <div className="container mx-auto py-10">
        <Link
            href="/machines"
            className="text-sm text-muted-foreground hover:underline flex items-center mb-4"
        >
            <ChevronLeft className="h-4 w-4 mr-1" />
            Back to Machine Inventory
        </Link>
        <h1 className="text-3xl font-bold font-headline mb-2">Add New Machine</h1>
        <p className="text-muted-foreground mb-6">Fill out the form below to add a new machine to the system.</p>
        <AddMachineForm />
      </div>
    </RestrictedPage>
  );
}
