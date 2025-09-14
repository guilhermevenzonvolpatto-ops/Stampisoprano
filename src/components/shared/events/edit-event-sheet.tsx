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
import type { Attachment, MoldEvent } from '@/lib/types';
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
import { Loader2, UploadCloud, FileText, Trash2, Image as ImageIcon, FileArchive, File as FileIcon } from 'lucide-react';
import { useApp } from '@/context/app-context';
import { uploadFileAndCreateAttachment, deleteAttachment } from '@/app/actions/attachments';
import { ScrollArea } from '@/components/ui/scroll-area';

interface EditEventSheetProps {
  event: MoldEvent;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: () => void;
}

const getFileIcon = (fileType: string) => {
    switch (fileType) {
        case 'PDF': return <FileText className="h-5 w-5 text-red-500" />;
        case 'Image': return <ImageIcon className="h-5 w-5 text-green-500" />;
        case '3D': return <FileIcon className="h-5 w-5 text-blue-500" />;
        default: return <FileArchive className="h-5 w-5 text-gray-500" />;
    }
}

export function EditEventSheet({ event, isOpen, onClose, onUpdate }: EditEventSheetProps) {
  const { toast } = useToast();
  const { user } = useApp();
  const [description, setDescription] = React.useState(event.descrizione);
  const [cost, setCost] = React.useState(event.costo?.toString() || '');
  const [estimatedEndDate, setEstimatedEndDate] = React.useState(event.estimatedEndDate)
  const [isSaving, setIsSaving] = React.useState(false);
  const [isUploading, setIsUploading] = React.useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const isClosed = event.status === 'Chiuso';

  React.useEffect(() => {
    if(isOpen) {
      setDescription(event.descrizione);
      setCost(event.costo?.toString() || '');
      setEstimatedEndDate(event.estimatedEndDate);
    }
  }, [event, isOpen]);

  const handleSave = async () => {
    if (isClosed) return;
    setIsSaving(true);
    try {
      await updateEvent(event.id, {
        descrizione: description,
        costo: cost ? parseFloat(cost) : null,
        estimatedEndDate: estimatedEndDate,
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
    if (isClosed) return;
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

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('itemId', event.id);
    formData.append('itemType', 'event');

    const result = await uploadFileAndCreateAttachment(formData);
    setIsUploading(false);

    if (result.success) {
      toast({ title: 'Upload Successful' });
      onUpdate(); 
    } else {
      toast({ title: 'Upload Failed', description: result.error, variant: 'destructive' });
    }
  };

  const handleDeleteAttachment = async (attachment: Attachment) => {
    const result = await deleteAttachment(event.id, 'event', attachment);
    if (result.success) {
      toast({ title: 'Attachment Deleted' });
      onUpdate();
    } else {
      toast({ title: 'Error Deleting File', description: result.error, variant: 'destructive' });
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="sm:max-w-xl flex flex-col">
        <SheetHeader>
          <SheetTitle>{isClosed ? 'View Event' : 'Edit Event'}</SheetTitle>
          <SheetDescription>
            {isClosed ? 'This event is closed. You can view its details and manage attachments.' : 'Update the details for this event or mark it as completed.'}
          </SheetDescription>
        </SheetHeader>
        <ScrollArea className="flex-1 -mx-6 px-6">
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
                disabled={isClosed}
              />
            </div>
            <div className="grid gap-2">
                  <Label htmlFor="event-estimated-end-date">Estimated End Date</Label>
                  <Input
                      id="event-estimated-end-date"
                      type="date"
                      value={estimatedEndDate}
                      onChange={(e) => setEstimatedEndDate(e.target.value)}
                      disabled={isClosed}
                  />
              </div>
            {user?.isAdmin && (
              <div className="grid gap-2">
                  <Label htmlFor="event-cost">Cost</Label>
                  <Input
                  id="event-cost"
                  type="number"
                  value={cost}
                  onChange={(e) => setCost(e.target.value)}
                  placeholder="Enter cost if applicable"
                  disabled={isClosed}
                  />
              </div>
            )}
            
            {/* Attachments Section */}
            <div className="space-y-2 pt-2">
                <div className="flex justify-between items-center">
                    <Label>Attachments</Label>
                    <Button variant="outline" size="sm" onClick={handleUploadClick} disabled={isUploading}>
                       {isUploading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <UploadCloud className="mr-2 h-4 w-4" />}
                       Upload
                    </Button>
                     <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" />
                </div>
                <div className="rounded-md border p-2 min-h-[6rem]">
                    {event.attachments && event.attachments.length > 0 ? (
                        <ul className="space-y-1">
                            {event.attachments.map(att => (
                                <li key={att.id} className="flex items-center justify-between text-sm p-1 rounded-md hover:bg-muted">
                                    <a href={att.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 hover:underline truncate">
                                        {getFileIcon(att.fileType)}
                                        <span className="truncate">{att.fileName}</span>
                                    </a>
                                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleDeleteAttachment(att)}>
                                        <Trash2 className="h-4 w-4 text-destructive" />
                                    </Button>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p className="text-xs text-muted-foreground text-center py-4">No files attached.</p>
                    )}
                </div>
            </div>
          </div>
        </ScrollArea>
        <SheetFooter className="gap-2 sm:flex-col pt-4 border-t">
          {isClosed ? (
             <SheetClose asChild>
                <Button variant="outline">Close</Button>
            </SheetClose>
          ) : (
            <div className="sm:flex sm:justify-between w-full">
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
                <div className="flex gap-2 mt-2 sm:mt-0">
                    <SheetClose asChild>
                        <Button variant="ghost">Cancel</Button>
                    </SheetClose>
                    <Button onClick={handleSave} disabled={isSaving}>
                        {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        {isSaving ? 'Saving...' : 'Save Changes'}
                    </Button>
                </div>
            </div>
          )}
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
