
import { getMold, getMolds } from '@/lib/data';
import { notFound } from 'next/navigation';
import { EditMoldForm } from './edit-mold-form';
import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';
import { RestrictedPage } from '@/components/layout/restricted-page';

export default async function EditMoldPage({ params }: { params: { id: string } }) {
  const moldToEdit = await getMold(params.id);
  if (!moldToEdit) {
    notFound();
  }

  const allMolds = await getMolds();

  return (
    <RestrictedPage adminOnly>
      <div className="container mx-auto py-10">
        <Link
            href={`/molds/${params.id}`}
            className="text-sm text-muted-foreground hover:underline flex items-center mb-4"
        >
            <ChevronLeft className="h-4 w-4 mr-1" />
            Back to Mold Details
        </Link>
        <h1 className="text-3xl font-bold font-headline mb-2">Edit Mold</h1>
        <p className="text-muted-foreground mb-6">Modify the details for mold <span className="font-mono bg-muted px-2 py-1 rounded">{moldToEdit.codice}</span>.</p>
        <EditMoldForm
            mold={moldToEdit}
            allMolds={allMolds.filter(m => m.id !== moldToEdit.id)}
        />
      </div>
    </RestrictedPage>
  );
}
