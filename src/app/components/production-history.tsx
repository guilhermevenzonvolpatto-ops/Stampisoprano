
'use client';

import * as React from 'react';
import type { ProductionLog } from '@/lib/types';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { useApp } from '@/context/app-context';
import { Button } from '@/components/ui/button';
import { Edit, Trash2 } from 'lucide-react';
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
import { deleteProductionLog } from '@/lib/data';
import { useRouter } from 'next/navigation';
import { EditProductionLogSheet } from './edit-production-log-sheet';

interface ProductionHistoryProps {
  logs: ProductionLog[];
  componentId: string;
}

export function ProductionHistory({ logs, componentId }: ProductionHistoryProps) {
  const { user } = useApp();
  const { toast } = useToast();
  const router = useRouter();
  const [selectedLog, setSelectedLog] = React.useState<ProductionLog | null>(null);
  const [isSheetOpen, setIsSheetOpen] = React.useState(false);


  const handleDelete = async (logId: string) => {
    try {
        await deleteProductionLog(logId);
        toast({
            title: 'Log Deleted',
            description: 'The production log has been successfully deleted.',
        });
        router.refresh();
    } catch (error) {
        toast({
            title: 'Error',
            description: 'Could not delete the production log.',
            variant: 'destructive',
        });
    }
  }

  const handleEdit = (log: ProductionLog) => {
    setSelectedLog(log);
    setIsSheetOpen(true);
  }
  
  const handleSheetClose = () => {
    setIsSheetOpen(false);
    setSelectedLog(null);
  }

  return (
    <>
    <Card className="lg:col-span-2">
      <CardHeader>
        <CardTitle>Production History</CardTitle>
        <CardDescription>
          A log of all production runs for this component.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {logs.length > 0 ? (
          <ScrollArea className="h-72">
            <Table>
              <TableHeader className="sticky top-0 bg-card">
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>User</TableHead>
                  <TableHead className="text-right">Good</TableHead>
                  <TableHead className="text-right">Scrapped</TableHead>
                  <TableHead>Scrap Reason</TableHead>
                  {user?.isAdmin && <TableHead className="text-right">Actions</TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {logs.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell className="whitespace-nowrap">
                      {log.timestamp.toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">{log.user}</Badge>
                    </TableCell>
                    <TableCell className="text-right font-medium text-green-600">
                      {log.good}
                    </TableCell>
                    <TableCell className="text-right font-medium text-red-600">
                      {log.scrapped}
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {log.scrapReason || 'N/A'}
                    </TableCell>
                    {user?.isAdmin && (
                        <TableCell className="text-right">
                           <div className="flex justify-end items-center gap-2">
                             <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleEdit(log)}>
                                 <Edit className="h-4 w-4" />
                             </Button>
                             <AlertDialog>
                                  <AlertDialogTrigger asChild>
                                    <Button variant="ghost" size="icon" className="h-8 w-8">
                                        <Trash2 className="h-4 w-4 text-destructive" />
                                    </Button>
                                  </AlertDialogTrigger>
                                  <AlertDialogContent>
                                    <AlertDialogHeader>
                                      <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                      <AlertDialogDescription>
                                        This action cannot be undone. This will permanently delete the production log and adjust the total component cycles.
                                      </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                                      <AlertDialogAction onClick={() => handleDelete(log.id)}>Continue</AlertDialogAction>
                                    </AlertDialogFooter>
                                  </AlertDialogContent>
                                </AlertDialog>
                           </div>
                        </TableCell>
                    )}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </ScrollArea>
        ) : (
          <p className="text-sm text-center text-muted-foreground py-8">
            No production logs found for this component.
          </p>
        )}
      </CardContent>
    </Card>
    {selectedLog && (
        <EditProductionLogSheet
            isOpen={isSheetOpen}
            onClose={handleSheetClose}
            log={selectedLog}
        />
    )}
    </>
  );
}
