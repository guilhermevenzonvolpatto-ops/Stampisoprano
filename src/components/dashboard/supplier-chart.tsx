'use client';

import * as React from 'react';
import { Pie, PieChart } from 'recharts';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from '@/components/ui/chart';
import { getSupplierDistribution } from '@/lib/data';
import type { MoldSupplierDistribution } from '@/lib/types';

const chartConfig = {
  molds: {
    label: 'Molds',
  },
};

export function SupplierChart() {
  const [data, setData] = React.useState<MoldSupplierDistribution>([]);

  React.useEffect(() => {
    getSupplierDistribution().then(setData);
  }, []);

  const chartData = data.map((item, index) => ({
    ...item,
    fill: `hsl(var(--chart-${(index % 5) + 1}))`,
  }));

  const dynamicChartConfig = React.useMemo(() => {
    const config = { ...chartConfig };
    data.forEach((item, index) => {
      (config as any)[item.supplier] = {
        label: item.supplier,
        color: `hsl(var(--chart-${(index % 5) + 1}))`,
      };
    });
    return config;
  }, [data]);

  return (
    <ChartContainer
      config={dynamicChartConfig}
      className="mx-auto aspect-square h-[250px]"
    >
      <PieChart>
        <ChartTooltip
          cursor={false}
          content={<ChartTooltipContent hideLabel />}
        />
        <Pie
          data={chartData}
          dataKey="count"
          nameKey="supplier"
          innerRadius={60}
          strokeWidth={5}
        />
        <ChartLegend
          content={<ChartLegendContent nameKey="supplier" />}
          className="-translate-y-2 flex-wrap gap-2 [&>*]:basis-1/4 [&>*]:justify-center"
        />
      </PieChart>
    </ChartContainer>
  );
}
