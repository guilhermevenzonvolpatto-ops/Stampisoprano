
import { getMachine } from '@/lib/data';
import { notFound } from 'next/navigation';
import { EditMachineForm } from './edit-machine-form';
import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';
import { RestrictedPage } from '@/components/layout/restricted-page';

export default async function EditMachinePage({ params }: { params: { id: string } }) {
  const machineToEdit = await getMachine(params.id);
  if (!machineToEdit) {
    notFound();
  }

  return (
    <RestrictedPage adminOnly>
      <div className="container mx-auto py-10">
        <Link
            href={`/machines/${params.id}`}
            className="text-sm text-muted-foreground hover:underline flex items-center mb-4"
        >
            <ChevronLeft className="h-4 w-4 mr-1" />
            Back to Machine Details
        </Link>
        <h1 className="text-3xl font-bold font-headline mb-2">Edit Machine</h1>
        <p className="text-muted-foreground mb-6">Modify the details for machine <span className="font-mono bg-muted px-2 py-1 rounded">{machineToEdit.codice}</span>.</p>
        <EditMachineForm
            machine={machineToEdit}
        />
      </div>
    </RestrictedPage>
  );
}
