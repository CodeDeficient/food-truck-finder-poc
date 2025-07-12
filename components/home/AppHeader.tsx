
// Removed useThemeSwitcher import
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Sun, Moon } from 'lucide-react';

interface AppHeaderProps {
  readonly mounted: boolean;
  readonly resolvedTheme?: string;
  readonly setTheme: (theme: string) => void;
  readonly searchTerm: string;
  readonly setSearchTerm: (term: string) => void;
  readonly userLocation?: { lat: number; lng: number };
  readonly loadNearbyTrucks: () => void;
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
}: AppHeaderProps) {
  return (
    <header className="bg-white dark:bg-slate-800 shadow-md p-4 flex items-center justify-between">
      <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Food Truck Finder</h1>
      <div className="flex items-center gap-4">
        <Input
          type="text"
          placeholder="Search for trucks..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-64"
        />
        {userLocation && (
          <Button onClick={loadNearbyTrucks} variant="outline">
            Nearby Trucks
          </Button>
        )}
        {mounted && (
          <Button
            variant="outline"
            size="icon"
            onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
          >
            {resolvedTheme === 'dark' ? <Sun className="size-5" /> : <Moon className="size-5" />}
          </Button>
        )}
      </div>
    </header>
  );
}
