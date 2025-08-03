'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { 
  Card, CardContent, CardDescription, CardHeader, CardTitle,
  Button, Badge
} from '@/lib/admin/shared-admin-imports';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Truck, MapPin, Clock, Star, Settings, BarChart3, Calendar } from 'lucide-react';
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
  contact_info: {
    phone?: string;
    email?: string;
    website?: string;
  };
  verification_status: string;
  data_quality_score: number;
  average_rating?: number;
  review_count?: number;
}

interface UserProfile {
  id: string;
  role: string;
  full_name?: string;
  email?: string;
}

export default function OwnerDashboard() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [myTrucks, setMyTrucks] = useState<FoodTruck[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    async function loadOwnerData() {
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

        if (profileData.role !== 'food_truck_owner') {
          router.push('/access-denied');
          return;
        }

        setProfile(profileData);

        // Get trucks owned by this user (you'll need to add owner_id to food_trucks table)
        const { data: trucksData, error: trucksError } = await supabase
          .from('food_trucks')
          .select('*')
          .eq('owner_id', user.id); // This column needs to be added to the schema

        if (trucksError) {
          console.warn('Could not load trucks:', trucksError.message);
          setMyTrucks([]);
        } else {
          setMyTrucks(trucksData || []);
        }

      } catch (err) {
        setError('Failed to load dashboard data');
        console.error('Dashboard error:', err);
      } finally {
        setLoading(false);
      }
    }

    loadOwnerData();
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
              <Truck className="h-8 w-8 text-primary" />
              <h1 className="text-xl font-semibold">Food Truck Owner Dashboard</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-muted-foreground">
                Welcome, {profile?.full_name || profile?.email || 'Owner'}
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
        
        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">My Trucks</CardTitle>
              <Truck className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{myTrucks.length}</div>
              <p className="text-xs text-muted-foreground">Active food trucks</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg Rating</CardTitle>
              <Star className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {myTrucks.length > 0 
                  ? (myTrucks.reduce((sum, truck) => sum + (truck.average_rating || 0), 0) / myTrucks.length).toFixed(1)
                  : 'N/A'
                }
              </div>
              <p className="text-xs text-muted-foreground">
                {myTrucks.reduce((sum, truck) => sum + (truck.review_count || 0), 0)} total reviews
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Verification</CardTitle>
              <Badge className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {myTrucks.filter(truck => truck.verification_status === 'verified').length}
              </div>
              <p className="text-xs text-muted-foreground">Verified trucks</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Data Quality</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {myTrucks.length > 0 
                  ? Math.round((myTrucks.reduce((sum, truck) => sum + (truck.data_quality_score || 0), 0) / myTrucks.length) * 100)
                  : 0
                }%
              </div>
              <p className="text-xs text-muted-foreground">Average quality score</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Dashboard Content */}
        <Tabs defaultValue="trucks" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="trucks">My Trucks</TabsTrigger>
            <TabsTrigger value="schedule">Schedule</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="trucks" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-semibold">My Food Trucks</h2>
              <Button>
                <Truck className="h-4 w-4 mr-2" />
                Add New Truck
              </Button>
            </div>

            {myTrucks.length === 0 ? (
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center py-12">
                    <Truck className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-medium mb-2">No trucks registered</h3>
                    <p className="text-muted-foreground mb-4">
                      Get started by adding your first food truck to the platform.
                    </p>
                    <Button>Add Your First Truck</Button>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-6">
                {myTrucks.map((truck) => (
                  <Card key={truck.id}>
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="flex items-center gap-2">
                            {truck.name}
                            <Badge variant={truck.verification_status === 'verified' ? 'default' : 'secondary'}>
                              {truck.verification_status}
                            </Badge>
                          </CardTitle>
                          <CardDescription>
                            {truck.cuisine_type?.join(', ') || 'No cuisine specified'}
                          </CardDescription>
                        </div>
                        <Button variant="outline" size="sm">
                          <Settings className="h-4 w-4 mr-2" />
                          Edit
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                        <div className="flex items-center gap-2">
                          <BarChart3 className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">
                            {Math.round((truck.data_quality_score || 0) * 100)}% complete
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="schedule">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Schedule Management
                </CardTitle>
                <CardDescription>
                  Manage your operating hours and event schedule
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12 text-muted-foreground">
                  <Clock className="h-12 w-12 mx-auto mb-4" />
                  <p>Schedule management coming soon...</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Analytics & Insights
                </CardTitle>
                <CardDescription>
                  Track your performance and customer engagement
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12 text-muted-foreground">
                  <BarChart3 className="h-12 w-12 mx-auto mb-4" />
                  <p>Analytics dashboard coming soon...</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Account Settings
                </CardTitle>
                <CardDescription>
                  Manage your account and preferences
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12 text-muted-foreground">
                  <Settings className="h-12 w-12 mx-auto mb-4" />
                  <p>Settings panel coming soon...</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
