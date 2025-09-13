

'use client';

import * as React from 'react';
import type { User, Mold, Component, Machine } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { updateUser } from '@/lib/data';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useRouter } from 'next/navigation';
import { getMachines } from '@/lib/data';

interface UserPermissionsFormProps {
  user: User;
  allMolds: Mold[];
  allComponents: Component[];
}

export function UserPermissionsForm({ user, allMolds, allComponents }: UserPermissionsFormProps) {
  const [selectedCodes, setSelectedCodes] = React.useState<string[]>(user.allowedCodes || []);
  const [allMachines, setAllMachines] = React.useState<Machine[]>([]);
  const [isSaving, setIsSaving] = React.useState(false);
  const { toast } = useToast();
  const router = useRouter();

  React.useEffect(() => {
    getMachines().then(setAllMachines);
  }, []);

  const handleCheckboxChange = (code: string) => {
    setSelectedCodes(prev => 
      prev.includes(code) ? prev.filter(c => c !== code) : [...prev, code]
    );
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await updateUser(user.id, { allowedCodes: selectedCodes });
      toast({
        title: 'Permissions Updated',
        description: `Successfully updated permissions for ${user.name}.`,
      });
      router.refresh();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Could not update user permissions.',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (user.isAdmin) {
    return (
      <Card className="max-w-md mx-auto">
        <CardHeader>
          <CardTitle>Administrator Account</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">This user is an administrator and has access to all resources by default. Permission management is not applicable.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
                <CardHeader>
                    <CardTitle>Molds Access</CardTitle>
                    <CardDescription>Select the molds this user can view.</CardDescription>
                </CardHeader>
                <CardContent>
                    <ScrollArea className="h-72">
                        <div className="space-y-2">
                        {allMolds.map(mold => (
                            <div key={mold.id} className="flex items-center space-x-2">
                                <Checkbox
                                    id={`mold-${mold.id}`}
                                    checked={selectedCodes.includes(mold.codice)}
                                    onCheckedChange={() => handleCheckboxChange(mold.codice)}
                                />
                                <Label htmlFor={`mold-${mold.id}`} className="font-normal w-full cursor-pointer">
                                    <span className="font-medium">{mold.codice}</span>
                                    <span className="text-muted-foreground text-xs block">{mold.descrizione}</span>
                                </Label>
                            </div>
                        ))}
                        </div>
                    </ScrollArea>
                </CardContent>
            </Card>
            <Card>
                <CardHeader>
                    <CardTitle>Components Access</CardTitle>
                     <CardDescription>Select the components this user can view.</CardDescription>
                </CardHeader>
                <CardContent>
                    <ScrollArea className="h-72">
                         <div className="space-y-2">
                        {allComponents.map(component => (
                            <div key={component.id} className="flex items-center space-x-2">
                            <Checkbox
                                id={`component-${component.id}`}
                                checked={selectedCodes.includes(component.codice)}
                                onCheckedChange={() => handleCheckboxChange(component.codice)}
                            />
                            <Label htmlFor={`component-${component.id}`} className="font-normal w-full cursor-pointer">
                                 <span className="font-medium">{component.codice}</span>
                                 <span className="text-muted-foreground text-xs block">{component.descrizione}</span>
                            </Label>
                            </div>
                        ))}
                        </div>
                    </ScrollArea>
                </CardContent>
            </Card>
             <Card>
                <CardHeader>
                    <CardTitle>Machines Access</CardTitle>
                     <CardDescription>Select the machines this user can view.</CardDescription>
                </CardHeader>
                <CardContent>
                    <ScrollArea className="h-72">
                         <div className="space-y-2">
                        {allMachines.map(machine => (
                            <div key={machine.id} className="flex items-center space-x-2">
                            <Checkbox
                                id={`machine-${machine.id}`}
                                checked={selectedCodes.includes(machine.codice)}
                                onCheckedChange={() => handleCheckboxChange(machine.codice)}
                            />
                            <Label htmlFor={`machine-${machine.id}`} className="font-normal w-full cursor-pointer">
                                 <span className="font-medium">{machine.codice}</span>
                                 <span className="text-muted-foreground text-xs block">{machine.descrizione}</span>
                            </Label>
                            </div>
                        ))}
                        </div>
                    </ScrollArea>
                </CardContent>
            </Card>
        </div>
      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={isSaving}>
          {isSaving ? 'Saving...' : 'Save Permissions'}
        </Button>
      </div>
    </div>
  );
}
