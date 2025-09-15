
'use client';

import * as React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LabelList } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import type { ComponentScrapRate } from '@/lib/types';

interface ComponentScrapRateChartProps {
  data: ComponentScrapRate[];
}

export function ComponentScrapRateChart({ data }: ComponentScrapRateChartProps) {
  const chartData = data.slice(0, 10); // Show top 10

  return (
    <Card>
      <CardHeader>
        <CardTitle>Top Component Scrap Rates</CardTitle>
        <CardDescription>Percentage of scrapped parts for the top 10 components.</CardDescription>
      </CardHeader>
      <CardContent>
         {chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height={250}>
            <BarChart
              data={chartData}
              layout="vertical"
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" horizontal={false} />
              <XAxis type="number" domain={[0, 100]} unit="%" />
              <YAxis
                dataKey="componentCode"
                type="category"
                width={80}
                tick={{ fontSize: 12 }}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip
                formatter={(value: number) => [`${value.toFixed(2)}%`, 'Scrap Rate']}
                cursor={{ fill: 'hsl(var(--muted))' }}
                contentStyle={{
                  background: 'hsl(var(--background))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: 'var(--radius)',
                }}
              />
              <Bar dataKey="scrapRate" fill="hsl(var(--chart-4))" radius={[0, 4, 4, 0]}>
                <LabelList
                  dataKey="scrapRate"
                  position="right"
                  formatter={(value: number) => `${value.toFixed(1)}%`}
                  fontSize={12}
                />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex h-[250px] items-center justify-center">
            <p className="text-sm text-muted-foreground">No production log data available to calculate scrap rates.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
