
'use client';

import * as React from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { updateMachine } from '@/lib/data';
import { useRouter } from 'next/navigation';
import type { Machine } from '@/lib/types';
import { PlusCircle, Trash2, Save } from 'lucide-react';

const customFieldSchema = z.object({
  key: z.string().min(1, 'Field name is required.'),
  value: z.string().min(1, 'Field value is required.'),
});

const formSchema = z.object({
  codice: z.string().min(1, 'Code is required.'),
  descrizione: z.string().min(1, 'Description is required.'),
  tipo: z.string().min(1, 'Type is required.'),
  stato: z.enum(['Operativo', 'In Manutenzione', 'Fermo']),
  purchaseCost: z.coerce.number().optional(),
  manufacturingYear: z.coerce.number().optional(),
  serialNumber: z.string().optional(),
  customFields: z.array(customFieldSchema).optional(),
});

interface EditMachineFormProps {
    machine: Machine;
}

export function EditMachineForm({ machine }: EditMachineFormProps) {
    const { toast } = useToast();
    const router = useRouter();
    const [isSubmitting, setIsSubmitting] = React.useState(false);

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            codice: machine.codice,
            descrizione: machine.descrizione,
            tipo: machine.tipo,
            stato: machine.stato,
            purchaseCost: machine.purchaseCost,
            manufacturingYear: machine.manufacturingYear,
            serialNumber: machine.serialNumber,
            customFields: Object.entries(machine.customFields || {}).map(([key, value]) => ({ key, value: String(value) })),
        },
    });

    const { fields: customFields, append: appendCustomField, remove: removeCustomField } = useFieldArray({
      control: form.control,
      name: "customFields",
    });

    async function onSubmit(values: z.infer<typeof formSchema>) {
        setIsSubmitting(true);
        try {
            const customFieldsObject = values.customFields?.reduce((acc, { key, value }) => {
                acc[key] = value;
                return acc;
            }, {} as Record<string, string>);
            
            const updateData: Partial<Machine> = {
              descrizione: values.descrizione,
              tipo: values.tipo,
              stato: values.stato,
              purchaseCost: values.purchaseCost,
              manufacturingYear: values.manufacturingYear,
              serialNumber: values.serialNumber,
              customFields: customFieldsObject,
            };

            await updateMachine(machine.id, updateData);
            
            toast({
                title: 'Machine Updated',
                description: `Machine "${values.codice}" has been successfully updated.`,
            });
            router.push(`/machines/${machine.id}`);
            router.refresh();

        } catch (error) {
             toast({
                title: 'Error',
                description: 'An unexpected error occurred while updating the machine.',
                variant: 'destructive',
            });
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Basic Information</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="codice"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Machine Code</FormLabel>
                                        <FormControl>
                                            <Input placeholder="e.g., MAC-03" {...field} disabled />
                                        </FormControl>
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
                                            <Input placeholder="e.g., 5-Axis CNC Mill" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                             <FormField
                                control={form.control}
                                name="tipo"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Type</FormLabel>
                                        <FormControl>
                                            <Input placeholder="e.g., CNC" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                             <FormField
                                control={form.control}
                                name="stato"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Status</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select a status" />
                                            </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="Operativo">Operativo</SelectItem>
                                                <SelectItem value="In Manutenzione">In Manutenzione</SelectItem>
                                                <SelectItem value="Fermo">Fermo</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                             <FormField
                                control={form.control}
                                name="serialNumber"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Serial Number</FormLabel>
                                        <FormControl>
                                            <Input placeholder="e.g., SN-123456" {...field} value={field.value ?? ''} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                             <FormField
                                control={form.control}
                                name="manufacturingYear"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Manufacturing Year</FormLabel>
                                        <FormControl>
                                            <Input type="number" placeholder="e.g., 2022" {...field} value={field.value ?? ''} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="purchaseCost"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Purchase Cost (€)</FormLabel>
                                        <FormControl>
                                            <Input type="number" placeholder="e.g., 150000" {...field} value={field.value ?? ''} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                    </CardContent>
                </Card>
                
                 <Card>
                    <CardHeader>
                        <CardTitle>Custom Fields</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {customFields.map((field, index) => (
                          <div key={field.id} className="flex items-end gap-2">
                              <FormField
                              control={form.control}
                              name={`customFields.${index}.key`}
                              render={({ field }) => (
                                  <FormItem className="flex-1">
                                  <FormLabel className={index !== 0 ? "sr-only" : ""}>Field Name</FormLabel>
                                  <FormControl>
                                      <Input placeholder="e.g., Serial Number" {...field} />
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
                                      <Input placeholder="e.g., SN-12345" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                  </FormItem>
                              )}
                              />
                              <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              onClick={() => removeCustomField(index)}
                              >
                              <Trash2 className="h-4 w-4 text-destructive" />
                              </Button>
                          </div>
                      ))}
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => appendCustomField({ key: '', value: '' })}
                      >
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Add Field
                      </Button>
                    </CardContent>
                </Card>

                <div className="flex justify-end">
                     <Button type="submit" disabled={isSubmitting}>
                        <Save className="mr-2 h-4 w-4" />
                        {isSubmitting ? 'Saving...' : 'Save Changes'}
                    </Button>
                </div>
            </form>
        </Form>
    );
}
