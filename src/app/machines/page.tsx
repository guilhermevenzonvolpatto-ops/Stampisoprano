

import { getMachines, getUpcomingEvents } from '@/lib/data';
import { MachinesTable } from '@/app/machines/components/machines-table';
import { RestrictedPage } from '@/components/layout/restricted-page';
import Header from '@/components/layout/header';
import type { Machine } from '@/lib/types';

export default async function MachinesPage() {
  const machines = await getMachines();
  const allEvents = await getUpcomingEvents();

  const availabilityMap = new Map<string, string>();
  allEvents.sort((a, b) => new Date(b.estimatedEndDate).getTime() - new Date(a.estimatedEndDate).getTime());

  for (const event of allEvents) {
      if (!availabilityMap.has(event.sourceId)) {
          if (event.estimatedEndDate) {
            availabilityMap.set(event.sourceId, new Date(event.estimatedEndDate).toLocaleDateString());
          }
      }
  }
  
  const machinesWithAvailability = machines.map(machine => {
      return {
          ...machine,
          availableAt: availabilityMap.get(machine.id)
      }
  });


  return (
    <RestrictedPage adminOnly>
      <div className="flex flex-col h-screen">
        <Header />
        <main className="flex-1 overflow-y-auto">
            <div className="container mx-auto py-10">
                <h1 className="text-3xl font-bold font-headline mb-2">Machine Inventory</h1>
                <p className="text-muted-foreground mb-6">Manage and track all machines and assets in the system.</p>
                <MachinesTable data={machinesWithAvailability} />
            </div>
      </main>
      </div>
    </RestrictedPage>
  );
}
