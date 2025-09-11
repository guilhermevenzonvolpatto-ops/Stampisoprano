
'use client';
import * as React from 'react';
import Link from 'next/link';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import type { Component } from '@/lib/types';
import { PlusCircle } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useApp } from '@/context/app-context';
import { AdminButton } from '@/components/layout/admin-button';

interface ComponentsTableProps {
  data: Component[];
}

export function ComponentsTable({ data }: ComponentsTableProps) {
  const [searchTerm, setSearchTerm] = React.useState('');
  const { user } = useApp();

  const getStatusClass = (status: Component['stato']) => {
    switch (status) {
      case 'Attivo':
        return 'bg-green-100 text-green-800 hover:bg-green-100/80';
      case 'In modifica':
        return 'bg-yellow-100 text-yellow-800 hover:bg-yellow-100/80';
      case 'Obsoleto':
        return 'bg-red-100 text-red-800 hover:bg-red-100/80';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredData = React.useMemo(() => {
    let components = data;
    if (user && !user.isAdmin) {
      components = components.filter(c => user.allowedCodes.includes(c.codice));
    }
    
    if (!searchTerm) return components;

    return components.filter(
      (c) =>
        c.codice.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.descrizione.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.materiale.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [data, searchTerm, user]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Input
            placeholder="Search components..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-80"
          />
        </div>
        <AdminButton href="/components/new">
            <PlusCircle className="mr-2 h-4 w-4" />
            Add Component
        </AdminButton>
      </div>
      <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Code</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Material</TableHead>
              <TableHead>Total Cycles</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>
                <span className="sr-only">Actions</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredData.map((c) => (
              <TableRow key={c.id}>
                <TableCell className="font-medium">{c.codice}</TableCell>
                <TableCell>{c.descrizione}</TableCell>
                <TableCell>{c.materiale}</TableCell>
                <TableCell>{c.cicliTotali.toLocaleString()}</TableCell>
                <TableCell>
                  <Badge variant="secondary" className={getStatusClass(c.stato)}>
                    {c.stato}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <Button variant="outline" size="sm" asChild>
                    <Link href={`/components/${c.id}`}>View Details</Link>
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
