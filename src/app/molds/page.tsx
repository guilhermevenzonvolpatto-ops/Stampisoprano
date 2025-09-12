
import { getMolds, getUpcomingEvents } from '@/lib/data';
import { MoldsTable } from './components/molds-table';
import { RestrictedPage } from '@/components/layout/restricted-page';
import type { Mold } from '@/lib/types';

export default async function MoldsPage() {
  const molds = await getMolds();
  const allEvents = await getUpcomingEvents();

  // Create a map to store the latest available date for each mold
  const availabilityMap = new Map<string, string>();

  // Sort events by date to ensure we are processing the latest one
  allEvents.sort((a, b) => new Date(b.estimatedEndDate).getTime() - new Date(a.estimatedEndDate).getTime());

  for (const event of allEvents) {
      if (!availabilityMap.has(event.sourceId)) {
          const date = event.status === 'Chiuso' ? event.actualEndDate : event.estimatedEndDate;
          if (date) {
            availabilityMap.set(event.sourceId, new Date(date).toLocaleDateString());
          }
      }
  }

  // Recursive function to add availability date to molds and their children
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
  
  const moldsWithAvailability = addAvailabilityToMolds(molds);


  return (
    <RestrictedPage>
      <div className="container mx-auto py-10">
        <h1 className="text-3xl font-bold font-headline mb-2">Mold Inventory</h1>
        <p className="text-muted-foreground mb-6">Manage and track all molds in the system.</p>
        <MoldsTable data={moldsWithAvailability} />
      </div>
    </RestrictedPage>
  );
}
