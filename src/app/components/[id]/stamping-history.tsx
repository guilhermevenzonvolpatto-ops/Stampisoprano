
'use client';

import * as React from 'react';
import type { StampingData, StampingDataHistoryEntry } from '@/lib/types';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { ArrowRight } from 'lucide-react';

interface StampingHistoryProps {
  history: StampingDataHistoryEntry[];
}

const fieldLabels: Record<keyof StampingData, string> = {
    programName: 'Program Name',
    cycleTime: 'Cycle Time',
    injectionTime: 'Injection Time',
    holdingPressure: 'Holding Pressure',
    meltTemperature: 'Melt Temperature',
    moldTemperature: 'Mold Temperature',
    clampForce: 'Clamp Force',
    injectionPressure: 'Injection Pressure',
    postPressure: 'Post Pressure',
    maintenanceTime: 'Maintenance Time',
    coolingTime: 'Cooling Time',
    counterPressure: 'Counter Pressure',
    injectionSpeed: 'Injection Speed',
};


export function StampingHistory({ history }: StampingHistoryProps) {
  return (
    <Card className="lg:col-span-2">
      <CardHeader>
        <CardTitle>Stamping Data Change History</CardTitle>
        <CardDescription>
          An audit log of all changes made to the stamping process parameters.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {history.length > 0 ? (
          <ScrollArea className="h-72">
            <div className="relative border-l pl-6 space-y-6">
                {history.map((entry) => (
                    <div key={entry.id} className="relative">
                        <div className="absolute -left-[29px] top-1.5 h-4 w-4 rounded-full bg-primary" />
                        <div className="flex items-center gap-4">
                            <p className="text-sm font-semibold whitespace-nowrap">{entry.timestamp.toLocaleString()}</p>
                             <Badge variant="secondary">{entry.user}</Badge>
                        </div>
                        <div className="mt-2 space-y-1">
                            {Object.entries(entry.changedData).map(([key, value]) => (
                                <div key={key} className="flex items-center text-xs text-muted-foreground">
                                    <p className="font-medium pr-1">{fieldLabels[key as keyof StampingData]}:</p>
                                    <p>{String(value) || 'Not set'}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
          </ScrollArea>
        ) : (
          <p className="text-sm text-center text-muted-foreground py-8">
            No changes have been logged for this component's stamping data.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
