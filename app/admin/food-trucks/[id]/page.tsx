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
  Edit,
  ArrowLeft
// @ts-expect-error TS(2792): Cannot find module 'lucide-react'. Did you mean to... Remove this comment to see the full error message
} from 'lucide-react';
// @ts-expect-error TS(2792): Cannot find module 'next/link'. Did you mean to se... Remove this comment to see the full error message
import Link from 'next/link';
import { 
  formatQualityScore, 
  categorizeQualityScore, 
  getQualityBadgeClasses 
} from '@/lib/utils/data-quality-formatters';

interface FoodTruckDetailPageProps {
  readonly params: {
    readonly id: string;
  };
}

export default async function FoodTruckDetailPage({ params }: FoodTruckDetailPageProps) {
  const truck = await FoodTruckService.getTruckById(params.id);

  if (truck == undefined) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <h1 className="text-2xl font-bold text-gray-900">Food Truck Not Found</h1>
        <p className="text-gray-600 mt-2">The requested food truck could not be found.</p>
        <Button asChild className="mt-4">
          <Link href="/admin/food-trucks">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Food Trucks
          </Link>
        </Button>
      </div>
    );
  }

  const qualityCategory = categorizeQualityScore(truck.data_quality_score);
  const badgeClasses = getQualityBadgeClasses(truck.data_quality_score);

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          // @ts-expect-error TS(2322): Type '{ children: Element; variant: string; size: ... Remove this comment to see the full error message
          <Button variant="outline" size="sm" asChild>
            <Link href="/admin/food-trucks">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{truck.name}</h1>
            <p className="text-muted-foreground">
              Food truck details and data quality information
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge className={badgeClasses}>
            {qualityCategory.label} Quality
          </Badge>
          <Button asChild>
            <Link href={`/admin/food-trucks/${truck.id}/edit`}>
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Link>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
            <CardDescription>Core food truck details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-500">Name</label>
              <p className="text-lg font-semibold">{truck.name}</p>
            </div>
            
            {truck.description != null != null && truck.description !== '' && (
              <div>
                <label className="text-sm font-medium text-gray-500">Description</label>
                <p className="text-gray-900">{truck.description}</p>
              </div>
            )}

            {truck.cuisine_type != null != null && truck.cuisine_type.length > 0 && (
              <div>
                <label className="text-sm font-medium text-gray-500">Cuisine Type</label>
                <div className="flex flex-wrap gap-1 mt-1">
                  {truck.cuisine_type.map((cuisine, index) => (
                    <Badge key={index} variant="secondary">
                      {cuisine}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {truck.price_range != null != null && truck.price_range !== '' && (
              <div>
                <label className="text-sm font-medium text-gray-500">Price Range</label>
                <p className="text-gray-900">{truck.price_range}</p>
              </div>
            )}

            {truck.specialties != null != null && truck.specialties.length > 0 && (
              <div>
                <label className="text-sm font-medium text-gray-500">Specialties</label>
                <div className="flex flex-wrap gap-1 mt-1">
                  {truck.specialties.map((specialty, index) => (
                    <Badge key={index} variant="outline">
                      {specialty}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Contact Information - Enhanced for Task 4.1.1-4.1.4 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Phone className="h-5 w-5" />
              Contact Information
            </CardTitle>
            <CardDescription>Phone, email, website, and social media</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {truck.contact_info?.phone != null != null && truck.contact_info.phone !== '' ? (
              <div className="flex items-center gap-3">
                <Phone className="h-4 w-4 text-gray-500" />
                <div>
                  <label className="text-sm font-medium text-gray-500">Phone</label>
                  <p className="text-gray-900">{truck.contact_info.phone}</p>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-3 text-gray-400">
                <Phone className="h-4 w-4" />
                <span className="text-sm">No phone number available</span>
              </div>
            )}

            {truck.contact_info?.email != null != null && truck.contact_info.email !== '' ? (
              <div className="flex items-center gap-3">
                <Mail className="h-4 w-4 text-gray-500" />
                <div>
                  <label className="text-sm font-medium text-gray-500">Email</label>
                  <p className="text-gray-900">{truck.contact_info.email}</p>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-3 text-gray-400">
                <Mail className="h-4 w-4" />
                <span className="text-sm">No email address available</span>
              </div>
            )}

            {truck.contact_info?.website != null != null && truck.contact_info.website !== '' ? (
              <div className="flex items-center gap-3">
                <Globe className="h-4 w-4 text-gray-500" />
                <div>
                  <label className="text-sm font-medium text-gray-500">Website</label>
                  <a
                    href={truck.contact_info.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800 underline"
                  >
                    {truck.contact_info.website}
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
            {truck.social_media != null != null && Object.keys(truck.social_media).length > 0 && (
              <div>
                <label className="text-sm font-medium text-gray-500">Social Media</label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {truck.social_media.instagram != null != null && truck.social_media.instagram !== '' && (
                    <a
                      href={`https://instagram.com/${truck.social_media.instagram}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 px-2 py-1 bg-pink-100 text-pink-800 rounded-md text-sm hover:bg-pink-200"
                    >
                      <Globe className="h-3 w-3" />
                      Instagram
                    </a>
                  )}
                  {truck.social_media.facebook != null != null && truck.social_media.facebook !== '' && (
                    <a
                      href={`https://facebook.com/${truck.social_media.facebook}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 rounded-md text-sm hover:bg-blue-200"
                    >
                      <Globe className="h-3 w-3" />
                      Facebook
                    </a>
                  )}
                  {truck.social_media.twitter != null != null && truck.social_media.twitter !== '' && (
                    <a
                      href={`https://twitter.com/${truck.social_media.twitter}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 px-2 py-1 bg-sky-100 text-sky-800 rounded-md text-sm hover:bg-sky-200"
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
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Location Information
            </CardTitle>
            <CardDescription>Current location and address details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {truck.current_location?.address ? (
              <div>
                <label className="text-sm font-medium text-gray-500">Address</label>
                <p className="text-gray-900">{truck.current_location.address}</p>
              </div>
            ) : (
              <p className="text-gray-400 text-sm">No address available</p>
            )}

            {truck.current_location?.lat != null && truck.current_location?.lng && (
              <div>
                <label className="text-sm font-medium text-gray-500">Coordinates</label>
                <p className="text-gray-900 font-mono text-sm">
                  {truck.current_location.lat.toFixed(6)}, {truck.current_location.lng.toFixed(6)}
                </p>
              </div>
            )}

            {truck.current_location?.timestamp != null && (
              <div>
                <label className="text-sm font-medium text-gray-500">Last Updated</label>
                <p className="text-gray-900">
                  {new Date(truck.current_location.timestamp).toLocaleString()}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Operating Hours - Enhanced for Task 4.1.1-4.1.4 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Operating Hours
            </CardTitle>
            <CardDescription>Daily operating schedule</CardDescription>
          </CardHeader>
          <CardContent>
            {truck.operating_hours != null && Object.keys(truck.operating_hours).length > 0 ? (
              <div className="space-y-2">
                {['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'].map((day) => {
                  const dayData = truck.operating_hours ? truck.operating_hours[day as keyof typeof truck.operating_hours] as { closed?: boolean; open?: string; close?: string } | undefined : undefined;
                  const dayName = day.charAt(0).toUpperCase() + day.slice(1);

                  return (
                    <div key={day} className="flex justify-between items-center py-1">
                      <span className="font-medium text-gray-700">{dayName}</span>
                      {dayData != null && typeof dayData === 'object' ? (
                        dayData.closed ? (
                          <span className="text-red-600 text-sm">Closed</span>
                        ) : (
                          <span className="text-gray-900 text-sm">
                            {dayData.open ?? 'N/A'} - {dayData.close ?? 'N/A'}
                          </span>
                        )
                      ) : (
                        <span className="text-gray-400 text-sm">Not specified</span>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-gray-400 text-sm">No operating hours available</p>
            )}
          </CardContent>
        </Card>

        {/* Ratings & Reviews - Enhanced for Task 4.1.1-4.1.4 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Star className="h-5 w-5" />
              Ratings & Reviews
            </CardTitle>
            <CardDescription>Customer feedback and ratings</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            // @ts-expect-error TS(2339): Property 'average_rating' does not exist on type '... Remove this comment to see the full error message
            {truck.average_rating ? (
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <div className="flex">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`h-5 w-5 ${
                          star <= Math.round((truck as any).average_rating ?? 0)
                            ? 'text-yellow-400 fill-current'
                            : 'text-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-lg font-semibold">{((truck as any).average_rating ?? 0).toFixed(1)}</span>
                </div>
                // @ts-expect-error TS(2339): Property 'review_count' does not exist on type 'Fo... Remove this comment to see the full error message
                {truck.review_count != null && (
                  <div className="flex items-center gap-1 text-gray-600">
                    <Users className="h-4 w-4" />
                    // @ts-expect-error TS(2339): Property 'review_count' does not exist on type 'Fo... Remove this comment to see the full error message
                    <span className="text-sm">{truck.review_count} reviews</span>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-3 text-gray-400">
                <Star className="h-4 w-4" />
                <span className="text-sm">No ratings available</span>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Data Quality Information */}
      <Card>
        <CardHeader>
          <CardTitle>Data Quality Assessment</CardTitle>
          <CardDescription>
            Quality score: {formatQualityScore(truck.data_quality_score)} 
            ({qualityCategory.label} quality)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {formatQualityScore(truck.data_quality_score)}
              </div>
              <div className="text-sm text-gray-500">Overall Score</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-semibold">
                <Badge variant={truck.verification_status === 'verified' ? 'default' : 'outline'}>
                  {truck.verification_status}
                </Badge>
              </div>
              <div className="text-sm text-gray-500">Status</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-semibold text-gray-900">
                {truck.created_at ? new Date(truck.created_at).toLocaleDateString() : 'N/A'}
              </div>
              <div className="text-sm text-gray-500">Created</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-semibold text-gray-900">
                {truck.updated_at ? new Date(truck.updated_at).toLocaleDateString() : 'N/A'}
              </div>
              <div className="text-sm text-gray-500">Updated</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
