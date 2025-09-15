
'use client';

import { getMachine } from '@/lib/data';
import { notFound, useRouter } from 'next/navigation';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ChevronLeft, Pencil } from 'lucide-react';
import Link from 'next/link';
import { RestrictedPage } from '@/components/layout/restricted-page';
import { EditCustomFields } from '@/components/shared/edit-custom-fields';
import type { Machine, Component } from '@/lib/types';
import { AdminButton } from '@/components/layout/admin-button';
import { DeleteButton } from '@/components/shared/delete-button';
import Header from '@/components/layout/header';
import { EventTimeline } from '@/components/shared/events/event-timeline';
import { MachineAttachments } from '../components/machine-attachments';
import { useState, useEffect, useCallback } from 'react';
import { Skeleton } from '@/components/ui/skeleton';

export default function MachineDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const [machine, setMachine] = useState<Machine | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  const fetchData = useCallback(async () => {
    try {
      const machineData = await getMachine(params.id);
      if (!machineData) {
        notFound();
        return;
      }
      setMachine(machineData);
    } catch (error) {
      console.error("Failed to fetch machine data:", error);
    } finally {
      setIsLoading(false);
    }
  }, [params.id]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleUpdate = () => {
    setIsLoading(true);
    fetchData();
    router.refresh();
  };

  if (isLoading || !machine) {
    return (
      <div className="flex flex-col h-screen">
        <Header />
        <main className="flex-1 overflow-y-auto">
          <div className="container mx-auto py-10">
            <div className="space-y-4">
              <Skeleton className="h-10 w-1/4" />
              <div className="grid gap-6 lg:grid-cols-3">
                <div className="lg:col-span-2 space-y-6">
                  <Skeleton className="h-48 w-full" />
                  <Skeleton className="h-48 w-full" />
                </div>
                <div className="lg:col-span-1">
                  <Skeleton className="h-96 w-full" />
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
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
    <RestrictedPage allowedCode={machine.codice}>
      <div className="flex flex-col h-screen">
        <Header />
        <main className="flex-1 overflow-y-auto">
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
                <Card>
                  <CardHeader>
                    <CardTitle>Details</CardTitle>
                  </CardHeader>
                  <CardContent className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
                    <div>
                      <p className="font-semibold">Type</p>
                      <p className="text-muted-foreground">{machine.tipo}</p>
                    </div>
                    {machine.serialNumber && (
                      <div>
                        <p className="font-semibold">Serial Number</p>
                        <p className="text-muted-foreground">{machine.serialNumber}</p>
                      </div>
                    )}
                    {machine.manufacturingYear && (
                      <div>
                        <p className="font-semibold">Manufacturing Year</p>
                        <p className="text-muted-foreground">{machine.manufacturingYear}</p>
                      </div>
                    )}
                    {machine.purchaseCost && (
                      <div>
                        <p className="font-semibold">Purchase Cost</p>
                        <p className="text-muted-foreground">€{machine.purchaseCost.toLocaleString()}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
                <EditCustomFields item={machine as Machine | Component} itemType="machine" />
                <MachineAttachments machine={machine} />
              </div>
              <div className="lg:col-span-1">
                <EventTimeline sourceId={machine.id} onUpdate={handleUpdate} />
              </div>
            </div>
          </div>
        </main>
      </div>
    </RestrictedPage>
  );
}
