
'use client';
import * as React from 'react';
import type { Component } from '@/lib/types';
import Link from 'next/link';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';

interface AssociatedComponentsProps {
  components: Component[];
}

export function AssociatedComponents({ components }: AssociatedComponentsProps) {
  
  const getStatusClass = (status: string) => {
    switch (status) {
      case 'Attivo': return 'bg-green-100 text-green-800 hover:bg-green-100/80';
      case 'In modifica': return 'bg-yellow-100 text-yellow-800 hover:bg-yellow-100/80';
      case 'Obsoleto': return 'bg-red-100 text-red-800 hover:bg-red-100/80';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Associated Components</CardTitle>
        <Button variant="outline" size="sm">
            <PlusCircle className="mr-2 h-4 w-4" />
            Add Component
        </Button>
      </CardHeader>
      <CardContent>
        {components.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Code</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Material</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {components.map((c) => (
                <TableRow key={c.id}>
                  <TableCell>
                    <Link
                      href={`/components/${c.id}`}
                      className="font-medium hover:underline text-primary"
                    >
                      {c.codice}
                    </Link>
                  </TableCell>
                  <TableCell>{c.descrizione}</TableCell>
                  <TableCell>{c.materiale}</TableCell>
                  <TableCell>
                    <Badge variant="secondary" className={getStatusClass(c.stato)}>
                      {c.stato}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
             <p className="text-sm text-center text-muted-foreground py-8">No components associated with this mold.</p>
        )}
      </CardContent>
    </Card>
  );
}
