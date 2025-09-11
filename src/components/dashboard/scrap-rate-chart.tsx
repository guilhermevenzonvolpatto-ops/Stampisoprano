
'use client';

import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from 'recharts';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';
import { getScrapRate } from '@/lib/data';
import * as React from 'react';
import type { ComponentScrapRate } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';
import { Skeleton } from '../ui/skeleton';

const chartConfig = {
  scrapRate: {
    label: 'Scrap Rate',
    color: 'hsl(var(--destructive))',
  },
  componentId: {
    label: 'Component'
  }
};

export function ScrapRateChart({ className }: { className?: string }) {
  const [data, setData] = React.useState<ComponentScrapRate[]>([]);
  const [timePeriod, setTimePeriod] = React.useState<string>('30');
  const [isLoading, setIsLoading] = React.useState(true);
  const router = useRouter();

  React.useEffect(() => {
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
            <CardDescription>Percentage of scrapped parts per component. Click a bar to view component details.</CardDescription>
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
            <ChartContainer config={chartConfig} className="h-[300px] w-full">
            <BarChart 
                accessibilityLayer 
                data={data}
                onClick={(e) => handleBarClick(e?.activePayload?.[0]?.payload)}
                margin={{ top: 5, right: 20, left: -10, bottom: 5 }}
            >
                <CartesianGrid vertical={false} />
                <XAxis
                dataKey="componentId"
                tickLine={false}
                tickMargin={10}
                axisLine={false}
                />
                <YAxis tickFormatter={(value) => `${value}%`} />
                <ChartTooltip
                cursor={false}
                content={<ChartTooltipContent indicator="dot" />}
                />
                <Bar dataKey="scrapRate" fill="var(--color-scrapRate)" radius={4} className="cursor-pointer" />
            </BarChart>
            </ChartContainer>
        ) : (
            <div className="flex items-center justify-center h-[300px] text-center text-sm text-muted-foreground">
                <p>No scrap data recorded for the selected period.</p>
            </div>
        )}
      </CardContent>
    </Card>
  );
}
