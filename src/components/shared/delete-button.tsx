
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
    const { user, t } = useApp();
    const { toast } = useToast();
    const router = useRouter();

    const handleDelete = async () => {
        try {
            const deleteAction = itemType === 'mold' ? deleteMold : deleteComponent;
            await deleteAction(itemId);
            
            toast({
                title: `${itemType.charAt(0).toUpperCase() + itemType.slice(1)} Archived`,
                description: `"${itemName}" has been successfully archived.`,
            });
            router.push(redirectPath);
            router.refresh();
        } catch (error) {
            toast({
                title: t('error'),
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
                    {t('delete')}
                </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>{t('areYouSure')}</AlertDialogTitle>
                    <AlertDialogDescription>
                        {t('archiveWarning').replace('{itemType}', itemType)}
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>{t('cancel')}</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDelete}>{t('archive')}</AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}
