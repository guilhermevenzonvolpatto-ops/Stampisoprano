
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
import { useApp } from '@/context/app-context';
import { AddOrSelectComponentDialog } from './add-or-select-component-dialog';
import { getComponents } from '@/lib/data';

interface AssociatedComponentsProps {
  components: Component[];
  moldId: string;
  onUpdate: () => void;
}

export function AssociatedComponents({ components, moldId, onUpdate }: AssociatedComponentsProps) {
  const { user, t } = useApp();
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
  const [allComponents, setAllComponents] = React.useState<Component[]>([]);

  React.useEffect(() => {
    if (user?.isAdmin) {
      getComponents().then(setAllComponents);
    }
  }, [user]);

  const getStatusClass = (status: string) => {
    switch (status) {
      case 'Attivo': return 'bg-green-100 text-green-800 hover:bg-green-100/80';
      case 'In modifica': return 'bg-yellow-100 text-yellow-800 hover:bg-yellow-100/80';
      case 'Obsoleto': return 'bg-red-100 text-red-800 hover:bg-red-100/80';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (!user) return null;

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>{t('associatedComponents')}</CardTitle>
          {user.isAdmin && (
             <Button variant="outline" size="sm" onClick={() => setIsDialogOpen(true)}>
                <PlusCircle className="mr-2 h-4 w-4" />
                {t('addComponent')}
            </Button>
          )}
        </CardHeader>
        <CardContent>
          {components.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('code')}</TableHead>
                  <TableHead>{t('description')}</TableHead>
                  <TableHead>{t('material')}</TableHead>
                  <TableHead>{t('status')}</TableHead>
                  <TableHead><span className="sr-only">{t('actions')}</span></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {components.map((c) => (
                  <TableRow key={c.id}>
                    <TableCell className="font-medium">{c.codice}</TableCell>
                    <TableCell>{c.descrizione}</TableCell>
                    <TableCell>{c.materiale}</TableCell>
                    <TableCell>
                      <Badge variant="secondary" className={getStatusClass(c.stato)}>
                        {c.stato}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button asChild variant="outline" size="sm">
                          <Link href={`/components/${c.id}`}>{t('viewDetails')}</Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
              <p className="text-sm text-center text-muted-foreground py-8">{t('noComponentsAssociated')}</p>
          )}
        </CardContent>
      </Card>
      {user.isAdmin && (
        <AddOrSelectComponentDialog
          isOpen={isDialogOpen}
          onClose={() => setIsDialogOpen(false)}
          moldId={moldId}
          allComponents={allComponents}
          associatedComponentIds={components.map(c => c.id)}
          onAssociationComplete={onUpdate}
        />
      )}
    </>
  );
}
