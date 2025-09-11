
'use client';

import * as React from 'react';
import type { Mold, Component } from '@/lib/types';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { updateComponent, updateMold } from '@/lib/data';
import { Trash2, PlusCircle, Edit } from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { useRouter } from 'next/navigation';

interface EditCustomFieldsProps {
  item: Mold | Component;
  itemType: 'mold' | 'component';
}

const customFieldSchema = z.object({
  key: z.string().min(1, 'Field name is required.'),
  value: z.string().min(1, 'Field value is required.'),
});

const formSchema = z.object({
  customFields: z.array(customFieldSchema),
});

export function EditCustomFields({ item, itemType }: EditCustomFieldsProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const { toast } = useToast();
  const router = useRouter();

  const defaultValues = Object.entries(item.customFields || {}).map(([key, value]) => ({ key, value: String(value) }));

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      customFields: defaultValues,
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'customFields',
  });
  
  const { isSubmitting } = form.formState;

  React.useEffect(() => {
    form.reset({ customFields: Object.entries(item.customFields || {}).map(([key, value]) => ({ key, value: String(value) })) });
  }, [item.customFields, form]);


  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    const customFieldsObject = values.customFields.reduce((acc, { key, value }) => {
      acc[key] = value;
      return acc;
    }, {} as Record<string, string>);

    try {
      if (itemType === 'mold') {
          await updateMold(item.id, { customFields: customFieldsObject });
      } else {
          await updateComponent(item.id, { customFields: customFieldsObject });
      }
      toast({
        title: 'Success',
        description: 'Custom fields have been updated.',
      });
      setIsOpen(false);
      router.refresh();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Could not update custom fields.',
        variant: 'destructive',
      });
    }
  };

  return (
    <Collapsible asChild open={isOpen} onOpenChange={setIsOpen}>
      <Card className="lg:col-span-2">
          <CardHeader>
              <div className="flex justify-between items-center">
                  <CardTitle>Custom Fields</CardTitle>
                  <CollapsibleTrigger asChild>
                      <Button variant="ghost" size="sm">
                          <Edit className="mr-2 h-4 w-4" />
                          {isOpen ? 'Cancel' : 'Edit'}
                      </Button>
                  </CollapsibleTrigger>
              </div>
              {Object.keys(item.customFields || {}).length === 0 && !isOpen && (
                  <CardDescription className="pt-2">No custom fields defined.</CardDescription>
              )}
          </CardHeader>

          {!isOpen && Object.keys(item.customFields || {}).length > 0 && (
              <CardContent className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
                {Object.entries(item.customFields!).map(([key, value]) => (
                  <div key={key}>
                    <p className="font-semibold">{key}</p>
                    <p className="text-muted-foreground">{String(value)}</p>
                  </div>
                ))}
              </CardContent>
          )}
        
          <CollapsibleContent asChild>
              <CardContent>
                  <Form {...form}>
                      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
                          <div className="flex justify-between items-center pt-2">
                              <Button
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                  onClick={() => append({ key: '', value: '' })}
                              >
                                  <PlusCircle className="mr-2 h-4 w-4" />
                                  Add Field
                              </Button>
                              <Button type="submit" disabled={isSubmitting}>
                                  {isSubmitting ? 'Saving...' : 'Save Changes'}
                              </Button>
                          </div>
                      </form>
                  </Form>
              </CardContent>
          </CollapsibleContent>
      </Card>
    </Collapsible>
  );
}
