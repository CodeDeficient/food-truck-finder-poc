import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface BasicInfoCardProps {
  readonly truck: { name: string; description?: string; cuisine_type?: string[]; price_range?: string; specialties?: string[] };
}

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

function PriceRangeSection({ priceRange }: { readonly priceRange?: string }) {
  if ((priceRange == undefined) || priceRange === '') return;

  return (
    <div>
      <label className="text-sm font-medium text-gray-500">Price Range</label>
      <p className="text-gray-900">{priceRange}</p>
    </div>
  );
}

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

export function BasicInfoCard({ truck }: Readonly<BasicInfoCardProps>) {
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
