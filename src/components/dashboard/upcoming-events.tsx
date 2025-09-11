
'use client';
import { getUpcomingEvents } from '@/lib/data';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../ui/card';
import { Wrench, Settings, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import * as React from 'react';
import type { MoldEvent } from '@/lib/types';

function getEventTypeStyle(type: string) {
  switch (type) {
    case 'Manutenzione':
      return { icon: Wrench, color: 'text-yellow-500' };
    case 'Lavorazione':
      return { icon: Settings, color: 'text-blue-500' };
    default:
      return { icon: Wrench, color: 'text-gray-500' };
  }
}

export function UpcomingEvents() {
  const [events, setEvents] = React.useState<MoldEvent[]>([]);
  React.useEffect(() => {
    getUpcomingEvents().then(setEvents);
  }, []);

  return (
    <Card className="col-span-1 lg:col-span-1">
      <CardHeader>
        <CardTitle>Upcoming Events</CardTitle>
        <CardDescription>
          Upcoming maintenance and other important events.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {events.length > 0 ? (
          <div className="space-y-4">
            {events.map((event) => {
              const style = getEventTypeStyle(event.type);
              const isOverdue = new Date(event.estimatedEndDate) < new Date();
              return (
                <Link
                  href={`/molds/${event.sourceId}`}
                  key={event.id}
                  className="flex items-start space-x-4 p-2 rounded-lg hover:bg-muted"
                >
                  <div className={cn('mt-1', style.color)}>
                    <style.icon className="h-5 w-5" />
                  </div>
                  <div className="flex-1 space-y-1">
                    <p className="text-sm font-medium leading-none">
                      {event.sourceId} - {event.descrizione}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Due: {new Date(event.estimatedEndDate).toLocaleDateString()}
                    </p>
                  </div>
                  {isOverdue && (
                    <div className="flex items-center text-destructive">
                      <AlertTriangle className="h-4 w-4 mr-1" />
                      <span className="text-xs font-semibold">Overdue</span>
                    </div>
                  )}
                </Link>
              );
            })}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground text-center py-8">
            No upcoming events.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
