
// Removed useThemeSwitcher import
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Sun, Moon } from 'lucide-react';
import { AvatarMenu } from '@/components/auth';
import type { User } from '@supabase/supabase-js';

interface AppHeaderProps {
  readonly mounted: boolean;
  readonly resolvedTheme?: string;
  readonly setTheme: (theme: string) => void;
  readonly searchTerm: string;
  readonly setSearchTerm: (term: string) => void;
  readonly userLocation?: { lat: number; lng: number };
  readonly loadNearbyTrucks: () => void;
  readonly isAuthenticated?: boolean;
  readonly loadingAuth?: boolean;
  readonly user?: User | null;
  readonly openModal?: () => void;
}

/**
 * Renders the main header for the Food Truck Finder application with theme toggle and search functionality.
 * @example
 * AppHeader({
 *   mounted: true,
 *   resolvedTheme: 'dark',
 *   setTheme: (theme) => console.log(theme),
 *   searchTerm: '',
 *   setSearchTerm: (term) => console.log(term),
 *   userLocation: { latitude: 40.7128, longitude: -74.0060 },
 *   loadNearbyTrucks: () => console.log('Loading trucks...')
 * })
 * <header>...</header>
 * @param {boolean} mounted - Determines if components are mounted to enable interactions.
 * @param {string} resolvedTheme - Current theme ('light' or 'dark') to toggle the application display.
 * @param {Function} setTheme - Function to toggle the theme between 'light' and 'dark'.
 * @param {string} searchTerm - Current search term used to filter nearby trucks.
 * @param {Function} setSearchTerm - Function to update the search term.
 * @param {Object} userLocation - The user's current geographical location to find nearby trucks.
 * @param {Function} loadNearbyTrucks - Function to load nearby food trucks based on user location.
 * @returns {JSX.Element} The header element with search input, theme toggle, and location-based button.
 * @description
 *   - Displays the application title prominently in the header.
 *   - Conditional rendering of components based on user location and component mount status.
 *   - Facilitates user interaction with theme toggling based on current theme state.
 */
export function AppHeader({
  mounted,
  resolvedTheme,
  setTheme,
  searchTerm,
  setSearchTerm,
  userLocation,
  loadNearbyTrucks,
  isAuthenticated,
  loadingAuth,
  user,
  openModal,
}: AppHeaderProps) {
  return (
    <header className="bg-white dark:bg-slate-800 shadow-md p-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl md:text-2xl font-bold text-gray-800 dark:text-white">
          Food Truck Finder
        </h1>
        <div className="flex items-center gap-2 md:gap-4">
          {/* Search input - hidden on small screens */}
          <Input
            type="text"
            placeholder="Search for trucks..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-32 md:w-64 hidden sm:block"
          />
          {/* Nearby Trucks button - responsive sizing */}
          {userLocation && (
            <Button onClick={loadNearbyTrucks} variant="outline" size="sm" className="hidden md:inline-flex">
              Nearby Trucks
            </Button>
          )}
          {/* Theme toggle button */}
          {mounted && (
            <Button
              variant="outline"
              size="icon"
              onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
              className="h-8 w-8"
            >
              {resolvedTheme === 'dark' ? <Sun className="size-4" /> : <Moon className="size-4" />}
            </Button>
          )}
          {/* Auth section */}
          {loadingAuth === true ? (
            <Skeleton className="h-8 w-16 md:w-20" />
          ) : (
            <>
              {isAuthenticated === true ? (
                <AvatarMenu mounted={mounted} resolvedTheme={resolvedTheme} user={user ?? null} />
              ) : (
                <Button onClick={openModal} className="h-8 text-sm px-3">
                  Sign In
                </Button>
              )}
            </>
          )}
        </div>
      </div>
      {/* Mobile search bar */}
      <div className="mt-3 sm:hidden">
        <Input
          type="text"
          placeholder="Search for trucks..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full"
        />
      </div>
    </header>
  );
}
