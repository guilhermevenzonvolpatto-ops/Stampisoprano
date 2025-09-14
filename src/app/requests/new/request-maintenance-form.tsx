
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { createMaintenanceRequest } from '@/lib/data';
import { useRouter } from 'next/navigation';
import type { Mold, Machine } from '@/lib/types';
import { Loader2, Send } from 'lucide-react';
import { useApp } from '@/context/app-context';
import { Textarea } from '@/components/ui/textarea';

const formSchema = z.object({
  sourceType: z.enum(['mold', 'machine'], { required_error: 'You must select a request type.' }),
  sourceId: z.string().min(1, 'You must select an item.'),
  description: z.string().min(10, 'Description must be at least 10 characters.'),
});

interface RequestMaintenanceFormProps {
  allMolds: Mold[];
  allMachines: Machine[];
}

export function RequestMaintenanceForm({ allMolds, allMachines }: RequestMaintenanceFormProps) {
  const { toast } = useToast();
  const router = useRouter();
  const { user } = useApp();
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      sourceId: '',
      description: '',
    },
  });

  const sourceType = form.watch('sourceType');

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!user) return;
    setIsSubmitting(true);
    try {
      const sourceItem =
        values.sourceType === 'mold'
          ? allMolds.find((m) => m.id === values.sourceId)
          : allMachines.find((m) => m.id === values.sourceId);

      if (!sourceItem) {
        toast({ title: 'Error', description: 'Selected item not found.', variant: 'destructive' });
        setIsSubmitting(false);
        return;
      }
      
      const result = await createMaintenanceRequest({
        sourceId: values.sourceId,
        sourceCodice: sourceItem.codice,
        sourceType: values.sourceType,
        description: values.description,
        requesterId: user.id,
        requesterName: user.name,
      });

      if ('error' in result) {
        toast({
          title: 'Error',
          description: result.error,
          variant: 'destructive',
        });
      } else {
        toast({
          title: 'Request Submitted',
          description: 'Your maintenance request has been submitted for approval.',
        });
        router.push('/dashboard');
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
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle>Request Details</CardTitle>
            <CardDescription>Select the item that needs maintenance and describe the issue or modification.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="sourceType"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormLabel>What is this request for?</FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={(value) => {
                        field.onChange(value);
                        form.setValue('sourceId', ''); // Reset selection when type changes
                      }}
                      defaultValue={field.value}
                      className="flex items-center space-x-4"
                    >
                      <FormItem className="flex items-center space-x-2 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="mold" />
                        </FormControl>
                        <FormLabel className="font-normal">Mold</FormLabel>
                      </FormItem>
                      <FormItem className="flex items-center space-x-2 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="machine" />
                        </FormControl>
                        <FormLabel className="font-normal">Machine</FormLabel>
                      </FormItem>
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {sourceType && (
              <FormField
                control={form.control}
                name="sourceId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{sourceType === 'mold' ? 'Select Mold' : 'Select Machine'}</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder={`Select a ${sourceType}...`} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {(sourceType === 'mold' ? allMolds : allMachines).map((item) => (
                          <SelectItem key={item.id} value={item.id}>
                            {item.codice} - {item.descrizione}
                          </SelectItem>
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
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description of Request</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="e.g., Requesting modification to insert XYZ on the mold..."
                      rows={5}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Send className="mr-2 h-4 w-4" />
            )}
            {isSubmitting ? 'Submitting...' : 'Submit Request'}
          </Button>
        </div>
      </form>
    </Form>
  );
}
