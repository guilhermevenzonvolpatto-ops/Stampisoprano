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
import { PlusCircle, Upload, Download, Check, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useApp } from '@/context/app-context';
import { AdminButton } from '@/components/layout/admin-button';
import { DeleteButton } from '@/components/shared/delete-button';
import { ImportComponentsDialog } from './import-components-dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';

interface ComponentsTableProps {
  data: Component[];
}

export function ComponentsTable({ data }: ComponentsTableProps) {
  const [searchTerm, setSearchTerm] = React.useState('');
  const [aestheticFilter, setAestheticFilter] = React.useState('all');
  const [foodContactFilter, setFoodContactFilter] = React.useState('all');
  const [isImporting, setIsImporting] = React.useState(false);
  const { user, t } = useApp();

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
    
    if (searchTerm) {
      components = components.filter(
        (c) =>
          c.codice.toLowerCase().includes(searchTerm.toLowerCase()) ||
          c.descrizione.toLowerCase().includes(searchTerm.toLowerCase()) ||
          c.materiale.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    if (aestheticFilter !== 'all') {
      const isAesthetic = aestheticFilter === 'yes';
      components = components.filter(c => !!c.isAesthetic === isAesthetic);
    }

    if (foodContactFilter !== 'all') {
      const isFoodContact = foodContactFilter === 'yes';
      components = components.filter(c => !!c.isFoodContact === isFoodContact);
    }

    return components;
  }, [data, searchTerm, user, aestheticFilter, foodContactFilter]);

  const downloadCSV = () => {
    const headers = ['codice', 'descrizione', 'materiale', 'peso', 'stato', 'cicliTotali', 'associatedMolds', 'isAesthetic', 'isFoodContact'];
    const csvRows = [headers.join(',')];

    for (const component of data) {
        const values = [
            component.codice,
            `"${component.descrizione.replace(/"/g, '""')}"`,
            component.materiale,
            component.peso,
            component.stato,
            component.cicliTotali || 0,
            `"${(component.associatedMolds || []).join(';')}"`, // Join multiple molds with a semicolon
            component.isAesthetic ? 'true' : 'false',
            component.isFoodContact ? 'true' : 'false',
        ];
        csvRows.push(values.join(','));
    }

    const blob = new Blob([csvRows.join('\n')], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.setAttribute('hidden', '');
    a.setAttribute('href', url);
    a.setAttribute('download', `components_export_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }

  return (
    <>
      <div className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex flex-wrap items-center gap-2">
            <Input
              placeholder={t('searchComponents')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full sm:w-64"
            />
            <Select value={aestheticFilter} onValueChange={setAestheticFilter}>
                <SelectTrigger className="w-full sm:w-auto">
                    <SelectValue placeholder="Aesthetic" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="all">All Aesthetic</SelectItem>
                    <SelectItem value="yes">Aesthetic</SelectItem>
                    <SelectItem value="no">Not Aesthetic</SelectItem>
                </SelectContent>
            </Select>
            <Select value={foodContactFilter} onValueChange={setFoodContactFilter}>
                <SelectTrigger className="w-full sm:w-auto">
                    <SelectValue placeholder="Food Contact" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="all">All Food Contact</SelectItem>
                    <SelectItem value="yes">Food Contact</SelectItem>
                    <SelectItem value="no">Not Food Contact</SelectItem>
                </SelectContent>
            </Select>
          </div>
          <div className="flex items-center gap-2">
            {user?.isAdmin && (
              <>
                <Button variant="outline" onClick={() => setIsImporting(true)}>
                  <Upload className="mr-2 h-4 w-4" />
                  {t('importCSV')}
                </Button>
                <Button variant="outline" onClick={downloadCSV}>
                  <Download className="mr-2 h-4 w-4" />
                  {t('downloadCSV')}
                </Button>
              </>
            )}
            <AdminButton href="/components/new">
                <PlusCircle className="mr-2 h-4 w-4" />
                {t('addComponent')}
            </AdminButton>
          </div>
        </div>
        <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t('code')}</TableHead>
                <TableHead>{t('description')}</TableHead>
                <TableHead>{t('material')}</TableHead>
                <TableHead className="text-center">Aesthetic</TableHead>
                <TableHead className="text-center">Food Contact</TableHead>
                <TableHead>{t('totalCycles')}</TableHead>
                <TableHead>{t('status')}</TableHead>
                <TableHead>
                  <span className="sr-only">{t('actions')}</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredData.map((c) => (
                <TableRow key={c.id}>
                  <TableCell className="font-medium">{c.codice}</TableCell>
                  <TableCell>{c.descrizione}</TableCell>
                  <TableCell>{c.materiale}</TableCell>
                   <TableCell className="text-center">
                    {c.isAesthetic ? <Check className="h-5 w-5 text-green-600 mx-auto" /> : <X className="h-5 w-5 text-destructive mx-auto" />}
                  </TableCell>
                  <TableCell className="text-center">
                    {c.isFoodContact ? <Check className="h-5 w-5 text-green-600 mx-auto" /> : <X className="h-5 w-5 text-destructive mx-auto" />}
                  </TableCell>
                  <TableCell>{(c.cicliTotali || 0).toLocaleString()}</TableCell>
                  <TableCell>
                    <Badge variant="secondary" className={getStatusClass(c.stato)}>
                      {c.stato}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right space-x-2">
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/components/${c.id}`}>{t('viewDetails')}</Link>
                    </Button>
                    {user?.isAdmin && (
                      <DeleteButton 
                          itemId={c.id}
                          itemType="component"
                          itemName={c.codice}
                          redirectPath="/components"
                      />
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
       <ImportComponentsDialog
        isOpen={isImporting}
        onClose={() => setIsImporting(false)}
      />
    </>
  );
}
