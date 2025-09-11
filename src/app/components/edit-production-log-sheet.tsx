
'use client';

import * as React from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
  SheetClose
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import type { ProductionLog } from '@/lib/types';
import { updateProductionLog } from '@/lib/data';
import { Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface EditProductionLogSheetProps {
  log: ProductionLog;
  isOpen: boolean;
  onClose: () => void;
}

const formSchema = z.object({
  good: z.coerce.number().min(0, 'Must be a non-negative number.'),
  scrapped: z.coerce.number().min(0, 'Must be a non-negative number.'),
  scrapReason: z.string().optional(),
});

export function EditProductionLogSheet({ log, isOpen, onClose }: EditProductionLogSheetProps) {
  const { toast } = useToast();
  const router = useRouter();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      good: log.good,
      scrapped: log.scrapped,
      scrapReason: log.scrapReason,
    },
  });

  const { isSubmitting } = form.formState;

  const handleSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      await updateProductionLog(log.id, {
        good: values.good,
        scrapped: values.scrapped,
        scrapReason: values.scrapReason,
      });
      toast({
        title: 'Log Updated',
        description: 'The production log has been successfully updated.',
      });
      router.refresh();
      onClose();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Could not update the production log.',
        variant: 'destructive',
      });
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="sm:max-w-lg">
        <SheetHeader>
          <SheetTitle>Edit Production Log</SheetTitle>
          <SheetDescription>
            Modify the production numbers for this entry. The total cycle count for the component will be adjusted accordingly.
          </SheetDescription>
        </SheetHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="good"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Good Pieces</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="scrapped"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Scrapped Pieces</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="scrapReason"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Scrap Reason</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Enter a reason for scrapped parts..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <SheetFooter>
                <SheetClose asChild>
                    <Button type="button" variant="outline">Cancel</Button>
                </SheetClose>
                <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {isSubmitting ? 'Saving...' : 'Save Changes'}
                </Button>
            </SheetFooter>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  );
}
