
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

interface UserDisplayData {
  readonly id: string;
  readonly email: string | undefined;
  readonly created_at: string;
  readonly last_sign_in_at: string | undefined;
  readonly role: string;
}

interface UserTableProps {
  readonly users: UserDisplayData[];
}

/**
 * Renders a table displaying user information including email, role, creation date, last sign-in date, and actions.
 * @example
 * UserTable({ users: userList })
 * // Returns a JSX element representing a table of users
 * @param {Object[]} users - List of user objects containing their information such as email, role, creation date, and last sign-in date.
 * @returns {JSX.Element} A table component displaying user details.
 * @description
 *   - The table provides an "Edit" action for each user which links to their profile page.
 *   - Roles are visually distinguished using a Badge component with different styles based on the role.
 *   - The creation and last sign-in dates are formatted to a locale date string.
 *   - If the last sign-in date is not available, it displays 'N/A'.
 */
export function UserTable({ users }: UserTableProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Email</TableHead>
          <TableHead>Role</TableHead>
          <TableHead>Created At</TableHead>
          <TableHead>Last Sign In</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {users.map((user) => (
          <TableRow key={user.id}>
            <TableCell className="font-medium">{user.email}</TableCell>
            <TableCell>
              <Badge variant={user.role === 'admin' ? 'default' : 'secondary'}>{user.role}</Badge>
            </TableCell>
            <TableCell>{new Date(user.created_at).toLocaleDateString()}</TableCell>
            <TableCell>
              {user.last_sign_in_at === undefined
                ? 'N/A'
                : new Date(user.last_sign_in_at).toLocaleDateString()}
            </TableCell>
            <TableCell className="text-right">
              <Button variant="outline" size="sm" asChild>
                <Link href={`/admin/users/${user.id}`}>Edit</Link>
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
