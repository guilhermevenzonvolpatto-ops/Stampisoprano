
import { RestrictedPage } from '@/components/layout/restricted-page';
import Header from '@/components/layout/header';
import { getMoldStatusDistribution, getMoldSupplierDistribution, getMaintenanceCostsOverTime } from '@/lib/data';
import { MoldStatusChart } from './components/mold-status-chart';
import { MoldsBySupplierChart } from './components/molds-by-supplier-chart';
import { MaintenanceCostsChart } from './components/maintenance-costs-chart';

export default async function AnalyticsPage() {
  const moldStatusData = await getMoldStatusDistribution();
  const moldSupplierData = await getMoldSupplierDistribution();
  const maintenanceCostsData = await getMaintenanceCostsOverTime();

  return (
    <RestrictedPage adminOnly>
      <Header />
      <main className="flex-1">
        <div className="container mx-auto py-10">
          <h1 className="text-3xl font-bold font-headline mb-2">Analytics Dashboard</h1>
          <p className="text-muted-foreground mb-6">
            Visualizing key metrics for molds, suppliers, and costs.
          </p>
          <div className="grid gap-6 lg:grid-cols-2">
            <MoldStatusChart data={moldStatusData} />
            <MoldsBySupplierChart data={moldSupplierData} />
          </div>
          <div className="mt-6">
            <MaintenanceCostsChart data={maintenanceCostsData} />
          </div>
        </div>
      </main>
    </RestrictedPage>
  );
}
