
'use client';
import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { Input } from '../ui/input';
import { ScrollArea } from '../ui/scroll-area';
import { getComponents, getMold } from '@/lib/data';
import type { Component, Mold } from '@/lib/types';
import Link from 'next/link';
import { Badge } from '../ui/badge';
import { Skeleton } from '../ui/skeleton';
import { useApp } from '@/context/app-context';

export function ComponentSearch() {
  const [components, setComponents] = React.useState<Component[]>([]);
  const [allComponents, setAllComponents] = React.useState<Component[]>([]);
  const [selectedComponent, setSelectedComponent] = React.useState<Component | null>(null);
  const [associatedMolds, setAssociatedMolds] = React.useState<Mold[]>([]);
  const [loadingMolds, setLoadingMolds] = React.useState(false);
  const { t } = useApp();

  React.useEffect(() => {
    getComponents().then((data) => {
      setComponents(data);
      setAllComponents(data);
    });
  }, []);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const term = e.target.value.toLowerCase();
    const filtered = allComponents.filter(
      (c) =>
        c.codice.toLowerCase().includes(term) ||
        c.descrizione.toLowerCase().includes(term)
    );
    setComponents(filtered);
    setSelectedComponent(null);
    setAssociatedMolds([]);
  };

  const handleSelectComponent = async (component: Component) => {
    setSelectedComponent(component);
    setLoadingMolds(true);
    setAssociatedMolds([]);
    if (component.associatedMolds && component.associatedMolds.length > 0) {
        const moldsData = await Promise.all(
            component.associatedMolds.map(id => getMold(id).catch(() => null))
        );
        setAssociatedMolds(moldsData.filter(Boolean) as Mold[]);
    }
    setLoadingMolds(false);
  };
  
    const getStatusClass = (status: string) => {
        switch (status) {
            case 'Operativo': return 'bg-green-100 text-green-800';
            case 'In Manutenzione': return 'bg-yellow-100 text-yellow-800';
            case 'Lavorazione': return 'bg-blue-100 text-blue-800';
            case 'Fermo': return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('associatedMoldFinder')}</CardTitle>
        <CardDescription>{t('searchComponentToFindMolds')}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h4 className="font-medium mb-2 text-sm">{t('searchAndSelectComponent')}</h4>
            <Input
              placeholder={t('searchByCodeOrDescription')}
              onChange={handleSearch}
              className="mb-2"
            />
            <ScrollArea className="h-48 rounded-md border">
              <div className="p-2 space-y-1">
                {components.map((c) => (
                  <div
                    key={c.id}
                    onClick={() => handleSelectComponent(c)}
                    className={`p-2 cursor-pointer rounded-md text-sm ${
                      selectedComponent?.id === c.id
                        ? 'bg-primary/10'
                        : 'hover:bg-muted'
                    }`}
                  >
                    <p className="font-semibold">{c.codice}</p>
                    <p className="text-xs text-muted-foreground">
                      {c.descrizione}
                    </p>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>
          <div>
            <h4 className="font-medium mb-2 text-sm">{t('associatedMoldsTitle')}</h4>
            <div className="h-48 rounded-md border p-2 space-y-2">
                {loadingMolds && (
                    <div className="space-y-2">
                        <Skeleton className="h-12 w-full" />
                        <Skeleton className="h-12 w-full" />
                        <Skeleton className="h-12 w-full" />
                    </div>
                )}
                {!loadingMolds && !selectedComponent && (
                    <div className="flex items-center justify-center h-full text-center text-sm text-muted-foreground">
                        <p>{t('selectComponentToSeeMolds')}</p>
                    </div>
                )}
                 {!loadingMolds && selectedComponent && associatedMolds.length === 0 && (
                    <div className="flex items-center justify-center h-full text-center text-sm text-muted-foreground">
                        <p>{t('noMoldsAssociated')}</p>
                    </div>
                )}
                {!loadingMolds && associatedMolds.length > 0 && (
                    <ScrollArea className="h-full">
                        {associatedMolds.map(mold => (
                            <Link href={`/molds/${mold.id}`} key={mold.id} className="block p-2 rounded-md hover:bg-muted">
                                <div className="flex justify-between items-center">
                                    <div>
                                        <p className="font-semibold text-sm">{mold.codice}</p>
                                        <p className="text-xs text-muted-foreground">{mold.descrizione}</p>
                                    </div>
                                    <Badge variant='secondary' className={`${getStatusClass(mold.stato)} text-xs`}>{mold.stato}</Badge>
                                </div>
                            </Link>
                        ))}
                    </ScrollArea>
                )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
