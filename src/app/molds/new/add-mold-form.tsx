
'use client';

import * as React from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { createMold } from '@/lib/data';
import { useRouter } from 'next/navigation';
import type { Mold } from '@/lib/types';
import { PlusCircle, Trash2 } from 'lucide-react';

const customFieldSchema = z.object({
  key: z.string().min(1, 'Field name is required.'),
  value: z.string().min(1, 'Field value is required.'),
});

const formSchema = z.object({
  codice: z.string().min(1, 'Code is required.'),
  descrizione: z.string().min(1, 'Description is required.'),
  padre: z.string().optional(),
  posizioneType: z.enum(['interna', 'esterna']),
  posizioneValue: z.string().min(1, 'Location/Supplier is required.'),
  macchinaAssociata: z.string().optional(),
  impronte: z.coerce.number().optional(),
  materialeCostruzione: z.string().optional(),
  dimensioniPeso: z.string().optional(),
  costoAcquisto: z.coerce.number().optional(),
  vitaUtileStimata: z.coerce.number().optional(),
  customFields: z.array(customFieldSchema).optional(),
});

interface AddMoldFormProps {
    allMolds: Mold[];
}

export function AddMoldForm({ allMolds }: AddMoldFormProps) {
    const { toast } = useToast();
    const router = useRouter();
    const [isSubmitting, setIsSubmitting] = React.useState(false);

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            codice: '',
            descrizione: '',
            padre: '',
            posizioneType: 'interna',
            posizioneValue: '',
            macchinaAssociata: '',
            impronte: undefined,
            materialeCostruzione: '',
            dimensioniPeso: '',
            costoAcquisto: undefined,
            vitaUtileStimata: undefined,
            customFields: [],
        },
    });
    
    const positionType = form.watch('posizioneType');

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

            const newMoldData: Omit<Mold, 'id' | 'data' | 'stato' | 'isDeleted'> = {
                codice: values.codice,
                descrizione: values.descrizione,
                padre: values.padre || null,
                posizione: {
                    type: values.posizioneType,
                    value: values.posizioneValue,
                },
                macchinaAssociata: values.macchinaAssociata,
                datiTecnici: {
                    impronte: values.impronte,
                    materialeCostruzione: values.materialeCostruzione,
                    dimensioniPeso: values.dimensioniPeso,
                },
                datiGestionali: {
                    costoAcquisto: values.costoAcquisto,
                    vitaUtileStimata: values.vitaUtileStimata,
                },
                customFields: customFieldsObject,
            };

            const result = await createMold(newMoldData);

            if ('error' in result) {
                 toast({
                    title: 'Error',
                    description: result.error,
                    variant: 'destructive',
                });
            } else {
                toast({
                    title: 'Mold Created',
                    description: `Mold "${values.codice}" has been successfully created.`,
                });
                router.push('/molds');
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
                        <CardDescription>Enter the primary details of the new mold.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="codice"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Mold Code</FormLabel>
                                        <FormControl>
                                            <Input placeholder="e.g., ST-005" {...field} />
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
                                            <Input placeholder="e.g., Main Body Mold" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                         <FormField
                            control={form.control}
                            name="padre"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Parent Mold (Optional)</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select a parent mold if this is a sub-mold" />
                                        </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {allMolds.filter(m => !m.padre).map(mold => (
                                                <SelectItem key={mold.id} value={mold.id}>{mold.codice} - {mold.descrizione}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </CardContent>
                </Card>

                 <Card>
                    <CardHeader>
                        <CardTitle>Position</CardTitle>
                        <CardDescription>Specify where the mold is currently located.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                         <FormField
                            control={form.control}
                            name="posizioneType"
                            render={({ field }) => (
                                <FormItem className="space-y-3">
                                <FormLabel>Position Type</FormLabel>
                                <FormControl>
                                    <RadioGroup
                                    onValueChange={field.onChange}
                                    defaultValue={field.value}
                                    className="flex items-center space-x-4"
                                    >
                                    <FormItem className="flex items-center space-x-2 space-y-0">
                                        <FormControl>
                                        <RadioGroupItem value="interna" />
                                        </FormControl>
                                        <FormLabel className="font-normal">Internal</FormLabel>
                                    </FormItem>
                                    <FormItem className="flex items-center space-x-2 space-y-0">
                                        <FormControl>
                                        <RadioGroupItem value="esterna" />
                                        </FormControl>
                                        <FormLabel className="font-normal">External (Supplier)</FormLabel>
                                    </FormItem>
                                    </RadioGroup>
                                </FormControl>
                                <FormMessage />
                                </FormItem>
                            )}
                        />
                         <FormField
                            control={form.control}
                            name="posizioneValue"
                            render={({ field }) => (
                                <FormItem>
                                <FormLabel>{positionType === 'interna' ? 'Location' : 'Supplier Name'}</FormLabel>
                                <FormControl>
                                    <Input placeholder={positionType === 'interna' ? 'e.g., Shelf A-1' : 'e.g., Rossi & Figli S.p.A.'} {...field} />
                                </FormControl>
                                <FormMessage />
                                </FormItem>
                            )}
                        />
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Technical & Management Data (Optional)</CardTitle>
                        <CardDescription>Provide technical and management specifications for the mold.</CardDescription>
                    </CardHeader>
                    <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                            control={form.control}
                            name="impronte"
                            render={({ field }) => (
                                <FormItem>
                                <FormLabel>Impressions</FormLabel>
                                <FormControl>
                                    <Input type="number" placeholder="e.g., 4" {...field} />
                                </FormControl>
                                <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="materialeCostruzione"
                            render={({ field }) => (
                                <FormItem>
                                <FormLabel>Construction Material</FormLabel>
                                <FormControl>
                                    <Input placeholder="e.g., Steel 1.2343" {...field} />
                                </FormControl>
                                <FormMessage />
                                </FormItem>
                            )}
                        />
                         <FormField
                            control={form.control}
                            name="dimensioniPeso"
                            render={({ field }) => (
                                <FormItem>
                                <FormLabel>Dimensions & Weight</FormLabel>
                                <FormControl>
                                    <Input placeholder="e.g., 80x60x50cm - 800kg" {...field} />
                                </FormControl>
                                <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="costoAcquisto"
                            render={({ field }) => (
                                <FormItem>
                                <FormLabel>Purchase Cost (€)</FormLabel>
                                <FormControl>
                                    <Input type="number" placeholder="e.g., 50000" {...field} />
                                </FormControl>
                                <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="vitaUtileStimata"
                            render={({ field }) => (
                                <FormItem>
                                <FormLabel>Expected Lifetime (cycles)</FormLabel>
                                <FormControl>
                                    <Input type="number" placeholder="e.g., 1000000" {...field} />
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
                        <CardDescription>Add any additional key-value data for this mold.</CardDescription>
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
                                      <Input placeholder="e.g., Project Code" {...field} />
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
                                      <Input placeholder="e.g., P-12345" {...field} />
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
                        {isSubmitting ? 'Creating...' : 'Create Mold'}
                    </Button>
                </div>
            </form>
        </Form>
    );
}

    