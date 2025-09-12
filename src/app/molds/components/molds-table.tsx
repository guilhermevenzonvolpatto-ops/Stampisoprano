
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
import type { Mold } from '@/lib/types';
import {
  ChevronDown,
  PlusCircle,
  Download,
  Upload,
  Trash2,
  CornerDownRight,
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
import { useApp } from '@/context/app-context';
import { ImportMoldsDialog } from './import-molds-dialog';
import { AdminButton } from '@/components/layout/admin-button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { useToast } from '@/hooks/use-toast';
import { deleteMold } from '@/lib/data';
import { useRouter } from 'next/navigation';

interface MoldsTableProps {
  data: Mold[];
}

type MoldRow = Mold & { isChild?: boolean };

export function MoldsTable({ data }: MoldsTableProps) {
  const [searchTerm, setSearchTerm] = React.useState('');
  const [statusFilter, setStatusFilter] = React.useState('all');
  const [isImporting, setIsImporting] = React.useState(false);
  const { user } = useApp();
  const { toast } = useToast();
  const router = useRouter();


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

  const flattenedData = React.useMemo(() => {
    let molds = data;
    
    if (user && !user.isAdmin) {
      molds = molds.filter(m => user.allowedCodes.includes(m.codice) || (m.children && m.children.some(c => user.allowedCodes.includes(c.codice))));
    }
    
    if (searchTerm) {
      molds = molds.filter(
        (m) =>
          m.codice.toLowerCase().includes(searchTerm.toLowerCase()) ||
          m.descrizione.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (m.children && m.children.some(c => c.codice.toLowerCase().includes(searchTerm.toLowerCase()) || c.descrizione.toLowerCase().includes(searchTerm.toLowerCase())))
      );
    }

    if (statusFilter !== 'all') {
      molds = molds.filter((m) => m.stato === statusFilter || (m.children && m.children.some(c => c.stato === statusFilter)));
    }
    
    const flatList: MoldRow[] = [];
    molds.forEach(mold => {
        flatList.push(mold);
        if (mold.children) {
            mold.children.forEach(child => {
                flatList.push({ ...child, isChild: true });
            });
        }
    });

    return flatList;
  }, [data, searchTerm, statusFilter, user]);

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

  const handleDelete = async (mold: Mold) => {
    try {
      await deleteMold(mold.id);
      toast({
        title: 'Mold Deleted',
        description: `Mold "${mold.codice}" has been moved to the archive.`,
      });
      router.refresh();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'An error occurred while deleting the mold.',
        variant: 'destructive',
      });
    }
  };


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
            <AdminButton href="/molds/new">
                <PlusCircle className="mr-2 h-4 w-4" />
                Add Mold
            </AdminButton>
          </div>
        </div>
        <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[300px]">Mold Code</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Supplier</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Available at</TableHead>
                <TableHead>
                  <span className="sr-only">Actions</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {flattenedData.map((mold) => (
                <TableRow key={mold.id} className={cn(mold.isChild && 'bg-muted/50')}>
                  <TableCell className="font-medium">
                    <div className={cn("flex items-center gap-2", mold.isChild && "pl-6")}>
                       {mold.isChild && <CornerDownRight className="h-4 w-4 text-muted-foreground" />}
                      <Link href={`/molds/${mold.id}`} className="hover:underline">
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
                  <TableCell>{mold.availableAt || 'N/A'}</TableCell>
                  <TableCell className="text-right space-x-2">
                      <Button asChild variant="outline" size="sm">
                          <Link href={`/molds/${mold.id}`}>View Details</Link>
                      </Button>
                      {user?.isAdmin && (
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-9 w-9">
                                <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                              <AlertDialogDescription>
                                This will archive the mold. It won't be permanently deleted, but it will be hidden from the main list.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleDelete(mold)}>Archive</AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
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

    