import { useAuth } from '@/app/auth/AuthProvider';
import { useRouter } from 'next/navigation';

export function useAdminAuth() {
  const { user, signOut } = useAuth();
  const router = useRouter();

  const handleSignOut = async () => {
    await signOut();
    router.push('/');
  };

  const userInitials =
    user?.user_metadata?.full_name == undefined
      ? (user?.email?.slice(0, 2).toUpperCase() ?? 'AD')
      : (user.user_metadata.full_name as string)
          .split(' ')
          .map((n: string) => n[0])
          .join('')
          .toUpperCase();

  return { user, userInitials, handleSignOut };
}
