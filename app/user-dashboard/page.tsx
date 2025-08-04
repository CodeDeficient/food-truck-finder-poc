'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { 
  Card, CardContent, CardDescription, CardHeader, CardTitle,
  Button, Badge
} from '@/lib/admin/shared-admin-imports';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Heart, Star, Truck, MapPin } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface FoodTruck {
  id: string;
  name: string;
  cuisine_type: string[];
  current_location: {
    address?: string;
    city?: string;
    state?: string;
  };
  average_rating?: number;
  review_count?: number;
}

interface UserProfile {
  id: string;
  role: string;
  full_name?: string;
  email?: string;
}

export default function UserDashboard() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [favoriteTrucks, setFavoriteTrucks] = useState<FoodTruck[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    async function loadUserData() {
      try {
        setLoading(true);

        // Get current user
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        if (userError || !user) {
          router.push('/login');
          return;
        }

        // Get user profile
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        if (profileError) {
          setError('Failed to load profile');
          return;
        }

        if (profileData.role !== 'customer') {
          router.push('/access-denied');
          return;
        }

        setProfile(profileData);

        // Get favorite trucks using the view we created
        const { data: favoriteTrucksData, error: favoriteTrucksError } = await supabase
          .from('favorite_trucks')
          .select('*')
          .eq('user_id', user.id);

        if (favoriteTrucksError) {
          console.warn('Could not load favorite trucks:', favoriteTrucksError.message);
          setFavoriteTrucks([]);
        } else {
          setFavoriteTrucks(favoriteTrucksData || []);
        }

      } catch (err) {
        setError('Failed to load dashboard data');
        console.error('Dashboard error:', err);
      } finally {
        setLoading(false);
      }
    }

    loadUserData();
  }, [router]);

  async function handleSignOut() {
    await supabase.auth.signOut();
    router.push('/login');
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Alert className="max-w-md">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <Heart className="h-8 w-8 text-primary" />
              <h1 className="text-xl font-semibold">User Dashboard</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-muted-foreground">
                Welcome, {profile?.full_name || profile?.email || 'User'}
              </span>
              <Button variant="outline" onClick={handleSignOut}>
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs defaultValue="favorites" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="favorites">Favorite Trucks</TabsTrigger>
            <TabsTrigger value="profile">Profile</TabsTrigger>
          </TabsList>

          <TabsContent value="favorites" className="space-y-6">
            <h2 className="text-lg font-semibold">Your Favorite Food Trucks</h2>

            {favoriteTrucks.length === 0 ? (
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center py-12">
                    <Truck className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-medium mb-2">No favorite trucks yet</h3>
                    <p className="text-muted-foreground mb-4">
                      Start exploring trucks and save your favorites.
                    </p>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-6">
                {favoriteTrucks.map(truck => (
                  <Card key={truck.id}>
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="flex items-center gap-2">
                            {truck.name}
                          </CardTitle>
                          <CardDescription>
                            {truck.cuisine_type?.join(', ') || 'No cuisine specified'}
                          </CardDescription>
                        </div>
                        <Button variant="outline" size="sm">
                          <MapPin className="h-4 w-4 mr-2" /> View
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">
                            {truck.current_location?.address || 'Location not set'}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Star className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">
                            {truck.average_rating?.toFixed(1) || 'No ratings'} 
                            {truck.review_count ? ` (${truck.review_count} reviews)` : ''}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="profile">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  Profile Info
                </CardTitle>
                <CardDescription>
                  Manage your profile details
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12 text-muted-foreground">
                  <p>Profile management coming soon...</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

        </Tabs>
      </main>
    </div>
  );
}

