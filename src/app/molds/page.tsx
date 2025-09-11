import { getMolds } from '@/lib/data';
import { MoldsTable } from './components/molds-table';
import { RestrictedPage } from '@/components/layout/restricted-page';

export default async function MoldsPage() {
  const molds = await getMolds();

  return (
    <RestrictedPage>
      <div className="container mx-auto py-10">
        <h1 className="text-3xl font-bold font-headline mb-2">Mold Inventory</h1>
        <p className="text-muted-foreground mb-6">Manage and track all molds in the system.</p>
        <MoldsTable data={molds} />
      </div>
    </RestrictedPage>
  );
}
