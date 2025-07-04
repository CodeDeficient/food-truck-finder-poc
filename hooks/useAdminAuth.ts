import { useAuth } from '@/app/auth/AuthProvider';
import { useRouter } from 'next/navigation';

/**
 * Provides admin authentication functionalities and user information.
 * @example
 * useAdminAuth()
 * { user: <UserObject>, userInitials: "JD", handleSignOut: <Function> }
 * @param {void} None - This hook does not accept any parameters.
 * @returns {Object} An object containing the user details, their initials, and a sign-out function.
 * @description
 *   - Retrieves user initials from user's full name or email.
 *   - Redirects user to the homepage upon signing out.
 *   - Uses authentication and routing hooks for functionality.
 */
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
