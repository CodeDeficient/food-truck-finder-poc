'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Heart, MapPin, Star, Clock, Phone, Globe, Trash2, ArrowLeft } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import type { User } from '@supabase/supabase-js';
import type { FoodTruck } from '@/lib/types';

interface FavoriteTruck extends FoodTruck {
  favorite_id: string;
  favorited_at: string;
  total_reviews?: number;
}

export default function FavoritesPage() {
  const [user, setUser] = useState<User | null>(null);
  const [favorites, setFavorites] = useState<FavoriteTruck[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [removingFavorite, setRemovingFavorite] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const getFavorites = async () => {
      try {
        setLoading(true);
        setError(null);

        // Get current user
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        
        if (userError) {
          throw userError;
        }

        if (!user) {
          router.push('/login?next=/favorites');
          return;
        }

        setUser(user);

        // Get user's favorite food trucks
        const { data: favoritesData, error: favoritesError } = await supabase
          .from('user_favorites')
          .select(`
            id,
            created_at,
            food_trucks (*)
          `)
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (favoritesError) {
          throw favoritesError;
        }

        // Transform the data to match our interface
        const formattedFavorites: FavoriteTruck[] = (favoritesData || [])
          .filter((fav) => fav.food_trucks) // Only include valid food truck data
          .map((fav) => ({
            ...(fav.food_trucks as unknown as FoodTruck),
            favorite_id: fav.id,
            favorited_at: fav.created_at,
          }));

        setFavorites(formattedFavorites);

      } catch (error_) {
        console.error('Error loading favorites:', error_);
        setError(error_ instanceof Error ? error_.message : 'Failed to load favorites');
      } finally {
        setLoading(false);
      }
    };

    getFavorites();
  }, [router]);

  const handleRemoveFavorite = async (favoriteId: string, truckName: string) => {
    try {
      setRemovingFavorite(favoriteId);

      const { error } = await supabase
        .from('user_favorites')
        .delete()
        .eq('id', favoriteId);

      if (error) {
        throw error;
      }

      // Remove from local state
      setFavorites((prev) => prev.filter((fav) => fav.favorite_id !== favoriteId));

      // Show success feedback (you could add a toast here)
      console.log(`Removed ${truckName} from favorites`);

    } catch (error_) {
      console.error('Error removing favorite:', error_);
      setError(error_ instanceof Error ? error_.message : 'Failed to remove favorite');
    } finally {
      setRemovingFavorite(null);
    }
  };

  const formatHours = (hours: any) => {
    if (!hours || typeof hours !== 'object') {
      return 'Hours not available';
    }

    if (hours.closed) {
      return 'Closed';
    }

    if (hours.open && hours.close) {
      return `${hours.open} - ${hours.close}`;
    }

    return 'Hours not available';
  };

  const isOpenNow = (hours: any) => {
    if (!hours || typeof hours !== 'object' || hours.closed) {
      return false;
    }

    // Simple check - in a real app you'd want proper time zone handling
    const now = new Date();
    const currentHour = now.getHours();
    
    if (hours.open && hours.close) {
      const openHour = parseInt(hours.open.split(':')[0]);
      const closeHour = parseInt(hours.close.split(':')[0]);
      return currentHour >= openHour && currentHour < closeHour;
    }

    return false;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading your favorites...</p>
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

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <Button variant="ghost" size="sm" onClick={() => router.back()}>
                  <ArrowLeft className="size-4 mr-2" />
                  Back
                </Button>
                <Heart className="size-6 text-red-500 fill-current" />
                <h1 className="text-3xl font-bold">My Favorites</h1>
              </div>
              <p className="text-muted-foreground">
                Your saved food trucks - {favorites.length} total
              </p>
            </div>
            <Button variant="outline" onClick={() => router.push('/profile')}>
              View Profile
            </Button>
          </div>

          {/* Empty State */}
          {favorites.length === 0 && (
            <Card className="text-center py-12">
              <CardContent>
                <Heart className="size-12 text-muted-foreground mx-auto mb-4" />
                <CardTitle className="mb-2">No favorites yet</CardTitle>
                <CardDescription className="mb-4">
                  Start exploring food trucks and save your favorites here!
                </CardDescription>
                <Button asChild>
                  <a href="/">Discover Food Trucks</a>
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Favorites Grid */}
          {favorites.length > 0 && (
            <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2">
              {favorites.map((truck) => (
                <Card key={truck.favorite_id} className="overflow-hidden hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-xl mb-2 flex items-center gap-3">
                          {truck.name}
                          <Badge variant={isOpenNow(truck.operating_hours) ? 'default' : 'secondary'}>
                            {isOpenNow(truck.operating_hours) ? 'Open' : 'Closed'}
                          </Badge>
                        </CardTitle>
                        
                        {truck.current_location?.address && (
                          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                            <MapPin className="size-4" />
                            {truck.current_location.address}
                          </div>
                        )}

                        {truck.cuisine_type && truck.cuisine_type.length > 0 && (
                          <div className="flex flex-wrap gap-1 mb-2">
                            {truck.cuisine_type.slice(0, 3).map((cuisine, index) => (
                              <Badge key={index} variant="outline" className="text-xs">
                                {cuisine}
                              </Badge>
                            ))}
                            {truck.cuisine_type.length > 3 && (
                              <Badge variant="outline" className="text-xs">
                                +{truck.cuisine_type.length - 3} more
                              </Badge>
                            )}
                          </div>
                        )}
                      </div>

                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveFavorite(truck.favorite_id, truck.name)}
                        disabled={removingFavorite === truck.favorite_id}
                        className="text-red-500 hover:text-red-700 hover:bg-red-50"
                      >
                        {removingFavorite === truck.favorite_id ? (
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-500"></div>
                        ) : (
                          <Trash2 className="size-4" />
                        )}
                      </Button>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    {/* Operating Hours */}
                    {truck.operating_hours && (
                      <div className="flex items-center gap-2 text-sm">
                        <Clock className="size-4 text-muted-foreground" />
                        <span>{formatHours(truck.operating_hours)}</span>
                      </div>
                    )}

                    {/* Rating */}
                    {truck.average_rating && (
                      <div className="flex items-center gap-2 text-sm">
                        <Star className="size-4 text-yellow-500 fill-current" />
                        <span>{truck.average_rating.toFixed(1)} / 5.0</span>
                        {truck.total_reviews && (
                          <span className="text-muted-foreground">
                            ({truck.total_reviews} reviews)
                          </span>
                        )}
                      </div>
                    )}

                    {/* Contact Info */}
                    <div className="flex items-center gap-4 text-sm">
                      {truck.contact_info?.phone && (
                        <div className="flex items-center gap-1">
                          <Phone className="size-4 text-muted-foreground" />
                          <span className="text-muted-foreground">Phone</span>
                        </div>
                      )}
                      {truck.contact_info?.website && (
                        <div className="flex items-center gap-1">
                          <Globe className="size-4 text-muted-foreground" />
                          <span className="text-muted-foreground">Website</span>
                        </div>
                      )}
                    </div>

                    <Separator />

                    {/* Actions */}
                    <div className="flex items-center justify-between">
                      <p className="text-xs text-muted-foreground">
                        Added {new Date(truck.favorited_at).toLocaleDateString()}
                      </p>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" asChild>
                          <a href={`/trucks/${truck.id}`}>
                            View Details
                          </a>
                        </Button>
                        {truck.contact_info?.phone && (
                          <Button variant="outline" size="sm" asChild>
                            <a href={`tel:${truck.contact_info.phone}`}>
                              Call
                            </a>
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Footer Actions */}
          {favorites.length > 0 && (
            <div className="mt-8 text-center">
              <Button variant="outline" asChild>
                <a href="/">
                  Discover More Food Trucks
                </a>
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
