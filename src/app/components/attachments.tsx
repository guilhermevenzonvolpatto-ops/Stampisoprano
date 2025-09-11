
'use client';
import * as React from 'react';
import type { Component } from '@/lib/types';
import { useApp } from '@/context/app-context';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { UploadCloud, File, FileText, Image as ImageIcon, FileArchive, Trash2, Eye } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

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
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const contentRef = React.useRef<HTMLDivElement>(null);

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      console.log('Uploading file:', file.name);
      toast({
        title: 'Upload Started',
        description: `Uploading "${file.name}"... (This is a placeholder action)`,
      });
    }
  };

  const handleDelete = (attachmentId: string) => {
    toast({
        title: 'Delete Action',
        description: `Preparing to delete attachment ${attachmentId}. (This is a placeholder action)`,
        variant: 'destructive'
      });
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
                    <Button variant="outline" onClick={handleUploadClick}>
                        <UploadCloud className="mr-2 h-4 w-4" />
                        Upload File
                    </Button>
                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        className="hidden"
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
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(file.id)}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
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
