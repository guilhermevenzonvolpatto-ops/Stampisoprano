
'use client';
import * as React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import type { Component } from '@/lib/types';
import { associateComponentsToMold } from '@/lib/data';
import { PlusCircle, Loader2 } from 'lucide-react';
import Link from 'next/link';

interface AddOrSelectComponentDialogProps {
  isOpen: boolean;
  onClose: () => void;
  moldId: string;
  allComponents: Component[];
  associatedComponentIds: string[];
  onAssociationComplete: () => void;
}

export function AddOrSelectComponentDialog({
  isOpen,
  onClose,
  moldId,
  allComponents,
  associatedComponentIds,
  onAssociationComplete
}: AddOrSelectComponentDialogProps) {
  const [searchTerm, setSearchTerm] = React.useState('');
  const [selectedComponentIds, setSelectedComponentIds] = React.useState<string[]>([]);
  const [isSaving, setIsSaving] = React.useState(false);
  const { toast } = useToast();

  const availableComponents = React.useMemo(() => {
    const unassociated = allComponents.filter(c => !associatedComponentIds.includes(c.id));
    if (!searchTerm) {
      return unassociated;
    }
    return unassociated.filter(
      c =>
        c.codice.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.descrizione.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [allComponents, associatedComponentIds, searchTerm]);

  const handleSelectComponent = (componentId: string) => {
    setSelectedComponentIds(prev =>
      prev.includes(componentId)
        ? prev.filter(id => id !== componentId)
        : [...prev, componentId]
    );
  };
  
  const handleSaveAssociation = async () => {
    if (selectedComponentIds.length === 0) {
      toast({
        title: "No components selected",
        description: "Please select at least one component to associate.",
        variant: "destructive",
      });
      return;
    }

    setIsSaving(true);
    const result = await associateComponentsToMold(moldId, selectedComponentIds);
    setIsSaving(false);

    if (result.success) {
      toast({
        title: "Components Associated",
        description: `${selectedComponentIds.length} component(s) have been successfully associated with the mold.`
      });
      onAssociationComplete();
      onClose();
    } else {
      toast({
        title: "Error",
        description: result.error || "An unexpected error occurred.",
        variant: "destructive",
      });
    }
  };
  
  // Reset state on close
  React.useEffect(() => {
    if (!isOpen) {
      setSearchTerm('');
      setSelectedComponentIds([]);
      setIsSaving(false);
    }
  }, [isOpen]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>Add Component to Mold</DialogTitle>
          <DialogDescription>
            Associate an existing component or create a new one.
          </DialogDescription>
        </DialogHeader>
        <Tabs defaultValue="select">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="select">Select Existing</TabsTrigger>
            <TabsTrigger value="create">Create New</TabsTrigger>
          </TabsList>
          <TabsContent value="select" className="space-y-4 pt-4">
            <Input
              placeholder="Search available components..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <ScrollArea className="h-60 rounded-md border">
              {availableComponents.length > 0 ? (
                <div className="p-4 space-y-2">
                  {availableComponents.map((component) => (
                    <div
                      key={component.id}
                      className="flex items-center space-x-2 p-2 rounded-md hover:bg-muted"
                    >
                      <Checkbox
                        id={`comp-${component.id}`}
                        checked={selectedComponentIds.includes(component.id)}
                        onCheckedChange={() => handleSelectComponent(component.id)}
                      />
                      <Label htmlFor={`comp-${component.id}`} className="w-full cursor-pointer">
                        <span className="font-medium">{component.codice}</span>
                        <p className="text-xs text-muted-foreground">{component.descrizione}</p>
                      </Label>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-sm text-muted-foreground p-4">
                  No available components found.
                </p>
              )}
            </ScrollArea>
             <DialogFooter>
                <DialogClose asChild>
                    <Button type="button" variant="outline">Cancel</Button>
                </DialogClose>
                <Button onClick={handleSaveAssociation} disabled={isSaving || selectedComponentIds.length === 0}>
                    {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Associate Selected
                </Button>
            </DialogFooter>
          </TabsContent>
          <TabsContent value="create">
             <div className="flex flex-col items-center justify-center h-60 text-center border rounded-md p-6 space-y-4">
                <h3 className="font-semibold">Create a New Component</h3>
                <p className="text-sm text-muted-foreground">
                    This will take you to the component creation form. The new component will not be automatically associated with this mold.
                </p>
                 <Button asChild>
                    <Link href="/components/new">
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Go to Create Component Page
                    </Link>
                </Button>
             </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
