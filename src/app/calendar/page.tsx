

import { RestrictedPage } from '@/components/layout/restricted-page';
import Header from '@/components/layout/header';
import { getAllEvents } from '@/lib/data';
import { EventsCalendar } from './events-calendar';

export default async function CalendarPage() {
  const allEvents = await getAllEvents();

  return (
    <RestrictedPage adminOnly>
      <div className="flex flex-col h-screen">
        <Header />
        <main className="flex-1 overflow-y-auto">
          <div className="container mx-auto py-10">
            <h1 className="text-3xl font-bold font-headline mb-2">Event Calendar</h1>
            <p className="text-muted-foreground mb-6">
              A comprehensive view of all maintenance, repair, and other events for all assets.
            </p>
            <EventsCalendar initialEvents={allEvents} />
          </div>
        </main>
      </div>
    </RestrictedPage>
  );
}
