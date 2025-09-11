
'use client';
import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
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

  React.useEffect(() => {
    if (!searchTerm) {
      setComponent(null);
      return;
    }

    setIsLoading(true);
    const handler = setTimeout(() => {
      const foundComponent = allComponents.find(c => c.codice.toLowerCase() === searchTerm.toLowerCase());
      if (foundComponent) {
        setComponent(foundComponent);
      } else {
        setComponent(null);
      }
      setIsLoading(false);
    }, 500); // 500ms debounce delay

    return () => {
      clearTimeout(handler);
    };
  }, [searchTerm, allComponents]);


  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!component || !user) return;

    setIsSaving(true);
    const formData = new FormData(e.currentTarget);
    const good = Number(formData.get('good-pieces'));
    const scrapped = Number(formData.get('scrapped-pieces'));
    const reason = formData.get('scrap-reason') as string;

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
    setIsSaving(false);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Quick Production Log</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <Label htmlFor="quick-log-search-input">Search Component (Auto-fill)</Label>
            <div className="mt-1 relative">
              <Input
                id="quick-log-search-input"
                placeholder="Start typing component code..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              {isLoading && (
                 <Loader2 className="animate-spin h-5 w-5 text-muted-foreground absolute right-3 top-1/2 -translate-y-1/2" />
              )}
            </div>
          </div>
          {component && (
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
                <Label htmlFor="quick-log-scrap-reason">Scrap Reason</Label>
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
          )}
        </div>
      </CardContent>
    </Card>
  );
}
