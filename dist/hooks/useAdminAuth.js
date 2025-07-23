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
    var _a, _b, _c;
    const { user, signOut } = useAuth();
    const router = useRouter();
    const handleSignOut = async () => {
        await signOut();
        router.push('/');
    };
    const userInitials = ((_a = user === null || user === void 0 ? void 0 : user.user_metadata) === null || _a === void 0 ? void 0 : _a.full_name) == undefined
        ? ((_c = (_b = user === null || user === void 0 ? void 0 : user.email) === null || _b === void 0 ? void 0 : _b.slice(0, 2).toUpperCase()) !== null && _c !== void 0 ? _c : 'AD')
        : user.user_metadata.full_name
            .split(' ')
            .map((n) => n[0])
            .join('')
            .toUpperCase();
    return { user, userInitials, handleSignOut };
}
