'use client';
import * as React from 'react';
import { useApp } from '@/context/app-context';
import { useRouter } from 'next/navigation';
import { AlertCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

interface RestrictedPageProps {
    children: React.ReactNode;
    adminOnly?: boolean;
    allowedCode?: string;
}

export function RestrictedPage({ children, adminOnly = false, allowedCode }: RestrictedPageProps) {
  const { user } = useApp();
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = React.useState(false);

  React.useEffect(() => {
    if (user) {
        if (adminOnly && !user.isAdmin) {
            setIsAuthorized(false);
        } else if (allowedCode && !user.isAdmin && !user.allowedCodes.includes(allowedCode)) {
             setIsAuthorized(false);
        } else {
            setIsAuthorized(true);
        }
    } else {
        // user is not loaded yet or is logged out, redirect to login
        router.push('/login');
    }
  }, [user, adminOnly, allowedCode, router]);

  if (!user) {
      // Still loading user, or redirecting. Render nothing to avoid flicker.
      return null;
  }

  if (!isAuthorized) {
    return (
       <div className="container mx-auto py-10">
         <Alert variant="destructive" className="max-w-lg mx-auto">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Access Denied</AlertTitle>
            <AlertDescription>
              You do not have permission to view this page. Please contact an administrator.
            </AlertDescription>
        </Alert>
      </div>
    );
  }

  return <>{children}</>;
}
