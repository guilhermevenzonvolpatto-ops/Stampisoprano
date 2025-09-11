
import { getComponent, getMolds, getComponents } from '@/lib/data';
import { notFound } from 'next/navigation';
import { EditComponentForm } from './edit-component-form';
import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';
import { RestrictedPage } from '@/components/layout/restricted-page';

export async function generateStaticParams() {
  const components = await getComponents();
  return components.map((component) => ({
    id: component.id,
  }));
}

export default async function EditComponentPage({ params }: { params: { id: string } }) {
  const componentToEdit = await getComponent(params.id);
  if (!componentToEdit) {
    notFound();
  }

  const allMolds = await getMolds();

  return (
    <RestrictedPage allowedCode={componentToEdit.codice}>
      <div className="container mx-auto py-10">
        <Link
            href={`/components/${params.id}`}
            className="text-sm text-muted-foreground hover:underline flex items-center mb-4"
        >
            <ChevronLeft className="h-4 w-4 mr-1" />
            Back to Component Details
        </Link>
        <h1 className="text-3xl font-bold font-headline mb-2">Edit Component</h1>
        <p className="text-muted-foreground mb-6">Modify the details for component <span className="font-mono bg-muted px-2 py-1 rounded">{componentToEdit.codice}</span>.</p>
        <EditComponentForm
            component={componentToEdit}
            allMolds={allMolds}
        />
      </div>
    </RestrictedPage>
  );
}
