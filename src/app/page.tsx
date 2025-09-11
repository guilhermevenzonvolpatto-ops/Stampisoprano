import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { ComponentSearch } from '@/components/dashboard/component-search';
import { QuickProductionLog } from '@/components/dashboard/quick-production-log';
import { ScrapRateChart } from '@/components/dashboard/scrap-rate-chart';
import { StatsCards } from '@/components/dashboard/stats-cards';
import { StatusChart } from '@/components/dashboard/status-chart';
import { SupplierChart } from '@/components/dashboard/supplier-chart';
import { UpcomingEvents } from '@/components/dashboard/upcoming-events';

export default function DashboardPage() {
  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="space-y-4">
        <StatsCards />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
          <Card className="col-span-4">
            <CardHeader>
              <CardTitle>Status Distribution</CardTitle>
            </CardHeader>
            <CardContent className="pl-2">
              <StatusChart />
            </CardContent>
          </Card>
          <Card className="col-span-3">
            <CardHeader>
              <CardTitle>Supplier Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <SupplierChart />
            </CardContent>
          </Card>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
           <ScrapRateChart className="col-span-full" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <UpcomingEvents />
          <ComponentSearch />
        </div>
        <QuickProductionLog />
      </div>
    </div>
  );
}
