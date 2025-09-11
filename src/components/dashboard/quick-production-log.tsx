
'use client';
import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import type { Component } from '@/lib/types';
import { getComponents, logProduction } from '@/lib/data';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import { useApp } from '@/context/app-context';
import { useRouter } from 'next/navigation';
import { Skeleton } from '../ui/skeleton';

export function QuickProductionLog() {
  const [component, setComponent] = React.useState<Component | null>(null);
  const [searchTerm, setSearchTerm] = React.useState('');
  const [isLoading, setIsLoading] = React.useState(false);
  const [isSaving, setIsSaving] = React.useState(false);
  const [allComponents, setAllComponents] = React.useState<Component[]>([]);
  const { toast } = useToast();
  const { user } = useApp();
  const router = useRouter();

  React.useEffect(() => {
    getComponents().then(setAllComponents);
  }, []);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const term = e.target.value;
    setSearchTerm(term);

    if (!term) {
        setComponent(null);
        return;
    }
    
    // Auto-select if a perfect match is found
    const foundComponent = allComponents.find(c => c.codice.toLowerCase() === term.toLowerCase());
    if (foundComponent) {
        setComponent(foundComponent);
    } else {
        setComponent(null);
    }
  };

  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!component || !user) return;

    setIsSaving(true);
    const formData = new FormData(e.currentTarget);
    const good = Number(formData.get('good-pieces'));
    const scrapped = Number(formData.get('scrapped-pieces'));
    const reason = formData.get('scrap-reason') as string;

    try {
        await logProduction({
            componentId: component.id,
            good,
            scrapped,
            scrapReason: reason,
            user: user.id,
        });
        
        toast({
        title: 'Production Logged',
        description: `Production data for ${component.codice} has been saved.`,
        });
        
        router.refresh();

        setComponent(null);
        setSearchTerm('');
        (e.target as HTMLFormElement).reset();
    } catch(error) {
        toast({
            title: 'Error',
            description: 'Failed to log production data.',
            variant: 'destructive'
        })
    } finally {
        setIsSaving(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Quick Production Log</CardTitle>
        <CardDescription>Quickly log production runs for any component.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <Label htmlFor="quick-log-search-input">Search Component by Code</Label>
            <div className="mt-1 relative">
              <Input
                id="quick-log-search-input"
                placeholder="Start typing component code..."
                value={searchTerm}
                onChange={handleSearch}
                className="peer"
              />
              {isLoading && (
                 <Loader2 className="animate-spin h-5 w-5 text-muted-foreground absolute right-3 top-1/2 -translate-y-1/2" />
              )}
            </div>
          </div>
          {component ? (
            <form
              onSubmit={handleSave}
              className="border-t pt-4 space-y-3 animate-in fade-in-50"
            >
              <p className="font-semibold">
                Logging for:{' '}
                <span className="font-mono bg-muted px-2 py-1 rounded">
                  {component.codice}
                </span>{' '}
                - {component.descrizione}
              </p>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="quick-log-good">Good Pieces</Label>
                  <Input
                    type="number"
                    id="quick-log-good"
                    name="good-pieces"
                    defaultValue="0"
                    min="0"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="quick-log-scrapped">Scrapped Pieces</Label>
                  <Input
                    type="number"
                    id="quick-log-scrapped"
                    name="scrapped-pieces"
                    defaultValue="0"
                    min="0"
                    required
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="quick-log-scrap-reason">Scrap Reason (optional)</Label>
                <Textarea
                  id="quick-log-scrap-reason"
                  name="scrap-reason"
                  rows={2}
                />
              </div>
              <div className="text-right">
                <Button type="submit" disabled={isSaving}>
                    {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {isSaving ? 'Saving...' : 'Save Log'}
                </Button>
              </div>
            </form>
          ) : searchTerm ? (
            <div className="text-center text-sm text-muted-foreground pt-4 border-t">
                <p>No component found for code <span className="font-mono bg-muted px-1.5 py-0.5 rounded">{searchTerm}</span>.</p>
            </div>
          ) : (
             <div className="text-center text-sm text-muted-foreground pt-4 border-t">
                <p>Enter a component code to begin logging.</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
