

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
import { createComponent } from '@/lib/data';
import { useRouter } from 'next/navigation';
import type { Mold, Component, StampingData } from '@/lib/types';
import { PlusCircle, Trash2 } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';

const customFieldSchema = z.object({
  key: z.string().min(1, 'Field name is required.'),
  value: z.string().min(1, 'Field value is required.'),
});

const formSchema = z.object({
  codice: z.string().min(1, 'Code is required.').regex(/^\S*$/, 'Spaces are not allowed in the code.'),
  descrizione: z.string().min(1, 'Description is required.'),
  materiale: z.string().min(1, 'Material is required.'),
  peso: z.coerce.number().positive('Weight must be a positive number.'),
  dataRilascio: z.string().optional(),
  associatedMolds: z.array(z.string()).optional(),
  customFields: z.array(customFieldSchema).optional(),
  injectionTime: z.coerce.number().optional(),
  holdingPressure: z.coerce.number().optional(),
  meltTemperature: z.coerce.number().optional(),
  clampForce: z.coerce.number().optional(),
});

interface AddComponentFormProps {
  allMolds: Mold[];
}

export function AddComponentForm({ allMolds }: AddComponentFormProps) {
  const { toast } = useToast();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      codice: '',
      descrizione: '',
      materiale: '',
      peso: undefined,
      dataRilascio: '',
      associatedMolds: [],
      customFields: [],
      injectionTime: undefined,
      holdingPressure: undefined,
      meltTemperature: undefined,
      clampForce: undefined,
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
      
      const stampingData: StampingData = {
        injectionTime: values.injectionTime,
        holdingPressure: values.holdingPressure,
        meltTemperature: values.meltTemperature,
        clampForce: values.clampForce,
      }

      const newComponentData: Omit<Component, 'id' | 'stato' | 'cicliTotali' | 'isDeleted'> = {
        codice: values.codice,
        descrizione: values.descrizione,
        materiale: values.materiale,
        peso: values.peso,
        dataRilascio: values.dataRilascio,
        associatedMolds: values.associatedMolds || [],
        customFields: customFieldsObject,
        stampingData: stampingData,
    };

      const result = await createComponent(newComponentData);

      if ('error' in result) {
        toast({
          title: 'Error',
          description: result.error,
          variant: 'destructive',
        });
      } else {
        toast({
          title: 'Component Created',
          description: `Component "${values.codice}" has been successfully created.`,
        });
        router.push('/components');
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
            <CardDescription>Enter the primary details of the new component.</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="codice"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Component Code</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., COMP-D4" {...field} />
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
                    <Input placeholder="e.g., Transparent Cover" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="materiale"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Material</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., PC" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="peso"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Weight (grams)</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="e.g., 85.5" {...field} value={field.value ?? ''} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
             <FormField
              control={form.control}
              name="dataRilascio"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Release Date</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} value={field.value ?? ''} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Stamping Data (Optional)</CardTitle>
            <CardDescription>Provide the injection process parameters for this component.</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="injectionTime"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Injection Time (s)</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="e.g., 2.5" {...field} value={field.value ?? ''} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="holdingPressure"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Holding Pressure (bar)</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="e.g., 600" {...field} value={field.value ?? ''} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="meltTemperature"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Melt Temperature (°C)</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="e.g., 280" {...field} value={field.value ?? ''} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="clampForce"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Clamp Force (t)</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="e.g., 200" {...field} value={field.value ?? ''} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Associated Molds</CardTitle>
            <CardDescription>Select which molds can produce this component.</CardDescription>
          </CardHeader>
          <CardContent>
             <FormField
              control={form.control}
              name="associatedMolds"
              render={() => (
                <FormItem>
                  <ScrollArea className="h-40 rounded-md border p-4">
                  {allMolds.map((mold) => (
                    <FormField
                      key={mold.id}
                      control={form.control}
                      name="associatedMolds"
                      render={({ field }) => {
                        return (
                          <FormItem
                            key={mold.id}
                            className="flex flex-row items-start space-x-3 space-y-0 mb-3"
                          >
                            <FormControl>
                              <Checkbox
                                checked={field.value?.includes(mold.id)}
                                onCheckedChange={(checked) => {
                                  return checked
                                    ? field.onChange([...(field.value || []), mold.id])
                                    : field.onChange(
                                        field.value?.filter(
                                          (value) => value !== mold.id
                                        )
                                      )
                                }}
                              />
                            </FormControl>
                            <FormLabel className="font-normal w-full cursor-pointer">
                                <span className="font-medium">{mold.codice}</span>
                                <span className="text-muted-foreground text-xs block">{mold.descrizione}</span>
                            </FormLabel>
                          </FormItem>
                        )
                      }}
                    />
                  ))}
                  </ScrollArea>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Custom Fields (Optional)</CardTitle>
            <CardDescription>Add any additional key-value data for this component.</CardDescription>
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
                        <Input placeholder="e.g., Color" {...field} />
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
                        <Input placeholder="e.g., Red" {...field} />
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
            {isSubmitting ? 'Creating...' : 'Create Component'}
          </Button>
        </div>
      </form>
    </Form>
  );
}

    
