
'use client';

import * as React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Label } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

interface EventScheduleAdherenceChartProps {
  data: { eventType: string; averageDelay: number }[];
}

export function EventScheduleAdherenceChart({ data }: EventScheduleAdherenceChartProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Event Schedule Adherence</CardTitle>
        <CardDescription>Average delay (in days) for closed events compared to their estimate.</CardDescription>
      </CardHeader>
      <CardContent>
        {data.length > 0 ? (
          <ResponsiveContainer width="100%" height={250}>
            <BarChart
              data={data}
              margin={{ top: 5, right: 30, left: 20, bottom: 20 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="eventType" />
              <YAxis>
                 <Label value="Avg. Delay (Days)" angle={-90} position="insideLeft" style={{ textAnchor: 'middle' }} />
              </YAxis>
              <Tooltip
                formatter={(value: number) => [`${value.toFixed(1)} days`, 'Average Delay']}
                cursor={{ fill: 'hsl(var(--muted))' }}
                contentStyle={{
                  background: 'hsl(var(--background))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: 'var(--radius)',
                }}
              />
              <Bar
                dataKey="averageDelay"
                radius={[4, 4, 0, 0]}
                fill="hsl(var(--chart-2))"
                isAnimationActive={false}
              />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex h-[250px] items-center justify-center">
            <p className="text-sm text-muted-foreground">No completed events with actual end dates to analyze.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
