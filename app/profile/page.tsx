'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { MapPin, Phone, Mail, Calendar, Settings, LogOut } from 'lucide-react';
import { getSupabase } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import type { User } from '@supabase/supabase-js';

interface UserProfile {
  id: string;
  email: string;
  full_name?: string;
  avatar_url?: string;
  role: 'customer' | 'food_truck_owner' | 'admin';
  phone?: string;
  location?: string;
  created_at: string;
  updated_at: string;
}

export default function ProfilePage() {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);
  const router = useRouter();
  
  // Fix hydration issues by ensuring we only run on client side
  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    
    const getProfile = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const supabase = getSupabase();

        // Get current user
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        
        if (userError) {
          throw userError;
        }

        if (!user) {
          router.push('/login');
          return;
        }

        setUser(user);

        // Get user profile from profiles table
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        if (profileError) {
          // If profile doesn't exist, create a basic one
          if (profileError.code === 'PGRST116') {
            const { data: newProfile, error: createError } = await supabase
              .from('profiles')
              .insert({
                id: user.id,
                email: user.email,
                full_name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'User',
                role: 'customer',
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
              })
              .select()
              .single();

            if (createError) {
              throw createError;
            }

            setProfile(newProfile);
          } else {
            throw profileError;
          }
        } else {
          setProfile(profileData);
        }

      } catch (error_) {
        console.error('Error loading profile:', error_);
        setError(error_ instanceof Error ? error_.message : 'Failed to load profile');
      } finally {
        setLoading(false);
      }
    };

    getProfile();
  }, [router, mounted]);

  const handleSignOut = async () => {
    try {
      const supabase = getSupabase();
      const { error } = await supabase.auth.signOut();
      if (error) {
        throw error;
      }
      router.push('/');
    } catch (error_) {
      console.error('Error signing out:', error_);
      setError(error_ instanceof Error ? error_.message : 'Failed to sign out');
    }
  };

  const getUserInitials = () => {
    if (profile?.full_name) {
      return profile.full_name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);
    }
    
    if (user?.email) {
      return user.email.slice(0, 2).toUpperCase();
    }
    
    return 'U';
  };

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case 'admin':
        return 'destructive';
      case 'food_truck_owner':
        return 'default';
      case 'customer':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  const formatRoleDisplay = (role: string) => {
    switch (role) {
      case 'food_truck_owner':
        return 'Food Truck Owner';
      case 'admin':
        return 'Administrator';
      case 'customer':
        return 'Customer';
      default:
        return role;
    }
  };

  // Show loading state during hydration
  if (!mounted || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading your profile...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-destructive">Error</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">{error}</p>
            <Button onClick={() => window.location.reload()} className="w-full">
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!user || !profile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Profile Not Found</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">Unable to load your profile information.</p>
            <Button onClick={() => router.push('/')} className="w-full">
              Go Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold">Your Profile</h1>
              <p className="text-muted-foreground">Manage your account settings and preferences</p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                <Settings className="size-4 mr-2" />
                Settings
              </Button>
              <Button variant="destructive" size="sm" onClick={handleSignOut}>
                <LogOut className="size-4 mr-2" />
                Sign Out
              </Button>
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-3">
            {/* Profile Summary Card */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <div className="flex items-start gap-4">
                    <Avatar className="size-20">
                      <AvatarImage src={profile.avatar_url} alt={profile.full_name || 'User'} />
                      <AvatarFallback className="text-lg">
                        {getUserInitials()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <CardTitle className="text-2xl mb-2">
                        {profile.full_name || 'Welcome!'}
                      </CardTitle>
                      <div className="flex items-center gap-2 mb-3">
                        <Badge variant={getRoleBadgeVariant(profile.role)}>
                          {formatRoleDisplay(profile.role)}
                        </Badge>
                      </div>
                      <CardDescription className="text-base">
                        {profile.role === 'admin' 
                          ? 'You have administrative access to the food truck finder platform.'
                          : profile.role === 'food_truck_owner'
                          ? 'Manage your food truck listings and connect with customers.'
                          : 'Discover amazing food trucks in your area and save your favorites.'}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
              </Card>
            </div>

            {/* Quick Actions */}
            <div>
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button className="w-full justify-start" variant="outline" asChild>
                    <a href="/favorites">
                      <MapPin className="size-4 mr-2" />
                      My Favorites
                    </a>
                  </Button>
                  {profile.role === 'admin' && (
                    <Button className="w-full justify-start" variant="outline" asChild>
                      <a href="/admin">
                        <Settings className="size-4 mr-2" />
                        Admin Dashboard
                      </a>
                    </Button>
                  )}
                  <Button className="w-full justify-start" variant="outline">
                    <Settings className="size-4 mr-2" />
                    Account Settings
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Account Information */}
          <div className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Account Information</CardTitle>
                <CardDescription>Your account details and contact information</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-6 md:grid-cols-2">
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <Mail className="size-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium">Email</p>
                        <p className="text-sm text-muted-foreground">••••••@••••••</p>
                        <p className="text-xs text-muted-foreground">Email hidden for security</p>
                      </div>
                    </div>
                    
                    {profile.phone && (
                      <div className="flex items-center gap-3">
                        <Phone className="size-4 text-muted-foreground" />
                        <div>
                          <p className="text-sm font-medium">Phone</p>
                          <p className="text-sm text-muted-foreground">{profile.phone}</p>
                        </div>
                      </div>
                    )}
                    
                    {profile.location && (
                      <div className="flex items-center gap-3">
                        <MapPin className="size-4 text-muted-foreground" />
                        <div>
                          <p className="text-sm font-medium">Location</p>
                          <p className="text-sm text-muted-foreground">{profile.location}</p>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <Calendar className="size-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium">Member Since</p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(profile.created_at).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <Settings className="size-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium">Account ID</p>
                        <p className="text-sm text-muted-foreground font-mono">
                          {profile.id.slice(0, 8)}...
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
                
                <Separator />
                
                <div className="flex justify-end">
                  <Button variant="outline">
                    <Settings className="size-4 mr-2" />
                    Edit Profile
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
