
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import { AppProvider } from '@/context/app-context';
import Header from '@/components/layout/header';

const fontBody = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
});

export const metadata: Metadata = {
  title: 'Mold Manager',
  description: 'Advanced Mold Management System',
  icons: {
    icon: 'data:;base64,iVBORw0KGgo=',
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head/>
      <body className={`${fontBody.variable} font-body antialiased`}>
        <AppProvider>
          <div className="relative flex min-h-screen flex-col bg-background">
            <Header />
            <main className="flex-1">{children}</main>
          </div>
          <Toaster />
        </AppProvider>
      </body>
    </html>
  );
}
