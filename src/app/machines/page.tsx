'use client';

import * as React from 'react';
import { getMachines, getUpcomingEvents } from '@/lib/data';
import { MachinesTable } from '@/app/machines/components/machines-table';
import { RestrictedPage } from '@/components/layout/restricted-page';
import Header from '@/components/layout/header';
import type { Machine } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';

export default function MachinesPage() {
  const [machines, setMachines] = React.useState<Machine[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    async function fetchData() {
      const machinesData = await getMachines();
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

      const machinesWithAvailability = machinesData.map(machine => ({
        ...machine,
        availableAt: availabilityMap.get(machine.id)
      }));

      setMachines(machinesWithAvailability);
      setIsLoading(false);
    }
    fetchData();
  }, []);

  return (
    <RestrictedPage adminOnly>
      <div className="flex flex-col h-screen">
        <Header />
        <main className="flex-1 overflow-y-auto">
          <div className="container mx-auto py-10">
            <h1 className="text-3xl font-bold font-headline mb-2">Machine Inventory</h1>
            <p className="text-muted-foreground mb-6">Manage and track all machines and assets in the system.</p>
            {isLoading ? (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <Skeleton className="h-10 w-96" />
                  <Skeleton className="h-10 w-40" />
                </div>
                <Skeleton className="h-96 w-full" />
              </div>
            ) : (
              <MachinesTable data={machines} />
            )}
          </div>
        </main>
      </div>
    </RestrictedPage>
  );
}
