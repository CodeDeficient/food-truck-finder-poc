import React from 'react';
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
          <Button onClick={() => { void loadNearbyTrucks(); }} variant="outline">
            Nearby Trucks
          </Button>
        )}
        {mounted && (
          <Button
            variant="outline"
            size="icon"
            onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
          >
            {resolvedTheme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </Button>
        )}
      </div>
    </header>
  );
}
