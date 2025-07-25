import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger, } from '@/components/ui/DropdownMenu';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { LogOut } from 'lucide-react';
/**
 * Renders a dropdown menu for user actions including settings and logout.
 * @example
 * UserMenu({ user: userObject, userInitials: "AB", handleSignOut: signOutFunction })
 * <DropdownMenu>...</DropdownMenu>
 * @param {Readonly<UserMenuProps>} {user, userInitials, handleSignOut} - Properties used to render the user menu interface.
 * @returns {JSX.Element} A user menu dropdown component.
 * @description
 *   - Fallback name display is "Admin" if the user's full name is unavailable.
 *   - Provides a default email display as "N/A" if the user's email is unavailable.
 *   - Handles sign-out using the `handleSignOut` method, and logs a warning if it fails.
 *   - Utilizes Avatar components to display user's profile picture or initials.
 */
export function UserMenu({ user, userInitials, handleSignOut }) {
    var _a, _b, _c, _d;
    return (<DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="secondary" size="icon" className="rounded-full">
          <Avatar>
            <AvatarImage src={(_a = user === null || user === void 0 ? void 0 : user.user_metadata) === null || _a === void 0 ? void 0 : _a.avatar_url} alt="Avatar"/>
            <AvatarFallback>{userInitials}</AvatarFallback>
          </Avatar>
          <span className="sr-only">Toggle user menu</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium">
              {(_c = (_b = user === null || user === void 0 ? void 0 : user.user_metadata) === null || _b === void 0 ? void 0 : _b.full_name) !== null && _c !== void 0 ? _c : 'Admin'}
            </p>
            <p className="text-xs text-muted-foreground">{(_d = user === null || user === void 0 ? void 0 : user.email) !== null && _d !== void 0 ? _d : 'N/A'}</p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem>Settings</DropdownMenuItem>
        <DropdownMenuItem>Support</DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => {
            handleSignOut().catch((error) => console.warn('Sign out failed:', error));
        }}>
          <LogOut className="mr-2 size-4"/>
          Logout
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>);
}
