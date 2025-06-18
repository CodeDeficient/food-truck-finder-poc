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
} from 'lucide-react';
import Link from 'next/link';
import {
  formatQualityScore,
  categorizeQualityScore,
  getQualityBadgeClasses,
  type QualityCategory
} from '@/lib/utils/data-quality-formatters';

// Quality score metric component
function QualityScoreMetric({
  value,
  label,
  className = "text-gray-900"
}: {
  readonly value: React.ReactNode;
  readonly label: string;
  readonly className?: string;
}) {
  return (
    <div className="text-center">
      <div className={`text-lg font-semibold ${className}`}>
        {value}
      </div>
      <div className="text-sm text-gray-500">{label}</div>
    </div>
  );
}

// Quality metrics grid component
function QualityMetricsGrid({
  truck,
  qualityCategory
}: {
  readonly truck: {
    data_quality_score?: number;
    verification_status?: string;
    created_at?: string;
    updated_at?: string
  };
  readonly qualityCategory: QualityCategory;
}) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <QualityScoreMetric
        value={
          <div className="text-2xl font-bold text-blue-600">
            {/* eslint-disable-next-line @typescript-eslint/no-unsafe-call */}
            {formatQualityScore(truck.data_quality_score)}
          </div>
        }
        label="Overall Score"
        className=""
      />

      <QualityScoreMetric
        value={
          <Badge variant={truck.verification_status === 'verified' ? 'default' : 'outline'}>
            {truck.verification_status}
          </Badge>
        }
        label="Status"
        className=""
      />

      <QualityScoreMetric
        value={truck.created_at ? new Date(truck.created_at).toLocaleDateString() : 'N/A'}
        label="Created"
      />

      <QualityScoreMetric
        value={truck.updated_at ? new Date(truck.updated_at).toLocaleDateString() : 'N/A'}
        label="Updated"
      />
    </div>
  );
}

// Contact field component
function ContactField({
  icon: Icon,
  label,
  value,
  href,
  unavailableText
}: {
  readonly icon: React.ComponentType<{ className?: string }>;
  readonly label: string;
  readonly value?: string;
  readonly href?: string;
  readonly unavailableText: string;
}) {
  if (value == undefined || value === '') {
    return (
      <div className="flex items-center gap-3 text-gray-400">
        <Icon className="h-4 w-4" />
        <span className="text-sm">{unavailableText}</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3">
      <Icon className="h-4 w-4 text-gray-500" />
      <div>
        <label className="text-sm font-medium text-gray-500">{label}</label>
        {href ? (
          <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:text-blue-800 underline"
          >
            {href.startsWith('http') ? value : value}
          </a>
        ) : (
          <p className="text-gray-900">{value}</p>
        )}
      </div>
    </div>
  );
}

// Social media links component
function SocialMediaLinks({ socialMedia }: {
  readonly socialMedia?: { instagram?: string; facebook?: string; twitter?: string };
}) {
  if (!socialMedia || Object.keys(socialMedia).length === 0) {
    return null;
  }

  const socialPlatforms = [
    { key: 'instagram' as const, name: 'Instagram', baseUrl: 'https://instagram.com/', color: 'pink' },
    { key: 'facebook' as const, name: 'Facebook', baseUrl: 'https://facebook.com/', color: 'blue' },
    { key: 'twitter' as const, name: 'Twitter', baseUrl: 'https://twitter.com/', color: 'sky' },
  ];

  return (
    <div>
      <label className="text-sm font-medium text-gray-500">Social Media</label>
      <div className="flex flex-wrap gap-2 mt-2">
        {socialPlatforms.map(({ key, name, baseUrl, color }) => {
          const handle = socialMedia[key];
          if (handle == undefined || handle === '') return null;

          return (
            <a
              key={key}
              href={`${baseUrl}${handle}`}
              target="_blank"
              rel="noopener noreferrer"
              className={`flex items-center gap-1 px-2 py-1 bg-${color}-100 text-${color}-800 rounded-md text-sm hover:bg-${color}-200`}
            >
              <Globe className="h-3 w-3" />
              {name}
            </a>
          );
        })}
      </div>
    </div>
  );
}

interface FoodTruckDetailPageProps {
  readonly params: {
    readonly id: string;
  };
}

// Not found component
function TruckNotFound() {
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

// Header component
function TruckDetailHeader({
  truck,
  badgeClasses,
  qualityCategory
}: {
  readonly truck: { id: string; name: string };
  readonly badgeClasses: string;
  readonly qualityCategory: QualityCategory;
}) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-4">
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
          {/* eslint-disable-next-line @typescript-eslint/no-unsafe-member-access */}
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
  );
}

// Basic Information card component
function BasicInfoCard({ truck }: { readonly truck: { name: string; description?: string; cuisine_type?: string[]; price_range?: string; specialties?: string[] } }) {
  return (
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

        {(truck.description !== undefined) && truck.description !== '' && (
          <div>
            <label className="text-sm font-medium text-gray-500">Description</label>
            <p className="text-gray-900">{truck.description}</p>
          </div>
        )}

        <CuisineTypeSection cuisineType={truck.cuisine_type} />
        <PriceRangeSection priceRange={truck.price_range} />
        <SpecialtiesSection specialties={truck.specialties} />
      </CardContent>
    </Card>
  );
}

// Cuisine type section component
function CuisineTypeSection({ cuisineType }: { readonly cuisineType?: string[] }) {
  if ((cuisineType == undefined) || cuisineType.length === 0) return;

  return (
    <div>
      <label className="text-sm font-medium text-gray-500">Cuisine Type</label>
      <div className="flex flex-wrap gap-1 mt-1">
        {cuisineType.map((cuisine: string, index: number) => (
          <Badge key={index} variant="secondary">
            {cuisine}
          </Badge>
        ))}
      </div>
    </div>
  );
}

// Price range section component
function PriceRangeSection({ priceRange }: { readonly priceRange?: string }) {
  if ((priceRange == undefined) || priceRange === '') return;

  return (
    <div>
      <label className="text-sm font-medium text-gray-500">Price Range</label>
      <p className="text-gray-900">{priceRange}</p>
    </div>
  );
}

// Specialties section component
function SpecialtiesSection({ specialties }: { readonly specialties?: string[] }) {
  if ((specialties == undefined) || specialties.length === 0) return;

  return (
    <div>
      <label className="text-sm font-medium text-gray-500">Specialties</label>
      <div className="flex flex-wrap gap-1 mt-1">
        {specialties.map((specialty: string, index: number) => (
          <Badge key={index} variant="outline">
            {specialty}
          </Badge>
        ))}
      </div>
    </div>
  );
}



// Contact Information card component
function ContactInfoCard({ truck }: { readonly truck: { contact_info?: { phone?: string; email?: string; website?: string }; social_media?: { instagram?: string; facebook?: string; twitter?: string } } }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Phone className="h-5 w-5" />
          Contact Information
        </CardTitle>
        <CardDescription>Phone, email, website, and social media</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <ContactField
          icon={Phone}
          label="Phone"
          value={truck.contact_info?.phone}
          href={truck.contact_info?.phone ? `tel:${truck.contact_info.phone}` : undefined}
          unavailableText="No phone number available"
        />

        <ContactField
          icon={Mail}
          label="Email"
          value={truck.contact_info?.email}
          href={truck.contact_info?.email ? `mailto:${truck.contact_info.email}` : undefined}
          unavailableText="No email address available"
        />

        <ContactField
          icon={Globe}
          label="Website"
          value={truck.contact_info?.website}
          href={truck.contact_info?.website}
          unavailableText="No website available"
        />

        <SocialMediaLinks socialMedia={truck.social_media} />
      </CardContent>
    </Card>
  );
}

// Location Information card component
function LocationInfoCard({ truck }: { readonly truck: { current_location?: { address?: string; lat?: number; lng?: number; timestamp?: string } } }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPin className="h-5 w-5" />
          Location Information
        </CardTitle>
        <CardDescription>Current location and address details</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {(truck.current_location?.address === undefined) ? (
          <p className="text-gray-400 text-sm">No address available</p>
        ) : (
          <div>
            <label className="text-sm font-medium text-gray-500">Address</label>
            <p className="text-gray-900">{truck.current_location.address}</p>
          </div>
        )}

        {truck.current_location?.lat !== undefined && truck.current_location?.lng !== undefined && (
          <div>
            <label className="text-sm font-medium text-gray-500">Coordinates</label>
            <p className="text-gray-900 font-mono text-sm">
              {truck.current_location.lat.toFixed(6)}, {truck.current_location.lng.toFixed(6)}
            </p>
          </div>
        )}

        {truck.current_location?.timestamp != undefined && (
          <div>
            <label className="text-sm font-medium text-gray-500">Last Updated</label>
            <p className="text-gray-900">
              {new Date(truck.current_location.timestamp).toLocaleString()}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// Operating Hours card component
function OperatingHoursCard({ truck }: { readonly truck: { operating_hours?: Record<string, { closed?: boolean; open?: string; close?: string }> } }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Operating Hours
        </CardTitle>
        <CardDescription>Daily operating schedule</CardDescription>
      </CardHeader>
      <CardContent>
        {(truck.operating_hours !== undefined) && Object.keys(truck.operating_hours).length > 0 ? (
          <div className="space-y-2">
            {['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'].map((day) => {
              const dayData = truck.operating_hours ? truck.operating_hours[day] as { closed?: boolean; open?: string; close?: string } | undefined : undefined;
              const dayName = day.charAt(0).toUpperCase() + day.slice(1);

              return (
                <div key={day} className="flex justify-between items-center py-1">
                  <span className="font-medium text-gray-700">{dayName}</span>
                  {(() => {
                    if (dayData !== undefined && typeof dayData === 'object') {
                      if (dayData.closed === true) {
                        return <span className="text-red-600 text-sm">Closed</span>;
                      }
                      return (
                        <span className="text-gray-900 text-sm">
                          {dayData.open ?? 'N/A'} - {dayData.close ?? 'N/A'}
                        </span>
                      );
                    }
                    return <span className="text-gray-400 text-sm">Not specified</span>;
                  })()}
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-gray-400 text-sm">No operating hours available</p>
        )}
      </CardContent>
    </Card>
  );
}

// Ratings & Reviews card component
function RatingsReviewsCard({ truck }: { readonly truck: { average_rating?: number; review_count?: number } }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Star className="h-5 w-5" />
          Ratings & Reviews
        </CardTitle>
        <CardDescription>Customer feedback and ratings</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {((truck as { average_rating?: number }).average_rating === undefined) ? (
          <p className="text-gray-400 text-sm">No ratings available</p>
        ) : (
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="flex">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`h-5 w-5 ${
                      star <= Math.round((truck as { average_rating?: number }).average_rating ?? 0)
                        ? 'text-yellow-400 fill-current'
                        : 'text-gray-300'
                    }`}
                  />
                ))}
              </div>
              <span className="text-lg font-semibold">{((truck as { average_rating?: number }).average_rating ?? 0).toFixed(1)}</span>
            </div>
            {((truck as { review_count?: number }).review_count !== undefined) && (
              <div className="flex items-center gap-1 text-gray-600">
                <Users className="h-4 w-4" />
                <span className="text-sm">{(truck as { review_count?: number }).review_count} reviews</span>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// Data Quality card component
function DataQualityCard({ truck, qualityCategory }: {
  readonly truck: {
    data_quality_score?: number;
    verification_status?: string;
    created_at?: string;
    updated_at?: string
  };
  readonly qualityCategory: QualityCategory
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Data Quality Assessment</CardTitle>
        <CardDescription>
          {/* eslint-disable-next-line @typescript-eslint/no-unsafe-call */}
          Quality score: {formatQualityScore(truck.data_quality_score)}
          {/* eslint-disable-next-line @typescript-eslint/no-unsafe-member-access */}
          ({qualityCategory.label} quality)
        </CardDescription>
      </CardHeader>
      <CardContent>
        <QualityMetricsGrid truck={truck} qualityCategory={qualityCategory} />
      </CardContent>
    </Card>
  );
}

export default async function FoodTruckDetailPage({ params }: FoodTruckDetailPageProps) {
  const truck = await FoodTruckService.getTruckById(params.id);

  if (truck == undefined) {
    return <TruckNotFound />;
  }

  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call
  const qualityCategory: QualityCategory = categorizeQualityScore(truck.data_quality_score);
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call
  const badgeClasses: string = getQualityBadgeClasses(truck.data_quality_score);

  return (
    <div className="flex flex-col gap-6">
      <TruckDetailHeader truck={truck} badgeClasses={badgeClasses} qualityCategory={qualityCategory} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <BasicInfoCard truck={truck} />

        <ContactInfoCard truck={truck} />

        <LocationInfoCard truck={truck} />

        <OperatingHoursCard truck={truck} />

        <RatingsReviewsCard truck={truck} />
      </div>

      <DataQualityCard truck={truck} qualityCategory={qualityCategory} />
    </div>
  );
}
