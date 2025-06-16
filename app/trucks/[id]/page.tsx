import React from 'react';
import { FoodTruckService } from '@/lib/supabase';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  MapPin,
  Phone,
  Mail,
  Globe,
  Clock,
  Star,
  Users,
  ArrowLeft
} from 'lucide-react';
import Link from 'next/link';

interface FoodTruckDetailPageProps {
  readonly params: {
    readonly id: string;
  };
}

export default async function FoodTruckDetailPage({ params }: FoodTruckDetailPageProps) {
  const truck = await FoodTruckService.getTruckById(params.id);

  if (!truck) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-slate-900">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col items-center justify-center min-h-[400px]">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Food Truck Not Found</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">The requested food truck could not be found.</p>
            <Button asChild className="mt-4">
              <Link href="/">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Map
              </Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col gap-6 max-w-4xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="outline" size="sm" asChild>
                <Link href="/">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Map
                </Link>
              </Button>
              <div>
                <h1 className="text-3xl font-bold tracking-tight dark:text-gray-100">{truck.name}</h1>
                <p className="text-muted-foreground dark:text-gray-400">
                  Food truck details and information
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Basic Information */}
            <Card className="dark:bg-slate-800 dark:border-slate-700">
              <CardHeader>
                <CardTitle className="dark:text-gray-100">About</CardTitle>
                <CardDescription className="dark:text-gray-400">Food truck information</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Name</label>
                  <p className="text-lg font-semibold dark:text-gray-100">{truck.name}</p>
                </div>
                
                {truck.description && (
                  <div>
                    <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Description</label>
                    <p className="text-gray-900 dark:text-gray-200">{truck.description}</p>
                  </div>
                )}

                {truck.cuisine_type && (
                  <div>
                    <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Cuisine Type</label>
                    <p className="text-gray-900 dark:text-gray-200">{truck.cuisine_type}</p>
                  </div>
                )}

                {truck.price_range && (
                  <div>
                    <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Price Range</label>
                    <Badge variant="outline" className="ml-2">
                      {truck.price_range}
                    </Badge>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Contact Information */}
            <Card className="dark:bg-slate-800 dark:border-slate-700">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 dark:text-gray-100">
                  <Phone className="h-5 w-5" />
                  Contact Information
                </CardTitle>
                <CardDescription className="dark:text-gray-400">Get in touch</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {truck.contact_info?.phone ? (
                  <div className="flex items-center gap-3">
                    <Phone className="h-4 w-4 text-gray-500" />
                    <div>
                      <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Phone</label>
                      <a 
                        href={`tel:${truck.contact_info.phone}`}
                        className="block text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                      >
                        {truck.contact_info.phone}
                      </a>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-3 text-gray-400">
                    <Phone className="h-4 w-4" />
                    <span className="text-sm">No phone number available</span>
                  </div>
                )}

                {truck.contact_info?.email ? (
                  <div className="flex items-center gap-3">
                    <Mail className="h-4 w-4 text-gray-500" />
                    <div>
                      <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Email</label>
                      <a 
                        href={`mailto:${truck.contact_info.email}`}
                        className="block text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                      >
                        {truck.contact_info.email}
                      </a>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-3 text-gray-400">
                    <Mail className="h-4 w-4" />
                    <span className="text-sm">No email available</span>
                  </div>
                )}

                {truck.contact_info?.website ? (
                  <div className="flex items-center gap-3">
                    <Globe className="h-4 w-4 text-gray-500" />
                    <div>
                      <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Website</label>
                      <a 
                        href={truck.contact_info.website} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="block text-blue-600 hover:text-blue-800 underline dark:text-blue-400 dark:hover:text-blue-300"
                      >
                        Visit Website
                      </a>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-3 text-gray-400">
                    <Globe className="h-4 w-4" />
                    <span className="text-sm">No website available</span>
                  </div>
                )}

                {/* Social Media */}
                {truck.social_media && Object.keys(truck.social_media).length > 0 && (
                  <div>
                    <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Social Media</label>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {truck.social_media.instagram && (
                        <a
                          href={`https://instagram.com/${truck.social_media.instagram}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 px-2 py-1 bg-pink-100 text-pink-800 rounded-md text-sm hover:bg-pink-200 dark:bg-pink-900 dark:text-pink-200"
                        >
                          <Globe className="h-3 w-3" />
                          Instagram
                        </a>
                      )}
                      {truck.social_media.facebook && (
                        <a
                          href={`https://facebook.com/${truck.social_media.facebook}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 rounded-md text-sm hover:bg-blue-200 dark:bg-blue-900 dark:text-blue-200"
                        >
                          <Globe className="h-3 w-3" />
                          Facebook
                        </a>
                      )}
                      {truck.social_media.twitter && (
                        <a
                          href={`https://twitter.com/${truck.social_media.twitter}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 px-2 py-1 bg-sky-100 text-sky-800 rounded-md text-sm hover:bg-sky-200 dark:bg-sky-900 dark:text-sky-200"
                        >
                          <Globe className="h-3 w-3" />
                          Twitter
                        </a>
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Location Information */}
            <Card className="dark:bg-slate-800 dark:border-slate-700">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 dark:text-gray-100">
                  <MapPin className="h-5 w-5" />
                  Location
                </CardTitle>
                <CardDescription className="dark:text-gray-400">Current location</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {truck.current_location?.address ? (
                  <div>
                    <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Address</label>
                    <p className="text-gray-900 dark:text-gray-200">{truck.current_location.address}</p>
                  </div>
                ) : (
                  <p className="text-gray-400 text-sm">No address available</p>
                )}

                {truck.current_location?.lat && truck.current_location?.lng && (
                  <div>
                    <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Coordinates</label>
                    <p className="text-gray-900 dark:text-gray-200 text-sm">
                      {truck.current_location.lat.toFixed(6)}, {truck.current_location.lng.toFixed(6)}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Operating Hours */}
            <Card className="dark:bg-slate-800 dark:border-slate-700">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 dark:text-gray-100">
                  <Clock className="h-5 w-5" />
                  Operating Hours
                </CardTitle>
                <CardDescription className="dark:text-gray-400">Daily schedule</CardDescription>
              </CardHeader>
              <CardContent>
                {truck.operating_hours && Object.keys(truck.operating_hours).length > 0 ? (
                  <div className="space-y-2">
                    {['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'].map((day) => {
                      const dayData = truck.operating_hours?.[day as keyof typeof truck.operating_hours] as { closed?: boolean; open?: string; close?: string } | undefined;
                      const dayName = day.charAt(0).toUpperCase() + day.slice(1);
                      
                      return (
                        <div key={day} className="flex justify-between items-center">
                          <span className="text-sm font-medium dark:text-gray-200">{dayName}</span>
                          <span className="text-sm text-gray-600 dark:text-gray-400">
                            {dayData?.closed ? 'Closed' : `${dayData?.open ?? 'N/A'} - ${dayData?.close ?? 'N/A'}`}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-gray-400 text-sm">Operating hours not available</p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Ratings & Reviews */}
          {(truck as { average_rating?: number }).average_rating && (
            <Card className="dark:bg-slate-800 dark:border-slate-700">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 dark:text-gray-100">
                  <Star className="h-5 w-5" />
                  Ratings & Reviews
                </CardTitle>
                <CardDescription className="dark:text-gray-400">Customer feedback</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <div className="flex">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`h-6 w-6 ${
                            star <= Math.round((truck as { average_rating?: number }).average_rating ?? 0)
                              ? 'text-yellow-400 fill-current'
                              : 'text-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-xl font-semibold dark:text-gray-100">{((truck as { average_rating?: number }).average_rating ?? 0).toFixed(1)}</span>
                  </div>
                  {(truck as { review_count?: number }).review_count && (
                    <div className="flex items-center gap-1 text-gray-600 dark:text-gray-400">
                      <Users className="h-4 w-4" />
                      <span className="text-sm">{(truck as { review_count?: number }).review_count} reviews</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
