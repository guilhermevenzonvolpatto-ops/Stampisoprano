
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
import { CheckCircle, XCircle, ChevronRight } from 'lucide-react';
import { RestrictedPage } from '@/components/layout/restricted-page';
import Link from 'next/link';

export default async function ManageUsersPage() {
  const users = await getUsers();

  return (
    <RestrictedPage adminOnly>
      <div className="container mx-auto py-10">
        <h1 className="text-3xl font-bold font-headline mb-2">User Management</h1>
        <p className="text-muted-foreground mb-6">Manage user accounts and their permissions.</p>

        <Card>
          <CardHeader>
            <CardTitle>Existing Users</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User Code (ID)</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead><span className="sr-only">Actions</span></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-mono">{user.id}</TableCell>
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
    </RestrictedPage>
  );
}
