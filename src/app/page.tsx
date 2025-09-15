
'use client';

import * as React from 'react';
import Header from '@/components/layout/header';
import { useRouter } from 'next/navigation';
import { useApp } from '@/context/app-context';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { LogIn, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function LoginPage() {
  const { loginAs, t } = useApp();
  const { toast } = useToast();
  const [loading, setLoading] = React.useState(false);
  const [code, setCode] = React.useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code) return;

    setLoading(true);
    const success = await loginAs(code);
    
    if (!success) {
      toast({
        title: t('loginFailed'),
        description: t('invalidUserCode'),
        variant: 'destructive',
      });
      setCode('');
    }
    // The redirect is handled by the AppProvider now
    setLoading(false);
  };

  return (
    <div className="flex flex-col h-screen">
      <Header />
      <main className="flex-1 flex items-center justify-center">
        <Card className="w-full max-w-sm">
          <CardHeader className="text-center">
            <CardTitle>{t('welcome')}</CardTitle>
            <CardDescription>{t('enterUserCode')}</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="user-code">{t('userCode')}</Label>
                <Input
                  id="user-code"
                  placeholder="e.g., user01"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  required
                  disabled={loading}
                />
              </div>
              <Button
                type="submit"
                className="w-full"
                disabled={loading || !code}
              >
                {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <LogIn className="mr-2 h-4 w-4" />}
                {loading ? t('loggingIn') : t('login')}
              </Button>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
