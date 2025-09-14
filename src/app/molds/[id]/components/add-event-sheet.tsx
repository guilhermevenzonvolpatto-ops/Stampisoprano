
'use client';

import * as React from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
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
import { createEvent, getMachine } from '@/lib/data';
import { PlusCircle, Trash2, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { MoldEvent, Machine } from '@/lib/types';
import { useApp } from '@/context/app-context';

interface AddEventSheetProps {
  sourceId: string;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: () => void;
}

const customFieldSchema = z.object({
  key: z.string().min(1, 'Field name is required.'),
  value: z.string().min(1, 'Field value is required.'),
});

const eventSchema = z.object({
  type: z.enum(['Manutenzione', 'Lavorazione', 'Riparazione', 'Costo', 'Altro']),
  descrizione: z.string().min(1, 'Description is required.'),
  estimatedEndDate: z.string().refine((val) => !isNaN(Date.parse(val)), { message: "Invalid date format" }),
  costo: z.string().optional(),
  customFields: z.array(customFieldSchema).optional(),
  programmedMaintenanceTaskId: z.string().optional(),
});

export function AddEventSheet({ sourceId, isOpen, onClose, onUpdate }: AddEventSheetProps) {
  const { toast } = useToast();
  const { user } = useApp();
  const [machine, setMachine] = React.useState<Machine | null>(null);

  const form = useForm<z.infer<typeof eventSchema>>({
    resolver: zodResolver(eventSchema),
    defaultValues: {
      type: 'Manutenzione',
      descrizione: '',
      estimatedEndDate: '',
      costo: '',
      customFields: [],
      programmedMaintenanceTaskId: '__none__',
    },
  });

  const eventType = form.watch('type');

  React.useEffect(() => {
    async function fetchMachine() {
      if (isOpen && sourceId.startsWith('MAC')) {
        const machineData = await getMachine(sourceId);
        setMachine(machineData);
      } else {
        setMachine(null);
      }
    }
    fetchMachine();
  }, [isOpen, sourceId]);

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'customFields',
  });

  const { isSubmitting } = form.formState;

  const handleSubmit = async (values: z.infer<typeof eventSchema>) => {
    try {
      const customFieldsObject = values.customFields?.reduce((acc, { key, value }) => {
        acc[key] = value;
        return acc;
      }, {} as Record<string, string>);

      const eventData: Omit<MoldEvent, 'id' | 'timestamp' | 'status'> = {
        sourceId,
        type: values.type,
        descrizione: values.descrizione,
        estimatedEndDate: values.estimatedEndDate,
        costo: values.costo ? parseFloat(values.costo) : null,
        customFields: customFieldsObject,
        programmedMaintenanceTaskId: values.programmedMaintenanceTaskId === '__none__' ? undefined : values.programmedMaintenanceTaskId,
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
      form.reset();
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
            {eventType === 'Manutenzione' && machine && machine.maintenanceSchedules && machine.maintenanceSchedules.length > 0 && (
                 <FormField
                    control={form.control}
                    name="programmedMaintenanceTaskId"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Programmed Maintenance Task (Optional)</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                <SelectTrigger>
                                    <SelectValue placeholder="Link to a programmed task..." />
                                </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                    <SelectItem value="__none__">None</SelectItem>
                                    {machine.maintenanceSchedules?.map(task => (
                                        <SelectItem key={task.id} value={task.id}>{task.description}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <FormMessage />
                        </FormItem>
                    )}
                />
            )}
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

            <Card className="pt-4">
                <CardHeader className="p-0 px-6 pb-4">
                    <CardTitle className="text-base">Custom Fields (Optional)</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 p-6 pt-0">
                    {fields.map((field, index) => (
                    <div key={field.id} className="flex items-end gap-2">
                        <FormField
                        control={form.control}
                        name={`customFields.${index}.key`}
                        render={({ field }) => (
                            <FormItem className="flex-1">
                            <FormLabel className={index !== 0 ? "sr-only" : ""}>Field Name</FormLabel>
                            <FormControl>
                                <Input placeholder="e.g., Operator" {...field} />
                            </FormControl>
                            <FormMessage />
                            </FormItem>
                        )}
                        />
                        <FormField
                        control={form.control}
                        name={`customFields.${index}.value`}
                        render={({ field }) => (
                            <FormItem className="flex-1">
                            <FormLabel className={index !== 0 ? "sr-only" : ""}>Value</FormLabel>
                            <FormControl>
                                <Input placeholder="e.g., John Doe" {...field} />
                            </FormControl>
                            <FormMessage />
                            </FormItem>
                        )}
                        />
                        <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => remove(index)}
                        >
                        <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                    </div>
                    ))}
                    <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => append({ key: '', value: '' })}
                    >
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Add Field
                    </Button>
                </CardContent>
            </Card>

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
