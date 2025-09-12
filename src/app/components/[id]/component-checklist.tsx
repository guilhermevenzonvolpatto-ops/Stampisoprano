
'use client';
import * as React from 'react';
import type { Component, ChecklistItem } from '@/lib/types';
import { useApp } from '@/context/app-context';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { PlusCircle, Trash2, Loader2, Edit, Save, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { updateComponent } from '@/lib/data';
import { v4 as uuidv4 } from 'uuid';
import { useRouter } from 'next/navigation';

interface ComponentChecklistProps {
  component: Component;
}

export function ComponentChecklist({ component }: ComponentChecklistProps) {
  const { user } = useApp();
  const { toast } = useToast();
  const router = useRouter();

  const [checklist, setChecklist] = React.useState<ChecklistItem[]>(component.checklist || []);
  const [newItemText, setNewItemText] = React.useState('');
  const [editingItemId, setEditingItemId] = React.useState<string | null>(null);
  const [editingItemText, setEditingItemText] = React.useState('');
  const [isLoading, setIsLoading] = React.useState(false);

  const handleUpdate = async (updatedChecklist: ChecklistItem[]) => {
    setIsLoading(true);
    try {
      await updateComponent(component.id, { checklist: updatedChecklist });
      setChecklist(updatedChecklist);
      router.refresh();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update checklist.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddItem = () => {
    if (!newItemText.trim()) return;
    const newItem: ChecklistItem = {
      id: uuidv4(),
      text: newItemText.trim(),
      isChecked: false,
    };
    handleUpdate([...checklist, newItem]);
    setNewItemText('');
  };

  const handleToggleItem = (itemId: string) => {
    const updatedList = checklist.map(item =>
      item.id === itemId ? { ...item, isChecked: !item.isChecked } : item
    );
    handleUpdate(updatedList);
  };

  const handleRemoveItem = (itemId: string) => {
    const updatedList = checklist.filter(item => item.id !== itemId);
    handleUpdate(updatedList);
  };

  const handleStartEditing = (item: ChecklistItem) => {
    setEditingItemId(item.id);
    setEditingItemText(item.text);
  };

  const handleCancelEditing = () => {
    setEditingItemId(null);
    setEditingItemText('');
  };

  const handleSaveEdit = () => {
    if (!editingItemText.trim() || !editingItemId) return;
    const updatedList = checklist.map(item =>
      item.id === editingItemId ? { ...item, text: editingItemText.trim() } : item
    );
    handleUpdate(updatedList);
    setEditingItemId(null);
    setEditingItemText('');
  };
  
  if (!user?.isAdmin) {
    if (!component.checklist || component.checklist.length === 0) return null;
    // Non-admin view
    return (
       <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle>Checklist</CardTitle>
          <CardDescription>Required checks for this component.</CardDescription>
        </CardHeader>
        <CardContent>
           <ul className="space-y-3">
            {checklist.map((item) => (
              <li key={item.id} className="flex items-center">
                <Checkbox id={`view-item-${item.id}`} checked={item.isChecked} disabled className="mr-3" />
                <label
                  htmlFor={`view-item-${item.id}`}
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  {item.text}
                </label>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    )
  }

  // Admin view
  return (
    <Card className="lg:col-span-2">
      <CardHeader>
        <CardTitle>Component Checklist</CardTitle>
        <CardDescription>Manage the checklist for quality control and other procedures.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <ul className="space-y-3">
          {checklist.map((item) => (
            <li key={item.id} className="flex items-center gap-2 group">
              <Checkbox
                checked={item.isChecked}
                onCheckedChange={() => handleToggleItem(item.id)}
                disabled={isLoading}
              />
              {editingItemId === item.id ? (
                <div className="flex-1 flex gap-2">
                    <Input
                        value={editingItemText}
                        onChange={(e) => setEditingItemText(e.target.value)}
                        className="h-9"
                    />
                    <Button size="icon" className="h-9 w-9" onClick={handleSaveEdit}>
                        <Save className="h-4 w-4" />
                    </Button>
                     <Button size="icon" variant="ghost" className="h-9 w-9" onClick={handleCancelEditing}>
                        <X className="h-4 w-4" />
                    </Button>
                </div>
              ) : (
                <span className="flex-1 text-sm">{item.text}</span>
              )}

              {editingItemId !== item.id && (
                 <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                    <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => handleStartEditing(item)}>
                        <Edit className="h-4 w-4" />
                    </Button>
                    <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => handleRemoveItem(item.id)}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                </div>
              )}
            </li>
          ))}
        </ul>

        {checklist.length === 0 && (
            <p className="text-sm text-center text-muted-foreground py-4">No checklist items yet.</p>
        )}
        
        <div className="flex gap-2 pt-4 border-t">
          <Input
            placeholder="Add new checklist item..."
            value={newItemText}
            onChange={(e) => setNewItemText(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAddItem()}
            disabled={isLoading}
          />
          <Button onClick={handleAddItem} disabled={isLoading || !newItemText.trim()}>
            {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <PlusCircle className="mr-2 h-4 w-4" />}
            Add
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
