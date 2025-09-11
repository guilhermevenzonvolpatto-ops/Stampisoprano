
import { StatsCards } from '@/components/dashboard/stats-cards';
import { UpcomingEvents } from '@/components/dashboard/upcoming-events';
import { ComponentSearch } from '@/components/dashboard/component-search';
import { QuickProductionLog } from '@/components/dashboard/quick-production-log';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { StatusChart } from '@/components/dashboard/status-chart';
import { SupplierChart } from '@/components/dashboard/supplier-chart';
import { ScrapRateChart } from '@/components/dashboard/scrap-rate-chart';
import { RestrictedPage } from '@/components/layout/restricted-page';

export default function DashboardPage() {
  return (
    <RestrictedPage>
      <div className="container mx-auto py-10">
        <h1 className="text-3xl font-bold font-headline mb-6">Dashboard</h1>
        <div className="space-y-6">
          <StatsCards />
          <div className="grid gap-6 lg:grid-cols-3">
            <UpcomingEvents />
            <Card className="col-span-1 lg:col-span-2">
              <CardHeader>
                <CardTitle>Mold Status Overview</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-6 md:grid-cols-2">
                <StatusChart />
                <SupplierChart />
              </CardContent>
            </Card>
          </div>
          <ScrapRateChart />
          <ComponentSearch />
          <QuickProductionLog />
        </div>
      </div>
    </RestrictedPage>
  );
}
