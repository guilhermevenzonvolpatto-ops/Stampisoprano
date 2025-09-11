
'use client';

import * as React from 'react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
  SheetClose,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import type { MoldEvent } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { updateEvent } from '@/lib/data';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Loader2 } from 'lucide-react';

interface EditEventSheetProps {
  event: MoldEvent;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: () => void;
}

export function EditEventSheet({ event, isOpen, onClose, onUpdate }: EditEventSheetProps) {
  const { toast } = useToast();
  const [description, setDescription] = React.useState(event.descrizione);
  const [cost, setCost] = React.useState(event.costo?.toString() || '');
  const [estimatedEndDate, setEstimatedEndDate] = React.useState(event.estimatedEndDate)
  const [isSaving, setIsSaving] = React.useState(false);
  
  React.useEffect(() => {
    setDescription(event.descrizione);
    setCost(event.costo?.toString() || '');
    setEstimatedEndDate(event.estimatedEndDate);
  }, [event]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await updateEvent(event.id, {
        descrizione: description,
        costo: cost ? parseFloat(cost) : null,
        estimatedEndDate: estimatedEndDate
      });
      toast({
        title: 'Event Updated',
        description: 'The event details have been saved.',
      });
      onUpdate();
      onClose();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Could not update the event.',
        variant: 'destructive',
      });
    } finally {
        setIsSaving(false);
    }
  };

  const handleMarkAsDone = async () => {
    setIsSaving(true);
    try {
        await updateEvent(event.id, {
            status: 'Chiuso',
            actualEndDate: new Date().toISOString().split('T')[0],
        });
        toast({
            title: 'Event Completed',
            description: 'The event has been marked as done.',
        });
        onUpdate();
        onClose();
    } catch (error) {
         toast({
            title: 'Error',
            description: 'Could not mark the event as done.',
            variant: 'destructive',
        });
    } finally {
        setIsSaving(false);
    }
  };


  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Edit Event</SheetTitle>
          <SheetDescription>
            Update the details for this event or mark it as completed.
          </SheetDescription>
        </SheetHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="event-type">Type</Label>
            <Input id="event-type" value={event.type} disabled />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="event-description">Description</Label>
            <Textarea
              id="event-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
            />
          </div>
           <div className="grid gap-2">
                <Label htmlFor="event-estimated-end-date">Estimated End Date</Label>
                <Input
                    id="event-estimated-end-date"
                    type="date"
                    value={estimatedEndDate}
                    onChange={(e) => setEstimatedEndDate(e.target.value)}
                />
            </div>
          <div className="grid gap-2">
            <Label htmlFor="event-cost">Cost</Label>
            <Input
              id="event-cost"
              type="number"
              value={cost}
              onChange={(e) => setCost(e.target.value)}
              placeholder="Enter cost if applicable"
            />
          </div>
        </div>
        <SheetFooter className="gap-2 sm:flex sm:flex-row sm:justify-between pt-4">
           <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="outline" disabled={isSaving}>Mark as Done</Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will mark the event as completed and it can no longer be edited.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleMarkAsDone}>Continue</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
            <div className="flex gap-2">
                <SheetClose asChild>
                    <Button variant="ghost">Cancel</Button>
                </SheetClose>
                <Button onClick={handleSave} disabled={isSaving}>
                    {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {isSaving ? 'Saving...' : 'Save Changes'}
                </Button>
            </div>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
