
'use client';

import * as React from 'react';
import { Pie, PieChart, Cell } from 'recharts';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from '@/components/ui/chart';
import { getSupplierDistribution } from '@/lib/data';
import type { MoldSupplierDistribution } from '@/lib/types';
import { Skeleton } from '../ui/skeleton';

const chartConfigBase = {
  molds: {
    label: 'Molds',
  },
};

export function SupplierChart() {
  const [data, setData] = React.useState<MoldSupplierDistribution>([]);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    setIsLoading(true);
    getSupplierDistribution().then(data => {
      setData(data);
      setIsLoading(false);
    });
  }, []);

  const chartConfig = React.useMemo(() => {
    const config = { ...chartConfigBase } as any;
    data.forEach((item, index) => {
      config[item.supplier] = {
        label: item.supplier,
        color: `hsl(var(--chart-${(index % 5) + 1}))`,
      };
    });
    return config;
  }, [data]);

  if (isLoading) {
    return <Skeleton className="h-[250px] w-[250px] rounded-full mx-auto" />
  }
  
  if (data.length === 0) {
    return (
        <div className="flex flex-col items-center justify-center h-[250px] text-center text-sm text-muted-foreground">
            <p className="font-semibold">External Supplier Molds</p>
            <p>No molds are currently located at external suppliers.</p>
        </div>
    )
  }

  return (
    <ChartContainer
      config={chartConfig}
      className="mx-auto aspect-square h-[250px]"
    >
      <PieChart>
        <ChartTooltip
          cursor={false}
          content={<ChartTooltipContent hideLabel />}
        />
        <Pie
          data={data}
          dataKey="count"
          nameKey="supplier"
          innerRadius={60}
          strokeWidth={5}
        >
          {data.map((entry) => (
            <Cell
              key={entry.supplier}
              fill={chartConfig[entry.supplier]?.color || 'hsl(var(--chart-1))'}
            />
          ))}
        </Pie>
        <ChartLegend
          content={<ChartLegendContent nameKey="supplier" />}
          className="-translate-y-2 flex-wrap gap-2 [&>*]:basis-1/4 [&>*]:justify-center"
        />
      </PieChart>
    </ChartContainer>
  );
}
