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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { createEvent } from '@/lib/data';
import { Loader2 } from 'lucide-react';
import type { MoldEvent } from '@/lib/types';
import { useApp } from '@/context/app-context';

interface AddEventSheetProps {
  sourceId: string;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: () => void;
}

const eventSchema = z.object({
  type: z.enum(['Manutenzione', 'Lavorazione', 'Riparazione', 'Costo', 'Altro']),
  descrizione: z.string().min(1, 'Description is required.'),
  estimatedEndDate: z.string().refine((val) => !isNaN(Date.parse(val)), { message: "Invalid date format" }),
  costo: z.string().optional(),
});

export function AddEventSheet({ sourceId, isOpen, onClose, onUpdate }: AddEventSheetProps) {
  const { toast } = useToast();
  const { user } = useApp();

  const form = useForm<z.infer<typeof eventSchema>>({
    resolver: zodResolver(eventSchema),
    defaultValues: {
      type: 'Manutenzione',
      descrizione: '',
      estimatedEndDate: new Date().toISOString().split('T')[0],
      costo: '',
    },
  });

  const { isSubmitting } = form.formState;

  const handleSubmit = async (values: z.infer<typeof eventSchema>) => {
    try {
      
      const eventData: Omit<MoldEvent, 'id' | 'timestamp' | 'status' | 'customFields' | 'attachments'> = {
        sourceId,
        type: values.type,
        descrizione: values.descrizione,
        estimatedEndDate: values.estimatedEndDate,
        costo: values.costo ? parseFloat(values.costo) : null,
      };

      await createEvent(eventData);

      toast({
        title: 'Event Created',
        description: 'The new event has been added to the timeline.',
      });
      onUpdate();
      form.reset();
      onClose();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Could not create the event.',
        variant: 'destructive',
      });
    }
  };
  
   React.useEffect(() => {
    if (isOpen) {
      form.reset({
        type: 'Manutenzione',
        descrizione: '',
        estimatedEndDate: new Date().toISOString().split('T')[0],
        costo: '',
      });
    }
   }, [isOpen, form]);


  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="sm:max-w-lg overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Add New Event</SheetTitle>
          <SheetDescription>
            Record a new event for this item. Fill in the details below.
          </SheetDescription>
        </SheetHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4 py-4">
            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Event Type</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select an event type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="Manutenzione">Manutenzione</SelectItem>
                      <SelectItem value="Lavorazione">Lavorazione</SelectItem>
                      <SelectItem value="Riparazione">Riparazione</SelectItem>
                      <SelectItem value="Costo">Costo</SelectItem>
                      <SelectItem value="Altro">Altro</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="descrizione"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Describe the event..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="estimatedEndDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Estimated End Date</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
             {user?.isAdmin && (
                <FormField
                  control={form.control}
                  name="costo"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Cost (Optional)</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="0.00" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
             )}

            <SheetFooter className="pt-4">
              <SheetClose asChild>
                <Button type="button" variant="outline">Cancel</Button>
              </SheetClose>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isSubmitting ? 'Saving...' : 'Save Event'}
              </Button>
            </SheetFooter>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  );
}

    