

import { getUsers } from '@/lib/data';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, ChevronRight, ShieldCheck, PlusCircle } from 'lucide-react';
import { RestrictedPage } from '@/components/layout/restricted-page';
import Link from 'next/link';
import { AdminButton } from '@/components/layout/admin-button';
import Header from '@/components/layout/header';

export default async function ManageUsersPage() {
  const users = await getUsers();

  return (
    <RestrictedPage adminOnly>
      <div className="flex flex-col h-screen">
        <Header />
        <main className="flex-1 overflow-y-auto">
          <div className="container mx-auto py-10">
            <div className="flex justify-between items-center mb-6">
                <div>
                  <h1 className="text-3xl font-bold font-headline mb-2">User Management</h1>
                  <p className="text-muted-foreground">Manage user accounts and their permissions.</p>
                </div>
                <AdminButton href="/users/manage/new">
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Create User
                </AdminButton>
            </div>


            <Card>
              <CardHeader>
                <CardTitle>Existing Users</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User Identifier</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead><span className="sr-only">Actions</span></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell>
                          {user.isAdmin ? (
                            <div className="flex items-center gap-2">
                               <ShieldCheck className="h-4 w-4 text-primary" />
                               <span className="font-medium">{user.name}</span>
                            </div>
                          ) : (
                            <span className="font-mono">{user.id}</span>
                          )}
                        </TableCell>
                        <TableCell>{user.name}</TableCell>
                        <TableCell>
                          <Badge variant={user.isAdmin ? 'default' : 'secondary'}>
                            {user.isAdmin ? (
                              <CheckCircle className="mr-1 h-3 w-3" />
                            ) : (
                              <XCircle className="mr-1 h-3 w-3" />
                            )}
                            {user.isAdmin ? 'Admin' : 'User'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Link href={`/users/manage/${user.id}`} className="flex items-center justify-end text-sm text-muted-foreground hover:text-primary">
                             Manage <ChevronRight className="h-4 w-4 ml-1" />
                          </Link>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </RestrictedPage>
  );
}
