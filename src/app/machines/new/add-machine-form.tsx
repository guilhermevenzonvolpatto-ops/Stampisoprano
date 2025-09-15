
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
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { createMachine } from '@/lib/data';
import { useRouter } from 'next/navigation';
import type { Machine } from '@/lib/types';
import { PlusCircle, Trash2 } from 'lucide-react';

const customFieldSchema = z.object({
  key: z.string().min(1, 'Field name is required.'),
  value: z.string().min(1, 'Field value is required.'),
});

const formSchema = z.object({
  codice: z.string().min(1, 'Code is required.').regex(/^\S*$/, 'Spaces are not allowed in the code.'),
  descrizione: z.string().min(1, 'Description is required.'),
  tipo: z.string().min(1, 'Type is required.'),
  purchaseCost: z.coerce.number().optional(),
  manufacturingYear: z.coerce.number().optional(),
  serialNumber: z.string().optional(),
  customFields: z.array(customFieldSchema).optional(),
});

export function AddMachineForm() {
    const { toast } = useToast();
    const router = useRouter();
    const [isSubmitting, setIsSubmitting] = React.useState(false);

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            codice: '',
            descrizione: '',
            tipo: '',
            customFields: [],
        },
    });

    const { fields, append, remove } = useFieldArray({
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

            const newMachineData: Omit<Machine, 'id' | 'stato' | 'isDeleted'> = {
                codice: values.codice,
                descrizione: values.descrizione,
                tipo: values.tipo,
                purchaseCost: values.purchaseCost,
                manufacturingYear: values.manufacturingYear,
                serialNumber: values.serialNumber,
                customFields: customFieldsObject,
            };

            const result = await createMachine(newMachineData);

            if ('error' in result) {
                 toast({
                    title: 'Error',
                    description: result.error,
                    variant: 'destructive',
                });
            } else {
                toast({
                    title: 'Machine Created',
                    description: `Machine "${values.codice}" has been successfully created.`,
                });
                router.push('/machines');
                router.refresh();
            }
        } catch (error) {
             toast({
                title: 'Error',
                description: 'An unexpected error occurred.',
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
                        <CardDescription>Enter the primary details of the new machine.</CardDescription>
                    </CardHeader>
                    <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                            control={form.control}
                            name="codice"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Machine Code</FormLabel>
                                    <FormControl>
                                        <Input placeholder="e.g., MAC-03" {...field} />
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
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Custom Fields (Optional)</CardTitle>
                        <CardDescription>Add any additional key-value data for this machine.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {fields.map((field, index) => (
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

                <div className="flex justify-end">
                     <Button type="submit" disabled={isSubmitting}>
                        <PlusCircle className="mr-2 h-4 w-4" />
                        {isSubmitting ? 'Creating...' : 'Create Machine'}
                    </Button>
                </div>
            </form>
        </Form>
    );
}
