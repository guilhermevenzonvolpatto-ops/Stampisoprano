
'use client';
import * as React from 'react';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import type { MoldEvent } from '@/lib/types';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Wrench, HardHat, CircleDollarSign, Info, CheckCircle2, Settings, Paperclip } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Badge } from '@/components/ui/badge';
import { EditEventSheet } from '@/components/shared/events/edit-event-sheet';
import { getAllEvents } from '@/lib/data';
import { useApp } from '@/context/app-context';
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
  const [date, setDate] = React.useState<Date | undefined>(new Date());
  const [events, setEvents] = React.useState<MoldEvent[]>(initialEvents);
  const [selectedEvent, setSelectedEvent] = React.useState<MoldEvent | null>(null);
  const { t } = useApp();

  const eventsByDate = React.useMemo(() => {
    const map = new Map<string, MoldEvent[]>();
    events.forEach((event) => {
      const eventDate = new Date(event.estimatedEndDate).toISOString().split('T')[0];
      if (!map.has(eventDate)) {
        map.set(eventDate, []);
      }
      map.get(eventDate)!.push(event);
    });
    return map;
  }, [events]);

  const selectedDayEvents = React.useMemo(() => {
    if (!date) return [];
    const dateString = date.toISOString().split('T')[0];
    return eventsByDate.get(dateString) || [];
  }, [date, eventsByDate]);
  
  const fetchEvents = React.useCallback(async () => {
    const freshEvents = await getAllEvents();
    setEvents(freshEvents);

    if (selectedEvent) {
      const updatedSelectedEvent = freshEvents.find(e => e.id === selectedEvent.id);
      setSelectedEvent(updatedSelectedEvent || null);
    }
  }, [selectedEvent]);

  const handleEventClick = (event: MoldEvent) => {
    const freshEvent = events.find(e => e.id === event.id);
    setSelectedEvent(freshEvent || event);
  };
  
  const closeSheet = () => {
      setSelectedEvent(null);
  }

  const EventDay = ({ day }: { day: Date }) => {
    const dateString = day.toISOString().split('T')[0];
    const hasEvents = eventsByDate.has(dateString);
    return (
      <div className="relative">
        {day.getDate()}
        {hasEvents && <div className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-primary" />}
      </div>
    );
  };

  return (
    <>
      <Card>
        <CardContent className="p-4 md:p-6 grid md:grid-cols-2 gap-6">
          <Calendar
            mode="single"
            selected={date}
            onSelect={setDate}
            className="rounded-md border justify-center"
            components={{
                DayContent: (props) => <EventDay day={props.date} />
            }}
          />
          <div className="space-y-4">
            <h3 className="font-semibold">
              Events for {date ? date.toLocaleDateString() : 'selected date'}
            </h3>
            <ScrollArea className="h-80 rounded-md border">
                {selectedDayEvents.length > 0 ? (
                    <div className="p-2 space-y-1">
                        {selectedDayEvents.map(event => {
                             const eventStyle = getEventTypeStyle(event.type);
                             const Icon = eventStyle.icon;
                             const isClosed = event.status === 'Chiuso';
                             const hasAttachments = event.attachments && event.attachments.length > 0;
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
                                         <Link href={event.sourceId.startsWith('ST-') ? `/molds/${event.sourceId}` : `/machines/${event.sourceId}`} className="text-xs text-primary hover:underline font-semibold">
                                            {event.sourceId}
                                        </Link>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                ) : (
                    <p className="text-sm text-center text-muted-foreground p-4">No events for this day.</p>
                )}
            </ScrollArea>
          </div>
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
