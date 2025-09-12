
import { getComponent, getMold, getProductionLogsForComponent, getStampingHistoryForComponent } from '@/lib/data';
import { notFound } from 'next/navigation';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ChevronLeft, Pencil } from 'lucide-react';
import Link from 'next/link';
import type { Mold, Component, Machine } from '@/lib/types';
import { RestrictedPage } from '@/components/layout/restricted-page';
import { EditCustomFields } from '@/components/shared/edit-custom-fields';
import { ComponentAttachments } from '../attachments';
import { ProductionHistory } from '../production-history';
import { AdminButton } from '@/components/layout/admin-button';
import { StampingHistory } from './stamping-history';

// Use static data for build-time generation to prevent build failures
const componentsForBuild = [
  { id: 'COMP-A1' },
  { id: 'COMP-B2' },
  { id: 'COMP-C3' },
];

export async function generateStaticParams() {
  return componentsForBuild.map((component) => ({
    id: component.id,
  }));
}

export default async function ComponentDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const component = await getComponent(params.id);
  if (!component) {
    notFound();
  }

  const productionLogs = await getProductionLogsForComponent(component.id);
  const stampingHistory = await getStampingHistoryForComponent(component.id);

  const associatedMolds = (await Promise.all(
    (component.associatedMolds || []).map((id) => getMold(id))
  )).filter(Boolean) as Mold[];

  const getStatusClass = (status: string) => {
    switch (status) {
      case 'Attivo': return 'bg-green-100 text-green-800';
      case 'In modifica': return 'bg-yellow-100 text-yellow-800';
      case 'Obsoleto': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const stampingData = component.stampingData || {};
  const stampingDataFields = [
      { key: 'programName', label: 'Program Name'},
      { key: 'cycleTime', label: 'Cycle Time', unit: 's' },
      { key: 'injectionTime', label: 'Injection Time', unit: 's' },
      { key: 'holdingPressure', label: 'Holding Pressure', unit: 'bar' },
      { key: 'meltTemperature', label: 'Melt Temperature', unit: '°C' },
      { key: 'moldTemperature', label: 'Mold Temperature', unit: '°C' },
      { key: 'clampForce', label: 'Clamp Force', unit: 't' },
      { key: 'injectionPressure', label: 'Injection Pressure', unit: 'bar' },
      { key: 'postPressure', label: 'Post Pressure', unit: 'bar' },
      { key: 'maintenanceTime', label: 'Maintenance Time', unit: 's' },
      { key: 'coolingTime', label: 'Cooling Time', unit: 's' },
      { key: 'counterPressure', label: 'Counter Pressure', unit: 'bar' },
      { key: 'injectionSpeed', label: 'Injection Speed', unit: 'mm/s' },
  ];
  const hasStampingData = stampingData && Object.values(stampingData).some(v => v);

  return (
    <RestrictedPage allowedCode={component.codice}>
      <div className="container mx-auto py-10">
        <div className="flex justify-between items-start mb-6">
          <div>
            <Link
              href="/components"
              className="text-sm text-muted-foreground hover:underline flex items-center mb-2"
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Back to Components
            </Link>
            <h1 className="text-3xl font-bold font-headline">{component.codice}</h1>
            <p className="text-lg text-muted-foreground">{component.descrizione}</p>
          </div>
          <div className="text-right space-y-2">
             <div>
                <p className="text-sm text-muted-foreground">Current Status</p>
                <Badge
                className={`text-base mt-1 ${getStatusClass(component.stato)}`}
                >
                {component.stato}
                </Badge>
             </div>
              <AdminButton href={`/components/${component.id}/edit`} variant="outline" size="sm">
                  <Pencil className="mr-2 h-4 w-4" />
                  Edit Component
              </AdminButton>
          </div>
        </div>

        <div className="grid gap-6">
          <div className="grid gap-6 lg:grid-cols-2">
            <EditCustomFields item={component as Mold | Component} itemType="component" />
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Component Details</CardTitle>
              </CardHeader>
              <CardContent className="grid md:grid-cols-3 gap-4 text-sm">
                <div>
                  <p className="font-semibold">Material</p>
                  <p className="text-muted-foreground">{component.materiale}</p>
                </div>
                <div>
                  <p className="font-semibold">Weight</p>
                  <p className="text-muted-foreground">{component.peso}g</p>
                </div>
                <div>
                  <p className="font-semibold">Total Cycles</p>
                  <p className="text-muted-foreground">{(component.cicliTotali || 0).toLocaleString()}</p>
                </div>
                {component.datiMateriaPrima?.codiceMaterialeSpecifico && (
                  <div>
                    <p className="font-semibold">Specific Material Code</p>
                    <p className="text-muted-foreground">{component.datiMateriaPrima.codiceMaterialeSpecifico}</p>
                  </div>
                )}
              </CardContent>
            </Card>
            
            {hasStampingData && (
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Stamping Data</CardTitle>
              </CardHeader>
              <CardContent className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                {stampingDataFields.map(field => {
                    const value = stampingData[field.key as keyof typeof stampingData];
                    return value ? (
                        <div key={field.key}><p className="font-semibold">{field.label}</p><p className="text-muted-foreground">{value}{field.unit ? ` ${field.unit}`: ''}</p></div>
                    ) : null
                })}
              </CardContent>
            </Card>
            )}

            <ComponentAttachments component={component} />

            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Associated Molds</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {associatedMolds.length > 0 ? (
                  associatedMolds.map((mold) => (
                    <Link href={`/molds/${mold.id}`} key={mold.id} className="block p-3 rounded-lg hover:bg-muted border">
                        <div className="flex justify-between items-center">
                            <div>
                                <p className="font-semibold text-sm">{mold.codice}</p>
                                <p className="text-xs text-muted-foreground">{mold.descrizione}</p>
                            </div>
                            <Badge variant={mold.stato === 'Operativo' ? 'default' : 'destructive'} className="text-xs">{mold.stato}</Badge>
                        </div>
                    </Link>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-4">No molds associated with this component.</p>
                )}
              </CardContent>
            </Card>
          </div>
          <ProductionHistory logs={productionLogs} componentId={component.id}/>
          <StampingHistory history={stampingHistory} />
        </div>
      </div>
    </RestrictedPage>
  );
}
