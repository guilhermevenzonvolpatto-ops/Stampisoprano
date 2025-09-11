
import { getComponents } from '@/lib/data';
import { ComponentsTable } from '@/app/components/components-table';
import { RestrictedPage } from '@/components/layout/restricted-page';

export default async function ComponentsPage() {
  const components = await getComponents();

  return (
    <RestrictedPage>
      <div className="container mx-auto py-10">
        <h1 className="text-3xl font-bold font-headline mb-2">Component Inventory</h1>
        <p className="text-muted-foreground mb-6">Browse and manage all components in the system.</p>
        <ComponentsTable data={components} />
      </div>
    </RestrictedPage>
  );
}
