import React from 'react';
import { supabaseAdmin } from '@/lib/supabase';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { UserPlus } from 'lucide-react';
import Link from 'next/link';
import { User, PostgrestError } from '@supabase/supabase-js';
import { UserTable } from '@/components/admin/users/UserTable';

interface UserDisplayData {
  id: string;
  email: string | undefined;
  created_at: string;
  last_sign_in_at: string | undefined;
  role: string;
}

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

  interface Profile {
    id: string;
    role: string;
  }

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

function PageHeader() {
  return (
    <div className="flex items-center justify-between">
      <h1 className="text-2xl font-bold">User Management</h1>
      <Button asChild>
        <Link href="/admin/users/new">
          <UserPlus className="mr-2 h-4 w-4" />
          Add New User
        </Link>
      </Button>
    </div>
  );
}

function UserListCard({ users }: { users: Readonly<UserDisplayData[]> }) {
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
