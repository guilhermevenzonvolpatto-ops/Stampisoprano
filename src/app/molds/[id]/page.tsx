
import { getMold, getMolds, getComponentsForMold } from '@/lib/data';
import { notFound } from 'next/navigation';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Layers, ChevronLeft, PlusCircle, Pencil } from 'lucide-react';
import Link from 'next/link';
import { EventTimeline } from './components/event-timeline';
import { AssociatedComponents } from './components/associated-components';
import { RestrictedPage } from '@/components/layout/restricted-page';
import { EditCustomFields } from '@/components/shared/edit-custom-fields';
import type { Mold, Component as CompType } from '@/lib/types';
import { AdminButton } from '@/components/layout/admin-button';
import { MoldAttachments } from './components/mold-attachments';

export async function generateStaticParams() {
  const molds = await getMolds();
  return molds.map((mold) => ({
    id: mold.id,
  }));
}

export default async function MoldDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const mold = await getMold(params.id);
  if (!mold) {
    notFound();
  }

  const associatedComponents = await getComponentsForMold(mold.id);

  return (
    <RestrictedPage allowedCode={mold.codice}>
      <div className="container mx-auto py-10">
        <div className="flex justify-between items-start mb-6">
          <div>
            <Link
              href="/molds"
              className="text-sm text-muted-foreground hover:underline flex items-center mb-2"
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Back to Molds
            </Link>
            <h1 className="text-3xl font-bold font-headline">{mold.codice}</h1>
            <p className="text-lg text-muted-foreground">{mold.descrizione}</p>
          </div>
          <div className="text-right space-y-2">
            <div>
                <p className="text-sm text-muted-foreground">Current Status</p>
                <Badge
                  className={`text-base mt-1 ${
                    mold.stato === 'Operativo'
                      ? 'bg-green-100 text-green-800'
                      : mold.stato === 'In Manutenzione'
                      ? 'bg-yellow-100 text-yellow-800'
                      : mold.stato === 'Lavorazione'
                      ? 'bg-blue-100 text-blue-800'
                      : 'bg-red-100 text-red-800'
                  }`}
                >
                  {mold.stato}
                </Badge>
            </div>
            <AdminButton href={`/molds/${mold.id}/edit`} variant="outline" size="sm">
                <Pencil className="mr-2 h-4 w-4" />
                Edit Mold
            </AdminButton>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
             <EditCustomFields item={mold as Mold | CompType} itemType="mold" />
            <Card>
              <CardHeader>
                <CardTitle>Details</CardTitle>
              </CardHeader>
              <CardContent className="grid md:grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="font-semibold">Creation Date</p>
                  <p className="text-muted-foreground">{mold.data}</p>
                </div>
                <div>
                  <p className="font-semibold">Position</p>
                  <p className="text-muted-foreground">
                    {mold.posizione.type === 'interna' ? 'Internal' : 'External'}:{' '}
                    {mold.posizione.value}
                  </p>
                </div>
                {mold.padre && (
                  <div>
                    <p className="font-semibold">Parent Mold</p>
                    <Link
                      href={`/molds/${mold.padre}`}
                      className="text-primary hover:underline"
                    >
                      {mold.padre}
                    </Link>
                  </div>
                )}
                 {mold.macchinaAssociata && (
                  <div>
                    <p className="font-semibold">Associated Machine</p>
                    <p className="text-muted-foreground">{mold.macchinaAssociata}</p>
                  </div>
                )}
              </CardContent>
            </Card>
             <Card>
              <CardHeader>
                <CardTitle>Technical & Management Data</CardTitle>
              </CardHeader>
               <CardContent className="grid md:grid-cols-2 gap-4 text-sm">
                 {mold.datiTecnici?.impronte && (
                  <div>
                    <p className="font-semibold">Impressions</p>
                    <p className="text-muted-foreground">{mold.datiTecnici.impronte}</p>
                  </div>
                )}
                 {mold.datiTecnici?.materialeCostruzione && (
                  <div>
                    <p className="font-semibold">Construction Material</p>
                    <p className="text-muted-foreground">{mold.datiTecnici.materialeCostruzione}</p>
                  </div>
                )}
                 {mold.datiTecnici?.dimensioniPeso && (
                  <div>
                    <p className="font-semibold">Dimensions/Weight</p>
                    <p className="text-muted-foreground">{mold.datiTecnici.dimensioniPeso}</p>
                  </div>
                )}
                {mold.datiGestionali?.costoAcquisto && (
                  <div>
                    <p className="font-semibold">Purchase Cost</p>
                    <p className="text-muted-foreground">€{mold.datiGestionali.costoAcquisto.toLocaleString()}</p>
                  </div>
                )}
                {mold.datiGestionali?.vitaUtileStimata && (
                  <div>
                    <p className="font-semibold">Expected Lifetime</p>
                    <p className="text-muted-foreground">{mold.datiGestionali.vitaUtileStimata.toLocaleString()} cycles</p>
                  </div>
                )}
               </CardContent>
            </Card>
            <MoldAttachments mold={mold} />
            <AssociatedComponents components={associatedComponents} />
          </div>
          <div className="lg:col-span-1">
            <EventTimeline moldId={mold.id} />
          </div>
        </div>
      </div>
    </RestrictedPage>
  );
}
