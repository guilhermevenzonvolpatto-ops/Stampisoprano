

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
import { deleteItem } from '@/app/actions/delete';
import { useRouter } from 'next/navigation';

interface DeleteButtonProps {
    itemId: string;
    itemType: 'mold' | 'component' | 'machine';
    itemName: string;
    redirectPath: string;
}

export function DeleteButton({ itemId, itemType, itemName, redirectPath }: DeleteButtonProps) {
    const { user, t } = useApp();
    const { toast } = useToast();
    const router = useRouter();


    const handleDelete = async () => {
        const result = await deleteItem(itemType, itemId);

        if (result.success) {
            toast({
                title: `${itemType.charAt(0).toUpperCase() + itemType.slice(1)} Archived`,
                description: `"${itemName}" has been successfully archived.`,
            });
            router.push(redirectPath);
            router.refresh();
        } else {
            toast({
                title: t('error'),
                description: result.error || `Could not archive the ${itemType}.`,
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
