
'use client';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { getStats } from '@/lib/data';
import { Package, Wrench, Globe } from 'lucide-react';
import * as React from 'react';
import { useApp } from '@/context/app-context';

export function StatsCards() {
  const { user } = useApp();
  const [stats, setStats] = React.useState({
    totalMolds: 0,
    maintenanceMolds: 0,
    externalMolds: 0,
  });

  React.useEffect(() => {
    getStats().then(setStats);
  }, []);

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Molds</CardTitle>
          <Package className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.totalMolds}</div>
          <p className="text-xs text-muted-foreground">All molds in the system</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Molds in Maintenance
          </CardTitle>
          <Wrench className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.maintenanceMolds}</div>
          <p className="text-xs text-muted-foreground">
            Currently under maintenance or repair
          </p>
        </CardContent>
      </Card>
      {user?.isAdmin && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">External Molds</CardTitle>
            <Globe className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.externalMolds}</div>
            <p className="text-xs text-muted-foreground">
              Molds located at external suppliers
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
