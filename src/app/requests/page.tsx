
import { getMaintenanceRequests } from '@/lib/data';
import { RestrictedPage } from '@/components/layout/restricted-page';
import Header from '@/components/layout/header';
import { RequestsTable } from './requests-table';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import Link from 'next/link';

export default async function MaintenanceRequestsPage() {
  const requests = await getMaintenanceRequests();

  return (
    <RestrictedPage adminOnly>
      <Header />
      <main className="flex-1">
        <div className="container mx-auto py-10">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h1 className="text-3xl font-bold font-headline mb-2">Maintenance Requests</h1>
                <p className="text-muted-foreground">Review, approve, and reject incoming requests for maintenance.</p>
              </div>
              <Button asChild>
                <Link href="/requests/new">
                  <PlusCircle className="mr-2 h-4 w-4" />
                  New Request
                </Link>
              </Button>
            </div>
            <RequestsTable initialRequests={requests} />
        </div>
      </main>
    </RestrictedPage>
  );
}
