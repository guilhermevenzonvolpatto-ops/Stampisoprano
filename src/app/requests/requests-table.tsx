
'use client';
import * as React from 'react';
import type { MaintenanceRequest } from '@/lib/types';
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
import { Check, X, Hourglass, Loader2, RefreshCw } from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { updateMaintenanceRequestStatus, getMaintenanceRequests } from '@/lib/data';
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
} from "@/components/ui/alert-dialog";
import { useRouter } from 'next/navigation';

interface RequestsTableProps {
  initialRequests: MaintenanceRequest[];
}

export function RequestsTable({ initialRequests }: RequestsTableProps) {
  const [requests, setRequests] = React.useState(initialRequests);
  const [isLoading, setIsLoading] = React.useState<Record<string, boolean>>({});
  const { toast } = useToast();
  const router = useRouter();

  React.useEffect(() => {
    setRequests(initialRequests);
  }, [initialRequests]);


  const handleUpdateStatus = async (requestId: string, status: 'approved' | 'rejected') => {
    setIsLoading(prev => ({ ...prev, [requestId]: true }));
    const result = await updateMaintenanceRequestStatus(requestId, status);
    setIsLoading(prev => ({ ...prev, [requestId]: false }));

    if (result.success) {
      toast({
        title: `Request ${status}`,
        description: `The request has been successfully ${status}.`,
      });
      // Refresh data locally
      setRequests(prev => prev.map(r => r.id === requestId ? { ...r, status } : r));
      router.refresh();
    } else {
      toast({
        title: 'Error',
        description: result.error || 'Failed to update request status.',
        variant: 'destructive',
      });
    }
  };
  
  const getStatusBadge = (status: MaintenanceRequest['status']) => {
    switch (status) {
      case 'pending':
        return (
          <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
            <Hourglass className="mr-1 h-3 w-3" />
            Pending
          </Badge>
        );
      case 'approved':
        return (
          <Badge variant="secondary" className="bg-green-100 text-green-800">
            <Check className="mr-1 h-3 w-3" />
            Approved
          </Badge>
        );
      case 'rejected':
        return (
          <Badge variant="destructive">
            <X className="mr-1 h-3 w-3" />
            Rejected
          </Badge>
        );
    }
  };

  return (
    <Card>
       <CardHeader className="flex-row items-center justify-end">
            <Button variant="ghost" size="sm" onClick={() => router.refresh()}>
                <RefreshCw className="mr-2 h-4 w-4" />
                Refresh Data
            </Button>
       </CardHeader>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Item Code</TableHead>
              <TableHead>Requested By</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {requests.map((request) => (
              <TableRow key={request.id}>
                <TableCell className="font-medium whitespace-nowrap">
                  {request.createdAt.toLocaleDateString()}
                </TableCell>
                <TableCell>{request.sourceCodice}</TableCell>
                <TableCell>{request.requesterName}</TableCell>
                <TableCell className="max-w-xs truncate">{request.description}</TableCell>
                <TableCell>{getStatusBadge(request.status)}</TableCell>
                <TableCell className="text-right">
                  {request.status === 'pending' && (
                    <div className="flex gap-2 justify-end">
                       <AlertDialog>
                          <AlertDialogTrigger asChild>
                              <Button
                                size="sm"
                                variant="outline"
                                className="text-green-600 border-green-600 hover:bg-green-50 hover:text-green-700"
                                disabled={isLoading[request.id]}
                              >
                                {isLoading[request.id] ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                              </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                              <AlertDialogHeader>
                                  <AlertDialogTitle>Approve this request?</AlertDialogTitle>
                                  <AlertDialogDescription>
                                      This will create a new 'Maintenance' event for {request.sourceCodice} and mark the request as approved.
                                  </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction onClick={() => handleUpdateStatus(request.id, 'approved')}>Approve</AlertDialogAction>
                              </AlertDialogFooter>
                          </AlertDialogContent>
                       </AlertDialog>

                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleUpdateStatus(request.id, 'rejected')}
                        disabled={isLoading[request.id]}
                      >
                         {isLoading[request.id] ? <Loader2 className="h-4 w-4 animate-spin" /> : <X className="h-4 w-4" />}
                      </Button>
                    </div>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
         {requests.length === 0 && (
          <p className="text-center text-sm text-muted-foreground py-10">No maintenance requests found.</p>
        )}
      </CardContent>
    </Card>
  );
}
