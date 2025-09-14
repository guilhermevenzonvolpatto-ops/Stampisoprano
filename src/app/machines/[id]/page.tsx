
import { getMachine, getEventsForSource } from '@/lib/data';
import { notFound } from 'next/navigation';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ChevronLeft, Pencil, Paperclip, CalendarCheck, AlertTriangle } from 'lucide-react';
import Link from 'next/link';
import { RestrictedPage } from '@/components/layout/restricted-page';
import { EditCustomFields } from '@/components/shared/edit-custom-fields';
import type { Machine, Component, MaintenanceSchedule } from '@/lib/types';
import { AdminButton } from '@/components/layout/admin-button';
import { DeleteButton } from '@/components/shared/delete-button';
import Header from '@/components/layout/header';
import { EventTimeline } from '@/app/molds/[id]/components/event-timeline';
import { MachineAttachments } from '../components/machine-attachments';
import { cn } from '@/lib/utils';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";


const getStatusPill = (dueDate: string | undefined) => {
    if (!dueDate) return { text: "Not Performed", className: "bg-gray-200 text-gray-800" };

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const nextDue = new Date(dueDate);
    const diffTime = nextDue.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
        return { text: `Overdue by ${Math.abs(diffDays)} days`, className: "bg-red-100 text-red-800 animate-pulse" };
    } else if (diffDays <= 7) {
        return { text: `Due in ${diffDays} days`, className: "bg-yellow-100 text-yellow-800" };
    } else {
        return { text: "OK", className: "bg-green-100 text-green-800" };
    }
};


function ProgrammedMaintenanceStatus({ schedules }: { schedules: MaintenanceSchedule[] }) {
    if (!schedules || schedules.length === 0) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Programmed Maintenance</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-sm text-muted-foreground text-center py-4">No programmed maintenance tasks have been defined for this machine.</p>
                </CardContent>
            </Card>
        );
    }
    
    return (
        <Card>
            <CardHeader>
                <CardTitle>Programmed Maintenance Status</CardTitle>
                <CardDescription>Overview of recurring maintenance tasks and their due dates.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                {schedules.map(task => {
                    const status = getStatusPill(task.nextDueDate);
                    return (
                        <div key={task.id} className="flex items-center justify-between p-3 border rounded-lg">
                            <div>
                                <p className="font-semibold">{task.description}</p>
                                <div className="text-xs text-muted-foreground space-x-4">
                                    <span>Last: {task.lastPerformed ? new Date(task.lastPerformed).toLocaleDateString() : 'N/A'}</span>
                                    <span>Next: {task.nextDueDate ? new Date(task.nextDueDate).toLocaleDateString() : 'N/A'}</span>
                                </div>
                            </div>
                            <TooltipProvider>
                                <Tooltip>
                                    <TooltipTrigger>
                                        <Badge className={cn("text-xs", status.className)}>{status.text}</Badge>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        <p>Interval: Every {task.intervalDays} days</p>
                                    </TooltipContent>
                                </Tooltip>
                            </TooltipProvider>
                        </div>
                    );
                })}
            </CardContent>
        </Card>
    );
}

export default async function MachineDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const machine = await getMachine(params.id);
  if (!machine) {
    notFound();
  }

  const getStatusClass = (status: Machine['stato']) => {
    switch (status) {
      case 'Operativo': return 'bg-green-100 text-green-800';
      case 'In Manutenzione': return 'bg-yellow-100 text-yellow-800';
      case 'Fermo': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <RestrictedPage adminOnly>
      <Header />
      <main className="flex-1">
        <div className="container mx-auto py-10">
          <div className="flex justify-between items-start mb-6">
            <div>
              <Link
                href="/machines"
                className="text-sm text-muted-foreground hover:underline flex items-center mb-2"
              >
                <ChevronLeft className="h-4 w-4 mr-1" />
                Back to Machines
              </Link>
              <h1 className="text-3xl font-bold font-headline">{machine.codice}</h1>
              <p className="text-lg text-muted-foreground">{machine.descrizione}</p>
            </div>
            <div className="text-right space-y-2 flex items-center gap-2">
              <div>
                  <p className="text-sm text-muted-foreground">Current Status</p>
                  <Badge
                    className={`text-base mt-1 ${getStatusClass(machine.stato)}`}
                  >
                    {machine.stato}
                  </Badge>
              </div>
              <AdminButton href={`/machines/${machine.id}/edit`} variant="outline" size="sm">
                  <Pencil className="mr-2 h-4 w-4" />
                  Edit Machine
              </AdminButton>
               <DeleteButton 
                  itemId={machine.id}
                  itemType="machine"
                  itemName={machine.codice}
                  redirectPath="/machines"
                />
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2 space-y-6">
               <EditCustomFields item={machine as Machine | Component} itemType="machine" />
              <Card>
                <CardHeader>
                  <CardTitle>Details</CardTitle>
                </CardHeader>
                <CardContent className="grid md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="font-semibold">Type</p>
                    <p className="text-muted-foreground">{machine.tipo}</p>
                  </div>
                </CardContent>
              </Card>
              <ProgrammedMaintenanceStatus schedules={machine.maintenanceSchedules || []} />
              <MachineAttachments machine={machine} />
            </div>
            <div className="lg:col-span-1">
              <EventTimeline sourceId={machine.id} />
            </div>
          </div>
        </div>
      </main>
    </RestrictedPage>
  );
}
