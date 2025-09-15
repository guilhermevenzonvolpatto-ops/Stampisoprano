'use client';

import * as React from 'react';
import { getComponents } from '@/lib/data';
import { ComponentsTable } from '@/app/components/components-table';
import { RestrictedPage } from '@/components/layout/restricted-page';
import Header from '@/components/layout/header';
import type { Component } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';

export default function ComponentsPage() {
  const [components, setComponents] = React.useState<Component[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    async function fetchData() {
      const data = await getComponents();
      setComponents(data);
      setIsLoading(false);
    }
    fetchData();
  }, []);

  return (
    <RestrictedPage>
      <div className="flex flex-col h-screen">
        <Header />
        <main className="flex-1 overflow-y-auto">
          <div className="container mx-auto py-10">
            <h1 className="text-3xl font-bold font-headline mb-2">Component Inventory</h1>
            <p className="text-muted-foreground mb-6">Browse and manage all components in the system.</p>
            {isLoading ? (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <Skeleton className="h-10 w-96" />
                  <Skeleton className="h-10 w-48" />
                </div>
                <Skeleton className="h-96 w-full" />
              </div>
            ) : (
              <ComponentsTable data={components} />
            )}
          </div>
        </main>
      </div>
    </RestrictedPage>
  );
}
