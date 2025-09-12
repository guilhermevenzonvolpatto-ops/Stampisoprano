
'use client';

import * as React from 'react';
import { useForm } from 'react-hook-form';
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
import { updateComponent, createStampingHistoryEntry } from '@/lib/data';
import { useRouter } from 'next/navigation';
import type { Component, Mold, StampingData } from '@/lib/types';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Checkbox } from '@/components/ui/checkbox';
import { Save } from 'lucide-react';
import { useApp } from '@/context/app-context';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const formSchema = z.object({
  descrizione: z.string().min(1, 'Description is required.'),
  materiale: z.string().min(1, 'Material is required.'),
  peso: z.coerce.number().positive('Weight must be a positive number.'),
  stato: z.enum(['Attivo', 'In modifica', 'Obsoleto']),
  associatedMolds: z.array(z.string()).optional(),
  // Stamping Data
  programName: z.string().optional(),
  cycleTime: z.coerce.number().optional(),
  injectionTime: z.coerce.number().optional(),
  holdingPressure: z.coerce.number().optional(),
  meltTemperature: z.coerce.number().optional(),
  moldTemperature: z.coerce.number().optional(),
  clampForce: z.coerce.number().optional(),
  injectionPressure: z.coerce.number().optional(),
  postPressure: z.coerce.number().optional(),
  maintenanceTime: z.coerce.number().optional(),
  coolingTime: z.coerce.number().optional(),
  counterPressure: z.coerce.number().optional(),
  injectionSpeed: z.coerce.number().optional(),
});

interface EditComponentFormProps {
  component: Component;
  allMolds: Mold[];
}

export function EditComponentForm({ component, allMolds }: EditComponentFormProps) {
  const { toast } = useToast();
  const router = useRouter();
  const { user } = useApp();
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      descrizione: component.descrizione,
      materiale: component.materiale,
      peso: component.peso,
      stato: component.stato,
      associatedMolds: component.associatedMolds || [],
      programName: component.stampingData?.programName || undefined,
      cycleTime: component.stampingData?.cycleTime || undefined,
      injectionTime: component.stampingData?.injectionTime || undefined,
      holdingPressure: component.stampingData?.holdingPressure || undefined,
      meltTemperature: component.stampingData?.meltTemperature || undefined,
      moldTemperature: component.stampingData?.moldTemperature || undefined,
      clampForce: component.stampingData?.clampForce || undefined,
      injectionPressure: component.stampingData?.injectionPressure || undefined,
      postPressure: component.stampingData?.postPressure || undefined,
      maintenanceTime: component.stampingData?.maintenanceTime || undefined,
      coolingTime: component.stampingData?.coolingTime || undefined,
      counterPressure: component.stampingData?.counterPressure || undefined,
      injectionSpeed: component.stampingData?.injectionSpeed || undefined,
    },
  });

  const isUserAdmin = user?.isAdmin === true;

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true);
    if (!user) return;

    try {
        const stampingData: StampingData = {
            programName: values.programName || '',
            cycleTime: values.cycleTime ?? 0,
            injectionTime: values.injectionTime ?? 0,
            holdingPressure: values.holdingPressure ?? 0,
            meltTemperature: values.meltTemperature ?? 0,
            moldTemperature: values.moldTemperature ?? 0,
            clampForce: values.clampForce ?? 0,
            injectionPressure: values.injectionPressure ?? 0,
            postPressure: values.postPressure ?? 0,
            maintenanceTime: values.maintenanceTime ?? 0,
            coolingTime: values.coolingTime ?? 0,
            counterPressure: values.counterPressure ?? 0,
            injectionSpeed: values.injectionSpeed ?? 0,
        };

        const componentData: Partial<Component> = {
            stampingData: stampingData,
        };

        if (isUserAdmin) {
            componentData.descrizione = values.descrizione;
            componentData.materiale = values.materiale;
            componentData.peso = values.peso;
            componentData.stato = values.stato;
            componentData.associatedMolds = values.associatedMolds;
        }
        
        // Log stamping data changes
        const originalStampingData = component.stampingData || {};
        const changedData: Partial<StampingData> = {};

        for (const key in stampingData) {
            const K = key as keyof StampingData;
            if (originalStampingData[K] !== stampingData[K]) {
                (changedData as any)[K] = stampingData[K];
            }
        }
        if (Object.keys(changedData).length > 0 && user.id) {
            await createStampingHistoryEntry(component.id, user.id, changedData);
        }

        await updateComponent(component.id, componentData);

        toast({
            title: 'Component Updated',
            description: `Component "${component.codice}" has been successfully updated.`,
        });
        router.push(`/components/${component.id}`);
        router.refresh();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'An unexpected error occurred while updating the component.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {isUserAdmin && (
            <Card>
            <CardHeader>
                <CardTitle>Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormItem>
                    <FormLabel>Component Code</FormLabel>
                    <FormControl>
                        <Input value={component.codice} disabled />
                    </FormControl>
                </FormItem>
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
                            <Input type="number" placeholder="e.g., 85.5" {...field} />
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
                                    <SelectItem value="Attivo">Attivo</SelectItem>
                                    <SelectItem value="In modifica">In modifica</SelectItem>
                                    <SelectItem value="Obsoleto">Obsoleto</SelectItem>
                                </SelectContent>
                            </Select>
                            <FormMessage />
                        </FormItem>
                    )}
                />
            </CardContent>
            </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Stamping Data</CardTitle>
            <CardDescription>
              {isUserAdmin ? 'Provide the injection process parameters for this component.' : 'Update the injection process parameters.'}
            </CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <FormField control={form.control} name="programName" render={({ field }) => (<FormItem><FormLabel>Program Name</FormLabel><FormControl><Input placeholder="e.g., PROG-123" {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem>)} />
            <FormField control={form.control} name="cycleTime" render={({ field }) => (<FormItem><FormLabel>Cycle Time (s)</FormLabel><FormControl><Input type="number" placeholder="e.g., 22.5" {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem>)} />
            <FormField control={form.control} name="injectionTime" render={({ field }) => (<FormItem><FormLabel>Injection Time (s)</FormLabel><FormControl><Input type="number" placeholder="e.g., 2.5" {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem>)} />
            <FormField control={form.control} name="holdingPressure" render={({ field }) => (<FormItem><FormLabel>Holding Pressure (bar)</FormLabel><FormControl><Input type="number" placeholder="e.g., 600" {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem>)} />
            <FormField control={form.control} name="meltTemperature" render={({ field }) => (<FormItem><FormLabel>Melt Temperature (°C)</FormLabel><FormControl><Input type="number" placeholder="e.g., 280" {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem>)} />
            <FormField control={form.control} name="moldTemperature" render={({ field }) => (<FormItem><FormLabel>Mold Temperature (°C)</FormLabel><FormControl><Input type="number" placeholder="e.g., 80" {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem>)} />
            <FormField control={form.control} name="clampForce" render={({ field }) => (<FormItem><FormLabel>Clamp Force (t)</FormLabel><FormControl><Input type="number" placeholder="e.g., 200" {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem>)} />
            <FormField control={form.control} name="injectionPressure" render={({ field }) => (<FormItem><FormLabel>Injection Pressure (bar)</FormLabel><FormControl><Input type="number" placeholder="e.g., 1200" {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem>)} />
            <FormField control={form.control} name="postPressure" render={({ field }) => (<FormItem><FormLabel>Post Pressure (bar)</FormLabel><FormControl><Input type="number" placeholder="e.g., 450" {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem>)} />
            <FormField control={form.control} name="maintenanceTime" render={({ field }) => (<FormItem><FormLabel>Maintenance Time (s)</FormLabel><FormControl><Input type="number" placeholder="e.g., 3600" {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem>)} />
            <FormField control={form.control} name="coolingTime" render={({ field }) => (<FormItem><FormLabel>Cooling Time (s)</FormLabel><FormControl><Input type="number" placeholder="e.g., 15" {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem>)} />
            <FormField control={form.control} name="counterPressure" render={({ field }) => (<FormItem><FormLabel>Counter Pressure (bar)</FormLabel><FormControl><Input type="number" placeholder="e.g., 50" {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem>)} />
            <FormField control={form.control} name="injectionSpeed" render={({ field }) => (<FormItem><FormLabel>Injection Speed (mm/s)</FormLabel><FormControl><Input type="number" placeholder="e.g., 150" {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem>)} />
          </CardContent>
        </Card>

        {isUserAdmin && (
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
        )}

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

    