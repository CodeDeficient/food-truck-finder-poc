
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Edit, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { type QualityCategory } from '@/lib/utils/dataQualityFormatters';

interface TruckDetailHeaderProps {
  readonly truck: { id: string; name: string };
  readonly badgeClasses: string;
  readonly qualityCategory: QualityCategory;
}

/**
 * Displays the food truck detail header with navigation and edit options
 * @example
 * TruckDetailHeader({ truck: sampleTruck, badgeClasses: "badge-style", qualityCategory: {label: "High"} })
 * <div>...</div>
 * @param {Object} truck - The truck object containing details like name and ID.
 * @param {string} badgeClasses - CSS classes for styling the quality badge.
 * @param {Object} qualityCategory - An object containing category details like label.
 * @returns {JSX.Element} A header section containing navigation buttons, truck name, and quality badge.
 * @description
 *   - Utilizes Flexbox CSS classes for alignment and spacing.
 *   - Provides a link to navigate back to the food trucks list.
 *   - Includes an edit button linking to the truck's edit page.
 */
export function TruckDetailHeader({
  truck,
  badgeClasses,
  qualityCategory,
}: TruckDetailHeaderProps) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="sm" asChild>
          <Link href="/admin/food-trucks">
            <ArrowLeft className="size-4 mr-2" />
            Back
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{truck.name}</h1>
          <p className="text-muted-foreground">Food truck details and data quality information</p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Badge className={badgeClasses}>{qualityCategory.label} Quality</Badge>
        <Button asChild>
          <Link href={`/admin/food-trucks/${truck.id}/edit`}>
            <Edit className="size-4 mr-2" />
            Edit
          </Link>
        </Button>
      </div>
    </div>
  );
}
