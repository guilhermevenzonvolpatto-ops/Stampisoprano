
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
import { createUser } from '@/lib/data';
import { useRouter } from 'next/navigation';
import { PlusCircle, Loader2 } from 'lucide-react';

const formSchema = z.object({
  id: z.string().min(1, 'User Code is required.').regex(/^\S*$/, 'Spaces are not allowed in the user code.'),
  name: z.string().min(1, 'Name is required.'),
});

export function AddUserForm() {
  const { toast } = useToast();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      id: '',
      name: '',
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true);
    try {
      const result = await createUser(values.id, values.name);

      if ('error' in result) {
        toast({
          title: 'Error creating user',
          description: result.error,
          variant: 'destructive',
        });
      } else {
        toast({
          title: 'User Created',
          description: `User "${result.name}" has been successfully created.`,
        });
        router.push('/users/manage');
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
    <Card className="max-w-xl">
        <CardHeader>
            <CardTitle>User Details</CardTitle>
            <CardDescription>Enter the user code (for login) and full name.</CardDescription>
        </CardHeader>
        <CardContent>
            <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                control={form.control}
                name="id"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>User Code / ID</FormLabel>
                    <FormControl>
                        <Input placeholder="e.g., user02" {...field} />
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
                />
                <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Full Name</FormLabel>
                    <FormControl>
                        <Input placeholder="e.g., Mario Rossi" {...field} />
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
                />
                <div className="flex justify-end">
                    <Button type="submit" disabled={isSubmitting}>
                        {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <PlusCircle className="mr-2 h-4 w-4" />}
                        {isSubmitting ? 'Creating...' : 'Create User'}
                    </Button>
                </div>
            </form>
            </Form>
        </CardContent>
    </Card>
  );
}
