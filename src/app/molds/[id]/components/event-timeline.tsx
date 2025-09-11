
'use client';

import * as React from 'react';
import type { MoldEvent } from '@/lib/types';
import { getEventsForMold } from '@/lib/data';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Wrench, HardHat, CircleDollarSign, Info, CheckCircle2, PlusCircle, Settings } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { EditEventSheet } from './edit-event-sheet';
import { AddEventSheet } from './add-event-sheet';
import { Badge } from '@/components/ui/badge';
import { useApp } from '@/context/app-context';
import { AdminButton } from '@/components/layout/admin-button';

interface EventTimelineProps {
  moldId: string;
}

const eventTypeConfig = {
  Manutenzione: { icon: Wrench, color: 'text-yellow-500', bg: 'bg-yellow-100' },
  Lavorazione: { icon: Settings, color: 'text-blue-500', bg: 'bg-blue-100' },
  Riparazione: { icon: HardHat, color: 'text-orange-500', bg: 'bg-orange-100' },
  Costo: { icon: CircleDollarSign, color: 'text-green-500', bg: 'bg-green-100' },
  'Fine Manutenzione': { icon: CheckCircle2, color: 'text-gray-600', bg: 'bg-gray-200' },
  Altro: { icon: Info, color: 'text-indigo-500', bg: 'bg-indigo-100' },
};

function getEventTypeStyle(type: MoldEvent['type']) {
  return eventTypeConfig[type] || eventTypeConfig.Altro;
}

export function EventTimeline({ moldId }: EventTimelineProps) {
  const [events, setEvents] = React.useState<MoldEvent[]>([]);
  const [selectedEvent, setSelectedEvent] = React.useState<MoldEvent | null>(null);
  const [isAddSheetOpen, setIsAddSheetOpen] = React.useState(false);
  const { user } = useApp();

  const fetchEvents = React.useCallback(() => {
    getEventsForMold(moldId).then(setEvents);
  }, [moldId]);

  React.useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  const handleEventUpdate = () => {
    fetchEvents();
    setSelectedEvent(null);
    setIsAddSheetOpen(false);
  }

  const handleEventClick = (event: MoldEvent) => {
    if (user?.isAdmin && event.status !== 'Chiuso') {
      setSelectedEvent(event);
    }
  }

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Event History</CardTitle>
          {user?.isAdmin && (
            <Button variant="outline" size="sm" onClick={() => setIsAddSheetOpen(true)}>
              <PlusCircle className="mr-2 h-4 w-4" />
              Add Event
            </Button>
          )}
        </CardHeader>
        <CardContent>
          {events.length > 0 ? (
            <div className="relative space-y-1">
              {events.map((event, index) => {
                const eventStyle = getEventTypeStyle(event.type);
                const Icon = eventStyle.icon;
                const isClosed = event.status === 'Chiuso';

                return (
                <div
                  key={event.id}
                  className={cn(
                    "flex gap-4 p-2 rounded-md",
                    !isClosed && user?.isAdmin && "cursor-pointer hover:bg-muted"
                  )}
                  onClick={() => handleEventClick(event)}
                >
                  <div className="relative flex-shrink-0 pt-1">
                    {index < events.length - 1 && (
                      <div className="absolute top-9 left-[15px] h-full w-0.5 bg-border" />
                    )}
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div className={cn("relative z-10 flex h-8 w-8 items-center justify-center rounded-full", eventStyle.bg, isClosed && "opacity-50")}>
                            <Icon className={cn("h-5 w-5", eventStyle.color)} />
                          </div>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>{event.type}</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                  <div className={cn("flex-1", isClosed && "opacity-50")}>
                      <div className="flex items-start justify-between">
                        <p className={cn("font-medium text-sm pr-2", isClosed && "line-through")}>{event.descrizione}</p>
                        <Badge variant={isClosed ? 'secondary' : 'default'} className={cn(
                          'text-xs whitespace-nowrap',
                           isClosed ? 'bg-gray-100 text-gray-700' : 'bg-blue-100 text-blue-700'
                        )}>
                          {event.status}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        {new Date(event.timestamp).toLocaleDateString()}
                        {isClosed && event.actualEndDate && ` - Completed: ${new Date(event.actualEndDate).toLocaleDateString()}`}
                      </p>
                      {event.costo && <p className="text-xs text-muted-foreground">Cost: ${event.costo.toFixed(2)}</p>}
                  </div>
                </div>
              )})}
            </div>
          ) : (
            <p className="text-sm text-center text-muted-foreground py-8">No events recorded.</p>
          )}
        </CardContent>
      </Card>
      {selectedEvent && (
        <EditEventSheet
          event={selectedEvent}
          isOpen={!!selectedEvent}
          onClose={() => setSelectedEvent(null)}
          onUpdate={handleEventUpdate}
        />
      )}
       <AddEventSheet
          sourceId={moldId}
          isOpen={isAddSheetOpen}
          onClose={() => setIsAddSheetOpen(false)}
          onUpdate={handleEventUpdate}
        />
    </>
  );
}
