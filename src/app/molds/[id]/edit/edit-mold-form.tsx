
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
import { updateMold } from '@/lib/data';
import { useRouter } from 'next/navigation';
import type { Mold } from '@/lib/types';
import { PlusCircle, Trash2, Save } from 'lucide-react';
import { useApp } from '@/context/app-context';

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
  stato: z.enum(['Operativo', 'In Manutenzione', 'Lavorazione', 'Fermo']),
  macchinaAssociata: z.string().optional(),
  impronte: z.coerce.number().optional(),
  materialeCostruzione: z.string().optional(),
  dimensioniPeso: z.string().optional(),
  costoAcquisto: z.coerce.number().optional(),
  vitaUtileStimata: z.coerce.number().optional(),
  customFields: z.array(customFieldSchema).optional(),
});

interface EditMoldFormProps {
    mold: Mold;
    allMolds: Mold[];
}

export function EditMoldForm({ mold, allMolds }: EditMoldFormProps) {
    const { toast } = useToast();
    const router = useRouter();
    const { user } = useApp();
    const [isSubmitting, setIsSubmitting] = React.useState(false);

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            codice: mold.codice,
            descrizione: mold.descrizione,
            padre: mold.padre || '__none__',
            posizioneType: mold.posizione.type,
            posizioneValue: mold.posizione.value,
            stato: mold.stato,
            macchinaAssociata: mold.macchinaAssociata || '__none__',
            impronte: mold.datiTecnici?.impronte || undefined,
            materialeCostruzione: mold.datiTecnici?.materialeCostruzione || '',
            dimensioniPeso: mold.datiTecnici?.dimensioniPeso || '',
            costoAcquisto: mold.datiGestionali?.costoAcquisto || undefined,
            vitaUtileStimata: mold.datiGestionali?.vitaUtileStimata || undefined,
            customFields: Object.entries(mold.customFields || {}).map(([key, value]) => ({ key, value: String(value) })),
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

            const updateData: Partial<Mold> = {
              descrizione: values.descrizione,
              stato: values.stato,
              padre: values.padre === '__none__' ? null : values.padre,
              macchinaAssociata: values.macchinaAssociata === '__none__' ? null : values.macchinaAssociata,
              posizione: {
                type: values.posizioneType,
                value: values.posizioneValue,
              },
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

            await updateMold(mold.id, updateData);
            
            toast({
                title: 'Mold Updated',
                description: `Mold "${values.codice}" has been successfully updated.`,
            });
            router.push(`/molds/${mold.id}`);
            router.refresh();

        } catch (error) {
             toast({
                title: 'Error',
                description: 'An unexpected error occurred while updating the mold.',
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
                                        <FormLabel>Mold Code</FormLabel>
                                        <FormControl>
                                            <Input placeholder="e.g., ST-005" {...field} disabled />
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
                                    <Select onValueChange={field.onChange} defaultValue={field.value || '__none__'}>
                                        <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select a parent mold if this is a sub-mold" />
                                        </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                             <SelectItem value="__none__">No Parent</SelectItem>
                                            {allMolds.filter(m => !m.padre).map(parentMold => (
                                                <SelectItem key={parentMold.id} value={parentMold.id}>{parentMold.codice} - {parentMold.descrizione}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
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
                                            <SelectItem value="Lavorazione">Lavorazione</SelectItem>
                                            <SelectItem value="Fermo">Fermo</SelectItem>
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
                        {user?.isAdmin && (
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
                        )}
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
                        <Save className="mr-2 h-4 w-4" />
                        {isSubmitting ? 'Saving...' : 'Save Changes'}
                    </Button>
                </div>
            </form>
        </Form>
    );
}
