
'use client';
import * as React from 'react';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent } from '@/components/ui/card';
import type { MoldEvent } from '@/lib/types';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Wrench, HardHat, CircleDollarSign, Info, CheckCircle2, Settings } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Badge } from '@/components/ui/badge';
import { EditEventSheet } from '@/components/shared/events/edit-event-sheet';
import { getAllEvents } from '@/lib/data';
import Link from 'next/link';

const eventTypeConfig = {
  Manutenzione: { icon: Wrench, color: 'text-yellow-500' },
  Lavorazione: { icon: Settings, color: 'text-blue-500' },
  Riparazione: { icon: HardHat, color: 'text-orange-500' },
  Costo: { icon: CircleDollarSign, color: 'text-green-500' },
  'Fine Manutenzione': { icon: CheckCircle2, color: 'text-gray-600' },
  Altro: { icon: Info, color: 'text-indigo-500' },
};

function getEventTypeStyle(type: MoldEvent['type']) {
  return eventTypeConfig[type] || eventTypeConfig.Altro;
}

interface EventsCalendarProps {
  initialEvents: MoldEvent[];
}

export function EventsCalendar({ initialEvents }: EventsCalendarProps) {
  const [events, setEvents] = React.useState<MoldEvent[]>(initialEvents);
  const [selectedEvent, setSelectedEvent] = React.useState<MoldEvent | null>(null);

  const eventsByDate = React.useMemo(() => {
    const map = new Map<string, MoldEvent[]>();
    events.forEach((event) => {
      // Use estimatedEndDate for calendar placement
      const eventDate = new Date(event.estimatedEndDate).toISOString().split('T')[0];
      if (!map.has(eventDate)) {
        map.set(eventDate, []);
      }
      map.get(eventDate)!.push(event);
    });
    return map;
  }, [events]);

  const fetchEvents = React.useCallback(async () => {
    const freshEvents = await getAllEvents();
    setEvents(freshEvents);

    if (selectedEvent) {
      const updatedSelectedEvent = freshEvents.find(e => e.id === selectedEvent.id);
      setSelectedEvent(updatedSelectedEvent || null);
    }
  }, [selectedEvent]);

  const handleEventClick = (event: MoldEvent) => {
    // We need to find the latest version of the event from our state
    const freshEvent = events.find(e => e.id === event.id);
    setSelectedEvent(freshEvent || event);
  };
  
  const closeSheet = () => {
      setSelectedEvent(null);
  }

  const DayWithEvents = ({ date, ...props }: { date: Date } & any) => {
    const dateString = date.toISOString().split('T')[0];
    const dayEvents = eventsByDate.get(dateString);

    if (dayEvents && dayEvents.length > 0) {
      return (
        <Popover>
          <PopoverTrigger asChild>
            <div className="relative flex h-full w-full items-center justify-center">
              {props.children}
              <div className="absolute bottom-1 w-1.5 h-1.5 rounded-full bg-primary" />
            </div>
          </PopoverTrigger>
          <PopoverContent className="w-80">
            <div className="space-y-2">
                <h4 className="font-medium leading-none">Events for {date.toLocaleDateString()}</h4>
                <ScrollArea className="h-60">
                    <div className="p-1 space-y-1">
                    {dayEvents.map(event => {
                        const eventStyle = getEventTypeStyle(event.type);
                        const Icon = eventStyle.icon;
                        const isClosed = event.status === 'Chiuso';
                        return (
                            <div key={event.id} onClick={() => handleEventClick(event)} className="p-2 rounded-md cursor-pointer hover:bg-muted/50 border flex gap-3">
                               <TooltipProvider>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <div className={cn("relative z-10 flex h-8 w-8 items-center justify-center rounded-full flex-shrink-0 mt-1", isClosed && "opacity-50")}>
                                        <Icon className={cn("h-5 w-5", eventStyle.color)} />
                                      </div>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                      <p>{event.type}</p>
                                    </TooltipContent>
                                  </Tooltip>
                                </TooltipProvider>

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
                                     <Link href={event.sourceId.startsWith('ST-') ? `/molds/${event.sourceId}` : `/machines/${event.sourceId}`} className="text-xs text-primary hover:underline font-semibold" onClick={(e) => e.stopPropagation()}>
                                        {event.sourceId}
                                    </Link>
                                </div>
                            </div>
                        )
                    })}
                    </div>
                </ScrollArea>
            </div>
          </PopoverContent>
        </Popover>
      );
    }
    return <div className="h-full w-full flex items-center justify-center">{props.children}</div>;
  };

  return (
    <>
      <Card>
        <CardContent className="p-2 md:p-4">
          <Calendar
            mode="single"
            className="p-0 [&_td]:w-full"
            classNames={{
                month: 'space-y-4 w-full',
                table: 'w-full border-collapse',
                row: 'flex w-full mt-2',
                cell: 'flex-1 text-center text-sm p-0 relative focus-within:relative focus-within:z-20',
                day: 'h-16 w-full p-1 font-normal',
            }}
            components={{
              DayContent: (props) => <DayWithEvents {...props}>{props.date.getDate()}</DayWithEvents>
            }}
          />
        </CardContent>
      </Card>
      {selectedEvent && (
        <EditEventSheet
          event={selectedEvent}
          isOpen={!!selectedEvent}
          onClose={closeSheet}
          onUpdate={fetchEvents}
        />
      )}
    </>
  );
}
