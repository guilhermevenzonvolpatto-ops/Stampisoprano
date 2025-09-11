'use client';

import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from '@/components/ui/chart';
import { getStatusDistribution } from '@/lib/data';
import { useEffect, useState } from 'react';
import type { MoldStatusDistribution } from '@/lib/types';
import { Pie, PieChart, Cell } from 'recharts';

const chartConfig = {
  count: {
    label: 'Molds',
  },
  Operativo: {
    label: 'Operational',
    color: 'hsl(var(--chart-2))',
  },
  'In Manutenzione': {
    label: 'Maintenance',
    color: 'hsl(var(--chart-3))',
  },
  Lavorazione: {
    label: 'Processing',
    color: 'hsl(var(--chart-4))',
  },
  Fermo: {
    label: 'Stopped',
    color: 'hsl(var(--chart-5))',
  },
};

export function StatusChart() {
  const [data, setData] = useState<MoldStatusDistribution>([]);

  useEffect(() => {
    async function fetchData() {
      const result = await getStatusDistribution();
      setData(result);
    }
    fetchData();
  }, []);

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
          nameKey="status"
          innerRadius={60}
          strokeWidth={5}
        >
          {data.map((entry) => (
            <Cell
              key={entry.status}
              fill={chartConfig[entry.status as keyof typeof chartConfig]?.color}
            />
          ))}
        </Pie>
        <ChartLegend
          content={<ChartLegendContent nameKey="status" />}
          className="-translate-y-2 flex-wrap gap-2 [&>*]:basis-1/4 [&>*]:justify-center"
        />
      </PieChart>
    </ChartContainer>
  );
}
