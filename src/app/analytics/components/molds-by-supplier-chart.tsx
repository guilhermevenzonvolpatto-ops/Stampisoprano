
'use client';

import * as React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import type { MoldSupplierDistribution } from '@/lib/types';

interface MoldsBySupplierChartProps {
  data: MoldSupplierDistribution;
}

export function MoldsBySupplierChart({ data }: MoldsBySupplierChartProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Molds by Supplier</CardTitle>
        <CardDescription>The number of molds located at external suppliers.</CardDescription>
      </CardHeader>
      <CardContent>
         {data.length > 0 ? (
          <ResponsiveContainer width="100%" height={250}>
            <BarChart
              data={data}
              layout="vertical"
              margin={{
                top: 5,
                right: 30,
                left: 20,
                bottom: 5,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" horizontal={false} />
              <XAxis type="number" allowDecimals={false} />
              <YAxis
                dataKey="supplier"
                type="category"
                width={80}
                tick={{ fontSize: 12 }}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip
                cursor={{ fill: 'hsl(var(--muted))' }}
                contentStyle={{
                  background: 'hsl(var(--background))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: 'var(--radius)',
                }}
              />
              <Bar dataKey="count" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex h-[250px] items-center justify-center">
            <p className="text-sm text-muted-foreground">No molds are currently at external suppliers.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
