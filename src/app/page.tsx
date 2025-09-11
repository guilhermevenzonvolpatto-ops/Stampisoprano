import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-10rem)]">
      <div className="text-center mb-10">
        <h1 className="text-4xl font-bold tracking-tight lg:text-5xl">
          Benvenuto in Sopranostampi
        </h1>
        <p className="mt-4 text-lg text-muted-foreground">
          La tua soluzione centralizzata per la gestione degli stampi.
        </p>
      </div>
      <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Accesso Rapido</CardTitle>
            <CardDescription>
              Seleziona una sezione per iniziare.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button asChild className="w-full" size="lg">
              <Link href="/dashboard">Vai alla Dashboard</Link>
            </Button>
             <Button asChild className="w-full" variant="secondary">
              <Link href="/molds">Gestione Stampi</Link>
            </Button>
            <Button asChild className="w-full" variant="secondary">
              <Link href="/components">Gestione Componenti</Link>
            </Button>
          </CardContent>
        </Card>
    </div>
  );
}
