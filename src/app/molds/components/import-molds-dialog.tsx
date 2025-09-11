
'use client';
import * as React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { createMold } from '@/lib/data';
import Papa from 'papaparse';
import { Loader2, UploadCloud } from 'lucide-react';
import { useRouter } from 'next/navigation';
import type { Mold } from '@/lib/types';

interface ImportMoldsDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ImportMoldsDialog({ isOpen, onClose }: ImportMoldsDialogProps) {
  const [file, setFile] = React.useState<File | null>(null);
  const [isImporting, setIsImporting] = React.useState(false);
  const { toast } = useToast();
  const router = useRouter();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFile(e.target.files[0]);
    }
  };

  const handleImport = () => {
    if (!file) {
      toast({
        title: 'No file selected',
        description: 'Please select a CSV file to import.',
        variant: 'destructive',
      });
      return;
    }

    setIsImporting(true);
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: async (results) => {
        let successCount = 0;
        let errorCount = 0;
        const errors: string[] = [];

        for (const row of results.data as any[]) {
          const moldData: Omit<Mold, 'id' | 'data' | 'stato' | 'isDeleted'> = {
            codice: row.codice,
            descrizione: row.descrizione,
            padre: row.padre || null,
            posizione: {
                type: row.posizioneType as 'interna' | 'esterna',
                value: row.posizioneValue
            },
            macchinaAssociata: row.macchinaAssociata || null,
          };

          const result = await createMold(moldData);

          if (result?.error) {
            errorCount++;
            errors.push(`Row for ${row.codice}: ${result.error}`);
          } else {
            successCount++;
          }
        }
        
        setIsImporting(false);
        setFile(null);
        onClose();

        toast({
            title: `Import Complete`,
            description: `${successCount} molds imported successfully. ${errorCount} failed. ${errors.length > 0 ? `Errors: ${errors.join(', ')}` : ''}`,
            duration: 5000,
        });
        
        router.refresh();

      },
      error: (error) => {
        setIsImporting(false);
        toast({
          title: 'Import Failed',
          description: error.message,
          variant: 'destructive',
        });
      },
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Import Molds from CSV</DialogTitle>
          <DialogDescription>
            Upload a CSV file to create new molds in bulk. The file must have columns: 
            `codice`, `descrizione`, `padre`, `posizioneType`, `posizioneValue`, `macchinaAssociata`.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4 space-y-2">
            <label htmlFor="file-upload" className="block text-sm font-medium text-gray-700">CSV File</label>
            <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                <div className="space-y-1 text-center">
                    <UploadCloud className="mx-auto h-12 w-12 text-gray-400" />
                    <div className="flex text-sm text-gray-600">
                        <label htmlFor="file-upload" className="relative cursor-pointer bg-white rounded-md font-medium text-primary hover:text-primary/80 focus-within:outline-none">
                            <span>Upload a file</span>
                            <Input id="file-upload" name="file-upload" type="file" className="sr-only" onChange={handleFileChange} accept=".csv" />
                        </label>
                        <p className="pl-1">or drag and drop</p>
                    </div>
                    {file ? (
                        <p className="text-xs text-gray-500">{file.name}</p>
                    ) : (
                        <p className="text-xs text-gray-500">CSV up to 10MB</p>
                    )}
                </div>
            </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isImporting}>Cancel</Button>
          <Button onClick={handleImport} disabled={isImporting || !file}>
            {isImporting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            {isImporting ? 'Importing...' : 'Import'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
