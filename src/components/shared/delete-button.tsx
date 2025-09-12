
'use client';

import * as React from 'react';
import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';
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
import { useApp } from '@/context/app-context';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { deleteMold, deleteComponent } from '@/lib/data';

interface DeleteButtonProps {
    itemId: string;
    itemType: 'mold' | 'component';
    itemName: string;
    redirectPath: string;
}

export function DeleteButton({ itemId, itemType, itemName, redirectPath }: DeleteButtonProps) {
    const { user } = useApp();
    const { toast } = useToast();
    const router = useRouter();

    const handleDelete = async () => {
        try {
            if (itemType === 'mold') {
                await deleteMold(itemId);
            } else {
                await deleteComponent(itemId);
            }
            toast({
                title: `${itemType.charAt(0).toUpperCase() + itemType.slice(1)} Archived`,
                description: `"${itemName}" has been successfully archived.`,
            });
            router.push(redirectPath);
            router.refresh();
        } catch (error) {
            toast({
                title: 'Error',
                description: `Could not archive the ${itemType}.`,
                variant: 'destructive',
            });
        }
    };

    if (!user?.isAdmin) {
        return null;
    }

    return (
        <AlertDialog>
            <AlertDialogTrigger asChild>
                <Button variant="destructive" size="sm">
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete
                </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                        This action will archive the {itemType} "{itemName}". It will be hidden from view but not permanently deleted.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDelete}>Confirm</AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}
