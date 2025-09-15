'use client';

import * as React from 'react';
import { getMolds, getUpcomingEvents } from '@/lib/data';
import { MoldsTable } from './components/molds-table';
import { RestrictedPage } from '@/components/layout/restricted-page';
import type { Mold } from '@/lib/types';
import Header from '@/components/layout/header';
import { Skeleton } from '@/components/ui/skeleton';

export default function MoldsPage() {
  const [molds, setMolds] = React.useState<Mold[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    async function fetchData() {
      const moldsData = await getMolds();
      const allEvents = await getUpcomingEvents();

      const availabilityMap = new Map<string, string>();
      allEvents.sort((a, b) => new Date(b.estimatedEndDate).getTime() - new Date(a.estimatedEndDate).getTime());

      for (const event of allEvents) {
        if (!availabilityMap.has(event.sourceId)) {
          const date = event.status === 'Chiuso' ? event.actualEndDate : event.estimatedEndDate;
          if (date) {
            availabilityMap.set(event.sourceId, new Date(date).toLocaleDateString());
          }
        }
      }

      const addAvailabilityToMolds = (moldList: Mold[]): Mold[] => {
        return moldList.map(mold => {
          const newMold = { ...mold };
          if (availabilityMap.has(mold.id)) {
            newMold.availableAt = availabilityMap.get(mold.id);
          }
          if (newMold.children && newMold.children.length > 0) {
            newMold.children = addAvailabilityToMolds(newMold.children);
          }
          return newMold;
        });
      };

      const moldsWithAvailability = addAvailabilityToMolds(moldsData);
      setMolds(moldsWithAvailability);
      setIsLoading(false);
    }
    fetchData();
  }, []);

  return (
    <RestrictedPage>
      <div className="flex flex-col h-screen">
        <Header />
        <main className="flex-1 overflow-y-auto">
          <div className="container mx-auto py-10">
            <h1 className="text-3xl font-bold font-headline mb-2">Mold Inventory</h1>
            <p className="text-muted-foreground mb-6">Manage and track all molds in the system.</p>
            {isLoading ? (
               <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <Skeleton className="h-10 w-96" />
                  <Skeleton className="h-10 w-64" />
                </div>
                <Skeleton className="h-96 w-full" />
              </div>
            ) : (
              <MoldsTable data={molds} />
            )}
          </div>
        </main>
      </div>
    </RestrictedPage>
  );
}
