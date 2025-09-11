
'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';
import { Skeleton } from '@/components/ui/skeleton';
import { useEffect, useState } from 'react';
import type { ComponentScrapRate } from '@/lib/types';
import { getScrapRate } from '@/lib/data';

export function ScrapRateChart({ className }: { className?: string }) {
  const [data, setData] = useState<ComponentScrapRate[]>([]);
  const [timePeriod, setTimePeriod] = useState<string>('30');
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    setIsLoading(true);
    getScrapRate(Number(timePeriod)).then(data => {
        setData(data);
        setIsLoading(false);
    });
  }, [timePeriod]);
  
  const handleBarClick = (data: any) => {
    if (data && data.componentId) {
      router.push(`/components/${data.componentId}`);
    }
  };

  return (
    <Card className={cn(className)}>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>Component Scrap Rate (Top 10)</CardTitle>
            <CardDescription>Percentage of scrapped parts per component.</CardDescription>
          </div>
          <Select value={timePeriod} onValueChange={setTimePeriod}>
            <SelectTrigger className="w-[120px]">
              <SelectValue placeholder="Period" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="30">Last 30d</SelectItem>
              <SelectItem value="90">Last 90d</SelectItem>
              <SelectItem value="365">Last Year</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
            <Skeleton className="h-[300px] w-full" />
        ) : data.length > 0 ? (
            <div className="h-[300px] w-full">
              {/* Chart would be rendered here */}
              <p className="text-sm text-muted-foreground">Scrap rate data is available but the chart component is disabled.</p>
            </div>
        ) : (
            <div className="flex items-center justify-center h-[300px] text-center text-sm text-muted-foreground">
                <p>No scrap data recorded for the selected period.</p>
            </div>
        )}
      </CardContent>
    </Card>
  );
}
