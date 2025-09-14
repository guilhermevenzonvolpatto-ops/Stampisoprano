'use client';

import { getMold, getComponentsForMold, getEventsForSource } from '@/lib/data';
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
import { EventTimeline } from '@/components/shared/events/event-timeline';
import { AssociatedComponents } from './components/associated-components';
import { RestrictedPage } from '@/components/layout/restricted-page';
import { EditCustomFields } from '@/components/shared/edit-custom-fields';
import type { Mold, Component as CompType } from '@/lib/types';
import { AdminButton } from '@/components/layout/admin-button';
import { MoldAttachments } from './components/mold-attachments';
import { DeleteButton } from '@/components/shared/delete-button';
import { useApp } from '@/context/app-context';
import { useEffect, useState, useCallback } from 'react';
import Header from '@/components/layout/header';

export default function MoldDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const [mold, setMold] = useState<Mold | null>(null);
  const [associatedComponents, setAssociatedComponents] = useState<CompType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user, t } = useApp();

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const moldData = await getMold(params.id);
      if (!moldData) {
          notFound();
          return;
      }
      setMold(moldData);

      const componentsData = await getComponentsForMold(moldData.id);
      setAssociatedComponents(componentsData);
    } catch (error) {
        console.error("Failed to fetch mold data:", error);
    } finally {
        setIsLoading(false);
    }
  }, [params.id]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);


  if (isLoading || !mold) {
      return (
          <div className="container mx-auto py-10">
              <p>Loading...</p>
          </div>
      )
  }

  return (
    <RestrictedPage allowedCode={mold.codice}>
      <Header />
      <main className="flex-1">
      <div className="container mx-auto py-10">
        <div className="flex justify-between items-start mb-6">
          <div>
            <Link
              href="/molds"
              className="text-sm text-muted-foreground hover:underline flex items-center mb-2"
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              {t('backToMolds')}
            </Link>
            <h1 className="text-3xl font-bold font-headline">{mold.codice}</h1>
            <p className="text-lg text-muted-foreground">{mold.descrizione}</p>
          </div>
          <div className="text-right space-y-2 flex items-center gap-2">
            <div>
                <p className="text-sm text-muted-foreground">{t('currentStatus')}</p>
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
                {t('editMold')}
            </AdminButton>
             <DeleteButton 
                itemId={mold.id}
                itemType="mold"
                itemName={mold.codice}
                redirectPath="/molds"
              />
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
             <EditCustomFields item={mold as Mold | CompType} itemType="mold" />
            <Card>
              <CardHeader>
                <CardTitle>{t('details')}</CardTitle>
              </CardHeader>
              <CardContent className="grid md:grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="font-semibold">{t('creationDate')}</p>
                  <p className="text-muted-foreground">{mold.data}</p>
                </div>
                <div>
                  <p className="font-semibold">{t('position')}</p>
                  <p className="text-muted-foreground">
                    {mold.posizione.type === 'interna' ? t('internal') : t('external')}:{' '}
                    {mold.posizione.value}
                  </p>
                </div>
                {mold.padre && (
                  <div>
                    <p className="font-semibold">{t('parentMold')}</p>
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
                    <p className="font-semibold">{t('associatedMachine')}</p>
                    <p className="text-muted-foreground">{mold.macchinaAssociata}</p>
                  </div>
                )}
              </CardContent>
            </Card>
             <Card>
              <CardHeader>
                <CardTitle>{t('technicalManagementData')}</CardTitle>
              </CardHeader>
               <CardContent className="grid md:grid-cols-2 gap-4 text-sm">
                 {mold.datiTecnici?.impronte && (
                  <div>
                    <p className="font-semibold">{t('impressions')}</p>
                    <p className="text-muted-foreground">{mold.datiTecnici.impronte}</p>
                  </div>
                )}
                 {mold.datiTecnici?.materialeCostruzione && (
                  <div>
                    <p className="font-semibold">{t('constructionMaterial')}</p>
                    <p className="text-muted-foreground">{mold.datiTecnici.materialeCostruzione}</p>
                  </div>
                )}
                 {mold.datiTecnici?.dimensioniPeso && (
                  <div>
                    <p className="font-semibold">{t('dimensionsWeight')}</p>
                    <p className="text-muted-foreground">{mold.datiTecnici.dimensioniPeso}</p>
                  </div>
                )}
                {user?.isAdmin && mold.datiGestionali?.costoAcquisto && (
                  <div>
                    <p className="font-semibold">{t('purchaseCost')}</p>
                    <p className="text-muted-foreground">€{mold.datiGestionali.costoAcquisto.toLocaleString()}</p>
                  </div>
                )}
                {mold.datiGestionali?.vitaUtileStimata && (
                  <div>
                    <p className="font-semibold">{t('expectedLifetime')}</p>
                    <p className="text-muted-foreground">{mold.datiGestionali.vitaUtileStimata.toLocaleString()} cycles</p>
                  </div>
                )}
               </CardContent>
            </Card>
            <MoldAttachments mold={mold} />
            <AssociatedComponents components={associatedComponents} moldId={mold.id} onUpdate={fetchData} />
          </div>
          <div className="lg:col-span-1">
            <EventTimeline sourceId={mold.id} />
          </div>
        </div>
      </div>
      </main>
    </RestrictedPage>
  );
}
