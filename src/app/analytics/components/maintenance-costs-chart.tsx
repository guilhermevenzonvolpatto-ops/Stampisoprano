
'use client';

import * as React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

interface MaintenanceCostsChartProps {
  data: { month: string; totalCost: number }[];
}

export function MaintenanceCostsChart({ data }: MaintenanceCostsChartProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Maintenance Costs Over Time</CardTitle>
        <CardDescription>Total costs from maintenance and repair events per month.</CardDescription>
      </CardHeader>
      <CardContent>
        {data.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart
                data={data}
                margin={{
                  top: 5,
                  right: 30,
                  left: 20,
                  bottom: 5,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis
                  tickFormatter={(value) =>
                    new Intl.NumberFormat('en-US', {
                      style: 'currency',
                      currency: 'EUR',
                      notation: 'compact'
                    }).format(value)
                  }
                />
                <Tooltip
                  formatter={(value: number) => [
                    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'EUR' }).format(value),
                    'Total Cost'
                  ]}
                  contentStyle={{
                    background: 'hsl(var(--background))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: 'var(--radius)',
                  }}
                />
                <Line type="monotone" dataKey="totalCost" stroke="hsl(var(--primary))" activeDot={{ r: 8 }} />
              </LineChart>
            </ResponsiveContainer>
        ) : (
            <div className="flex h-[300px] items-center justify-center">
                <p className="text-sm text-muted-foreground">No cost data available for maintenance events.</p>
            </div>
        )}
      </CardContent>
    </Card>
  );
}
