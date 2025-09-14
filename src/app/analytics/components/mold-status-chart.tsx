
'use client';

import * as React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import type { MoldStatusDistribution } from '@/lib/types';

interface MoldStatusChartProps {
  data: MoldStatusDistribution;
}

const COLORS: Record<MoldStatusDistribution[number]['status'], string> = {
  Operativo: 'hsl(var(--chart-1))',
  'In Manutenzione': 'hsl(var(--chart-2))',
  Lavorazione: 'hsl(var(--chart-3))',
  Fermo: 'hsl(var(--chart-4))',
};

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-lg border bg-background p-2 shadow-sm">
        <div className="grid grid-cols-2 gap-2">
          <div className="flex flex-col space-y-1">
            <span className="text-[0.70rem] uppercase text-muted-foreground">Status</span>
            <span className="font-bold text-muted-foreground">{payload[0].name}</span>
          </div>
          <div className="flex flex-col space-y-1">
            <span className="text-[0.70rem] uppercase text-muted-foreground">Count</span>
            <span className="font-bold">{payload[0].value}</span>
          </div>
        </div>
      </div>
    );
  }
  return null;
};


export function MoldStatusChart({ data }: MoldStatusChartProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Mold Status Distribution</CardTitle>
        <CardDescription>A breakdown of the current status of all molds in the system.</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={250}>
          <PieChart>
            <Tooltip content={<CustomTooltip />} />
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine={false}
              outerRadius={80}
              fill="#8884d8"
              dataKey="count"
              nameKey="status"
              stroke="hsl(var(--border))"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[entry.status]} />
              ))}
            </Pie>
             <Legend iconSize={10} />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
