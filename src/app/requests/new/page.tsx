
import { getMolds, getMachines } from '@/lib/data';
import { RestrictedPage } from '@/components/layout/restricted-page';
import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';
import { RequestMaintenanceForm } from './request-maintenance-form';
import Header from '@/components/layout/header';

export default async function NewMaintenanceRequestPage() {
  const molds = await getMolds();
  const machines = await getMachines();

  return (
    <RestrictedPage adminOnly>
      <Header />
      <main className="container mx-auto py-10">
        <h1 className="text-3xl font-bold font-headline mb-2">New Maintenance Request</h1>
        <p className="text-muted-foreground mb-6">
          Submit a request for maintenance or modification on a mold or machine. This will be reviewed for approval.
        </p>
        <RequestMaintenanceForm allMolds={molds} allMachines={machines} />
      </main>
    </RestrictedPage>
  );
}
