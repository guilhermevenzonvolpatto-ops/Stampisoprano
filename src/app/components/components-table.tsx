
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
import { PlusCircle, Trash2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useApp } from '@/context/app-context';
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
import { deleteComponent } from '@/lib/data';
import { useRouter } from 'next/navigation';

interface ComponentsTableProps {
  data: Component[];
}

export function ComponentsTable({ data }: ComponentsTableProps) {
  const [searchTerm, setSearchTerm] = React.useState('');
  const { user } = useApp();
  const { toast } = useToast();
  const router = useRouter();

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
    let components = [...data];
    if (user && !user.isAdmin) {
      components = data.filter(c => user.allowedCodes.includes(c.codice));
    }
    
    if (!searchTerm) return components;

    return components.filter(
      (c) =>
        c.codice.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.descrizione.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.materiale.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [data, searchTerm, user]);

  const handleDelete = async (component: Component) => {
    try {
      await deleteComponent(component.id);
      toast({
        title: 'Component Deleted',
        description: `Component "${component.codice}" has been moved to the archive.`,
      });
      router.refresh();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'An error occurred while deleting the component.',
        variant: 'destructive',
      });
    }
  };

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
                <TableCell>{(c.cicliTotali || 0).toLocaleString()}</TableCell>
                <TableCell>
                  <Badge variant="secondary" className={getStatusClass(c.stato)}>
                    {c.stato}
                  </Badge>
                </TableCell>
                <TableCell className="text-right space-x-2">
                  <Button variant="outline" size="sm" asChild>
                    <Link href={`/components/${c.id}`}>View Details</Link>
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
                              This will archive the component. It won't be permanently deleted, but it will be hidden from the main list.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleDelete(c)}>Archive</AlertDialogAction>
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
  );
}
