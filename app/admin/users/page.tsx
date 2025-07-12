
import { supabaseAdmin } from '@/lib/supabase';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { UserPlus } from 'lucide-react';
import Link from 'next/link';
import { User } from '@supabase/supabase-js';
import { UserTable } from '@/components/admin/users/UserTable';

interface UserDisplayData {
  id: string;
  email: string | undefined;
  created_at: string;
  last_sign_in_at: string | undefined;
  role: string;
}

/**
 * Fetches user data along with their associated roles.
 * @example
 * getUsersData()
 * Returns a promise resolving to an array of user data including roles.
 * @returns {Promise<UserDisplayData[]>} Promise resolving to an array of user data objects.
 * @description
 *   - The function requires a global `supabaseAdmin` instance to be available.
 *   - Handles errors during the fetching of users or profiles by logging them.
 *   - Maps profile roles to users, defaulting roles to 'user' when not found.
 */
async function getUsersData(): Promise<UserDisplayData[]> {
  if (!supabaseAdmin) {
    throw new Error('Supabase admin client not available');
  }

  const { data, error } = await supabaseAdmin.auth.admin.listUsers();

  if (error) {
    console.error('Error fetching users:', error);
    return [];
  }

  const users: User[] = data.users ?? [];

  // Fetch profiles to get roles
  const { data: profiles, error: profilesError } = await supabaseAdmin
    .from('profiles')
    .select('id, role');

  if (profilesError) {
    console.error('Error fetching profiles:', profilesError);
    // Continue with users data even if profiles fetch fails
  }

  const profilesMap = new Map<string, string>(profiles?.map((p) => [p.id, p.role]) ?? []);

  return users.map((user) => ({
    id: user.id,
    email: user.email,
    created_at: user.created_at,
    last_sign_in_at: user.last_sign_in_at,
    role: profilesMap.get(user.id) ?? 'user', // Default to 'user' if no profile role
  })) as UserDisplayData[];
}

/**
 * Renders the header section for the user management page
 * @example
 * PageHeader()
 * <div>...</div> // Returns a JSX element containing the page header
 * @returns {JSX.Element} JSX element containing the page header 
 * @description
 *   - Includes a title and a button to add a new user.
 *   - Uses Flexbox for layout styling.
 *   - Button component utilizes a child link to navigate to the user creation page.
 */
function PageHeader() {
  return (
    <div className="flex items-center justify-between">
      <h1 className="text-2xl font-bold">User Management</h1>
      <Button asChild>
        <Link href="/admin/users/new">
          <UserPlus className="mr-2 size-4" />
          Add New User
        </Link>
      </Button>
    </div>
  );
}

/**
* Renders a card component displaying a list of system users with a description and a header.
* @example
* UserListCard({ users: [{ id: 1, name: 'Alice' }, { id: 2, name: 'Bob' }] })
* //<Card>...</Card>
* @param {Object} props - The props containing user data.
* @param {Readonly<UserDisplayData[]>} props.users - An array of user data objects to display in the table.
* @returns {JSX.Element} A card component with a user table.
* @description
*   - Utilizes Card, CardHeader, CardTitle, CardDescription, and CardContent components to structure the card.
*   - Displays the total number of users in the card description.
*   - Users are displayed in a UserTable component that is passed a new array created from the `users` prop.
*/
function UserListCard({ users }: Readonly<{ users: Readonly<UserDisplayData[]> }>) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>System Users</CardTitle>
        <CardDescription>
          Manage user accounts and their roles. ({users.length} total)
        </CardDescription>
      </CardHeader>
      <CardContent>
        <UserTable users={[...users]} />
      </CardContent>
    </Card>
  );
}

export default async function UserManagementPage() {
  const users = await getUsersData();

  return (
    <div className="flex flex-col gap-4">
      <PageHeader />
      <UserListCard users={users} />
    </div>
  );
}
