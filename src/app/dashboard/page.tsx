
import { StatsCards } from '@/components/dashboard/stats-cards';
import { UpcomingEvents } from '@/components/dashboard/upcoming-events';
import { ComponentSearch } from '@/components/dashboard/component-search';
import { QuickProductionLog } from '@/app/dashboard/quick-production-log';
import { RestrictedPage } from '@/components/layout/restricted-page';

export default function DashboardPage() {
  return (
    <RestrictedPage>
      <div className="container mx-auto py-10">
        <h1 className="text-3xl font-bold font-headline mb-6">Dashboard</h1>
        <div className="space-y-6">
          <StatsCards />
          <div className="grid gap-6 lg:grid-cols-2">
            <UpcomingEvents />
            <ComponentSearch />
          </div>
          <QuickProductionLog />
        </div>
      </div>
    </RestrictedPage>
  );
}
