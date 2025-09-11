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
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import type { Mold } from '@/lib/types';
import {
  ChevronRight,
  GripVertical,
  PlusCircle,
  Download,
  Upload,
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useApp } from '@/context/app-context';
import { ImportMoldsDialog } from './import-molds-dialog';

interface MoldsTableProps {
  data: Mold[];
}

export function MoldsTable({ data }: MoldsTableProps) {
  const [searchTerm, setSearchTerm] = React.useState('');
  const [statusFilter, setStatusFilter] = React.useState('all');
  const [isImporting, setIsImporting] = React.useState(false);
  const { user } = useApp();

  const getStatusClass = (status: Mold['stato']) => {
    switch (status) {
      case 'Operativo':
        return 'bg-green-100 text-green-800 hover:bg-green-100/80';
      case 'In Manutenzione':
        return 'bg-yellow-100 text-yellow-800 hover:bg-yellow-100/80';
      case 'Lavorazione':
        return 'bg-blue-100 text-blue-800 hover:bg-blue-100/80';
      case 'Fermo':
        return 'bg-red-100 text-red-800 hover:bg-red-100/80';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredData = React.useMemo(() => {
    let molds = data;
    
    if (user && !user.isAdmin) {
      molds = molds.filter(m => user.allowedCodes.includes(m.codice));
    }
    
    if (searchTerm) {
      molds = molds.filter(
        (m) =>
          m.codice.toLowerCase().includes(searchTerm.toLowerCase()) ||
          m.descrizione.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    if (statusFilter !== 'all') {
      molds = molds.filter((m) => m.stato === statusFilter);
    }
    return molds;
  }, [data, searchTerm, statusFilter, user]);

  const topLevelMolds = filteredData.filter((m) => !m.padre || !filteredData.find(p => p.id === m.padre));

  const downloadCSV = () => {
    const headers = ['codice', 'descrizione', 'data', 'padre', 'stato', 'posizioneType', 'posizioneValue', 'macchinaAssociata'];
    const csvRows = [
        headers.join(',')
    ];

    const allMolds = Object.values(data);
    
    for (const mold of allMolds) {
        const values = [
            mold.codice,
            `"${mold.descrizione.replace(/"/g, '""')}"`, // Handle quotes
            mold.data,
            mold.padre || '',
            mold.stato,
            mold.posizione.type,
            `"${mold.posizione.value.replace(/"/g, '""')}"`,
            mold.macchinaAssociata || ''
        ];
        csvRows.push(values.join(','));
    }

    const blob = new Blob([csvRows.join('\n')], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.setAttribute('hidden', '');
    a.setAttribute('href', url);
    a.setAttribute('download', `molds_export_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }

  const renderRow = (mold: Mold, isChild = false) => (
    <Collapsible asChild key={mold.id}>
      <TableRow className={cn(isChild && 'bg-muted/50')}>
        <TableCell
          className={cn('font-medium', isChild && 'pl-10')}
        >
          <div className="flex items-center gap-1">
            {mold.children && mold.children.length > 0 ? (
              <CollapsibleTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8 -ml-2">
                  <ChevronRight className="h-4 w-4 transition-transform duration-200 group-data-[state=open]:rotate-90" />
                </Button>
              </CollapsibleTrigger>
            ) : (
              <div className="w-8" />
            )}
            <Link
              href={`/molds/${mold.id}`}
              className="hover:underline"
            >
              {mold.codice}
            </Link>
          </div>
        </TableCell>
        <TableCell>{mold.descrizione}</TableCell>
        <TableCell>
          {mold.posizione.type === 'interna'
            ? mold.posizione.value
            : 'N/A'}
        </TableCell>
        <TableCell>
          {mold.posizione.type === 'esterna'
            ? mold.posizione.value
            : 'N/A'}
        </TableCell>
        <TableCell>
          <Badge
            variant='secondary'
            className={getStatusClass(mold.stato)}
          >
            {mold.stato}
          </Badge>
        </TableCell>
        <TableCell>{mold.data}</TableCell>
        <TableCell className="text-right">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <GripVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem asChild>
                <Link href={`/molds/${mold.id}`}>View Details</Link>
              </DropdownMenuItem>
               {user?.isAdmin && (
                <DropdownMenuItem asChild>
                  <Link href={`/molds/${mold.id}/edit`}>Edit</Link>
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </TableCell>
        {mold.children && mold.children.length > 0 && (
          <CollapsibleContent asChild>
              {mold.children.map((child) => renderRow(child, true))}
          </CollapsibleContent>
        )}
      </TableRow>
    </Collapsible>
  );

  return (
    <>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Input
              placeholder="Search molds..."
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
                <SelectItem value="Lavorazione">Processing</SelectItem>
                <SelectItem value="Fermo">Stopped</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center gap-2">
            {user?.isAdmin && (
              <>
                <Button variant="outline" onClick={() => setIsImporting(true)}>
                  <Upload className="mr-2 h-4 w-4" />
                  Import CSV
                </Button>
                <Button variant="outline" onClick={downloadCSV}>
                  <Download className="mr-2 h-4 w-4" />
                  Download CSV
                </Button>
              </>
            )}
            <Button asChild>
              <Link href="/molds/new">
                <PlusCircle className="mr-2 h-4 w-4" />
                Add Mold
              </Link>
            </Button>
          </div>
        </div>
        <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[250px]">Mold Code</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Supplier</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>
                  <span className="sr-only">Actions</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>{topLevelMolds.map((mold) => renderRow(mold))}</TableBody>
          </Table>
        </div>
      </div>
      <ImportMoldsDialog
        isOpen={isImporting}
        onClose={() => setIsImporting(false)}
      />
    </>
  );
}
