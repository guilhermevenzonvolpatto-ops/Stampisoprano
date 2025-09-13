
import { getMachines } from '@/lib/data';
import { MachinesTable } from '@/app/machines/components/machines-table';
import { RestrictedPage } from '@/components/layout/restricted-page';
import Header from '@/components/layout/header';

export default async function MachinesPage() {
  const machines = await getMachines();

  return (
    <RestrictedPage adminOnly>
        <Header />
        <main className="flex-1">
            <div className="container mx-auto py-10">
                <h1 className="text-3xl font-bold font-headline mb-2">Machine Inventory</h1>
                <p className="text-muted-foreground mb-6">Manage and track all machines and assets in the system.</p>
                <MachinesTable data={machines} />
            </div>
      </main>
    </RestrictedPage>
  );
}
