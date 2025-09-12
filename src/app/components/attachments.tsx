
'use client';
import * as React from 'react';
import type { Attachment, Component } from '@/lib/types';
import { useApp } from '@/context/app-context';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { UploadCloud, File, FileText, Image as ImageIcon, FileArchive, Trash2, Eye, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { uploadFileAndCreateAttachment, deleteAttachment } from '@/lib/data';
import { useRouter } from 'next/navigation';
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

interface ComponentAttachmentsProps {
  component: Component;
}

const getFileIcon = (fileType: string) => {
    switch (fileType) {
        case 'PDF': return <FileText className="h-6 w-6 text-red-500" />;
        case 'Image': return <ImageIcon className="h-6 w-6 text-green-500" />;
        case '3D': return <File className="h-6 w-6 text-blue-500" />;
        default: return <FileArchive className="h-6 w-6 text-gray-500" />;
    }
}

export function ComponentAttachments({ component }: ComponentAttachmentsProps) {
  const { user } = useApp();
  const { toast } = useToast();
  const router = useRouter();
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const contentRef = React.useRef<HTMLDivElement>(null);
  const [isUploading, setIsUploading] = React.useState(false);

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    toast({
      title: 'Upload Started',
      description: `Uploading "${file.name}"...`,
    });

    const result = await uploadFileAndCreateAttachment(component.id, 'component', file);

    setIsUploading(false);

    if (result.success) {
      toast({
        title: 'Upload Successful',
        description: `"${file.name}" has been attached to the component.`,
      });
      router.refresh();
    } else {
      toast({
        title: 'Upload Failed',
        description: result.error || 'An unexpected error occurred.',
        variant: 'destructive',
      });
    }
  };

  const handleDelete = async (attachment: Attachment) => {
    const result = await deleteAttachment(component.id, 'component', attachment);
    if (result.success) {
      toast({
        title: 'Attachment Deleted',
        description: `"${attachment.fileName}" has been removed.`,
      });
      router.refresh();
    } else {
      toast({
        title: 'Error Deleting File',
        description: result.error || 'Could not delete the attachment.',
        variant: 'destructive',
      });
    }
  }

  const handleViewDrawing = () => {
    contentRef.current?.scrollIntoView({ behavior: 'smooth' });
  }

  const hasAttachments = component.attachments && component.attachments.length > 0;

  return (
    <Card className="lg:col-span-2">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
            <CardTitle>Attachments</CardTitle>
            <CardDescription>Drawings, images, and other related files.</CardDescription>
        </div>
        <div className="flex items-center gap-2">
            {hasAttachments && (
                 <Button variant="secondary" onClick={handleViewDrawing}>
                    <Eye className="mr-2 h-4 w-4" />
                    View Drawing
                </Button>
            )}
            {user?.isAdmin && (
                <>
                    <Button variant="outline" onClick={handleUploadClick} disabled={isUploading}>
                        {isUploading ? (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                            <UploadCloud className="mr-2 h-4 w-4" />
                        )}
                        {isUploading ? 'Uploading...' : 'Upload File'}
                    </Button>
                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        className="hidden"
                        disabled={isUploading}
                    />
                </>
            )}
        </div>
      </CardHeader>
      <CardContent ref={contentRef}>
        {hasAttachments ? (
          <ul className="space-y-2">
            {component.attachments!.map((file) => (
              <li key={file.id} className="flex items-center justify-between p-2 rounded-md border">
                <div className="flex items-center gap-3">
                  {getFileIcon(file.fileType)}
                  <div>
                    <a href={file.url} target="_blank" rel="noopener noreferrer" className="font-medium hover:underline">
                      {file.fileName}
                    </a>
                    <p className="text-xs text-muted-foreground">
                      {file.fileType} - Uploaded on {new Date(file.uploadedAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                {user?.isAdmin && (
                     <AlertDialog>
                        <AlertDialogTrigger asChild>
                           <Button variant="ghost" size="icon">
                              <Trash2 className="h-4 w-4 text-destructive" />
                           </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                            <AlertDialogDescription>
                                This action will permanently delete the file <span className="font-semibold">{file.fileName}</span> from storage. This cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleDelete(file)}>Delete</AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                )}
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-center text-muted-foreground py-8">
            No files have been attached to this component.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
