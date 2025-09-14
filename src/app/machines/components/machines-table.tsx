
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
import type { Machine } from '@/lib/types';
import { PlusCircle } from 'lucide-react';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useApp } from '@/context/app-context';
import { AdminButton } from '@/components/layout/admin-button';
import { DeleteButton } from '@/components/shared/delete-button';

interface MachinesTableProps {
  data: Machine[];
}

export function MachinesTable({ data }: MachinesTableProps) {
  const [searchTerm, setSearchTerm] = React.useState('');
  const [statusFilter, setStatusFilter] = React.useState('all');
  const { user } = useApp();


  const getStatusClass = (status: Machine['stato']) => {
    switch (status) {
      case 'Operativo':
        return 'bg-green-100 text-green-800 hover:bg-green-100/80';
      case 'In Manutenzione':
        return 'bg-yellow-100 text-yellow-800 hover:bg-yellow-100/80';
      case 'Fermo':
        return 'bg-red-100 text-red-800 hover:bg-red-100/80';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredData = React.useMemo(() => {
    let machines = data;
    
    if (searchTerm) {
      machines = machines.filter(
        (m) =>
          m.codice.toLowerCase().includes(searchTerm.toLowerCase()) ||
          m.descrizione.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== 'all') {
      machines = machines.filter((m) => m.stato === statusFilter);
    }
    
    return machines;
  }, [data, searchTerm, statusFilter]);


  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Input
            placeholder="Search machines..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-80"
          />
          <Select
            value={statusFilter}
            onValueChange={setStatusFilter}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="Operativo">Operational</SelectItem>
              <SelectItem value="In Manutenzione">Maintenance</SelectItem>
              <SelectItem value="Fermo">Stopped</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center gap-2">
          <AdminButton href="/machines/new">
              <PlusCircle className="mr-2 h-4 w-4" />
              Add Machine
          </AdminButton>
        </div>
      </div>
      <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Code</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Available at</TableHead>
              <TableHead>
                <span className="sr-only">Actions</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredData.map((machine) => (
              <TableRow key={machine.id}>
                <TableCell className="font-medium">{machine.codice}</TableCell>
                <TableCell>{machine.descrizione}</TableCell>
                <TableCell>{machine.tipo}</TableCell>
                <TableCell>
                  <Badge
                    variant='secondary'
                    className={getStatusClass(machine.stato)}
                  >
                    {machine.stato}
                  </Badge>
                </TableCell>
                <TableCell>{machine.availableAt || 'N/A'}</TableCell>
                <TableCell className="text-right space-x-2">
                    <Button asChild variant="outline" size="sm">
                        <Link href={`/machines/${machine.id}`}>View Details</Link>
                    </Button>
                    <DeleteButton 
                        itemId={machine.id}
                        itemType="machine"
                        itemName={machine.codice}
                        redirectPath="/machines"
                    />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
