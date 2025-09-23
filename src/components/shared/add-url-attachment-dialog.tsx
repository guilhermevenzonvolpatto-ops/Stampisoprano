
'use client';

import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { createAttachmentFromUrl } from '@/app/actions/attachments';
import { Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface AddUrlAttachmentDialogProps {
  isOpen: boolean;
  onClose: () => void;
  itemId: string;
  itemType: 'mold' | 'component' | 'machine' | 'event';
}

const formSchema = z.object({
  url: z.string().url('Please enter a valid URL.'),
  name: z.string().optional(),
});

export function AddUrlAttachmentDialog({
  isOpen,
  onClose,
  itemId,
  itemType,
}: AddUrlAttachmentDialogProps) {
  const { toast } = useToast();
  const router = useRouter();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { url: '', name: '' },
  });

  const { isSubmitting } = form.formState;

  const handleSubmit = async (values: z.infer<typeof formSchema>) => {
    const result = await createAttachmentFromUrl(
      itemId,
      itemType,
      values.url,
      values.name
    );

    if (result.success) {
      toast({
        title: 'Link Added',
        description: 'The external link has been attached successfully.',
      });
      router.refresh();
      onClose();
    } else {
      toast({
        title: 'Error',
        description: result.error || 'Failed to add the link.',
        variant: 'destructive',
      });
    }
  };

  React.useEffect(() => {
    if (isOpen) {
      form.reset({ url: '', name: '' });
    }
  }, [isOpen, form]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Attachment from URL</DialogTitle>
          <DialogDescription>
            Link to an external file (e.g., from Google Drive or another site).
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-4 py-4"
          >
            <FormField
              control={form.control}
              name="url"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>File URL</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="https://docs.google.com/..."
                      {...field}
                    />
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
                  <FormLabel>Display Name (Optional)</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g., Technical Drawing Rev. 3"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <DialogClose asChild>
                <Button type="button" variant="outline">
                  Cancel
                </Button>
              </DialogClose>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                {isSubmitting ? 'Saving...' : 'Save Link'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
