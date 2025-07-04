import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface BasicInfoCardProps {
  readonly truck: {
    name: string;
    description?: string;
    cuisine_type?: string[];
    price_range?: string;
    specialties?: string[];
  };
}

/**
 * Renders a section displaying a list of cuisine types as badge elements
 * @example
 * CuisineTypeSection({ cuisineType: ['Italian', 'Mexican', 'Chinese'] })
 * // Returns a JSX element containing labeled badges for each cuisine type
 * @param {Object} { cuisineType } - An object with an optional array of string cuisine types.
 * @returns {JSX.Element | undefined} A JSX element displaying cuisine types as badges, or undefined if no cuisine types are provided.
 * @description
 *   - Each cuisine type is rendered within a secondary variant Badge component.
 *   - If no cuisine types are provided, the function returns undefined, effectively rendering nothing.
 */
function CuisineTypeSection({ cuisineType }: { readonly cuisineType?: string[] }) {
  if (cuisineType == undefined || cuisineType.length === 0) return;

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
  if (priceRange == undefined || priceRange === '') return;

  return (
    <div>
      <label className="text-sm font-medium text-gray-500">Price Range</label>
      <p className="text-gray-900">{priceRange}</p>
    </div>
  );
}

/**
 * Renders a section displaying a list of specialties.
 * @example
 * SpecialtiesSection({ specialties: ['Vegan', 'Gluten-Free'] })
 * <div>...</div>
 * @param {Object} {specialties} - An object containing an optional array of specialty strings.
 * @returns {JSX.Element | undefined} A JSX element representing the specialties section, or undefined if no specialties are provided.
 * @description
 *   - Uses a Badge component to visually represent each specialty.
 *   - Ensures no rendering occurs if specialties are undefined or empty, enhancing performance.
 *   - Adds styling for layout and text appearance utilizing utility classes.
 */
function SpecialtiesSection({ specialties }: { readonly specialties?: string[] }) {
  if (specialties == undefined || specialties.length === 0) return;

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

/**
 * Renders a card component showing basic information about a food truck.
 * @example
 * BasicInfoCard({ truck: { name: "Tasty Truck", description: "Gourmet street food", cuisine_type: "Mexican", price_range: "$$", specialties: ["Tacos", "Burritos"] } })
 * <Card><CardHeader>...</CardHeader><CardContent>...</CardContent></Card>
 * @param {Readonly<BasicInfoCardProps>} {truck} - Object containing food truck details like name, description, cuisine type, price range, and specialties.
 * @returns {JSX.Element} A JSX element representing a card with food truck details.
 * @description
 *   - Utilizes several sub-components such as CuisineTypeSection, PriceRangeSection, and SpecialtiesSection to display more detailed info.
 *   - Displays 'Name' and 'Description' fields only if relevant information is provided in the `truck` object.
 *   - Structure is flexible to accommodate additional sections if more data is included in the `truck` object.
 */
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

        {truck.description !== undefined && truck.description !== '' && (
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
