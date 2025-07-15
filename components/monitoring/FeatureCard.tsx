
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

// Removed LucideIcon import

interface FeatureCardProps {
  readonly title: string;
  readonly icon: React.ReactElement<React.SVGProps<SVGSVGElement>>; // More specific type for Lucide icons
  readonly value: string;
  readonly description: string;
  readonly iconColorClass: string;
  readonly valueColorClass: string;
}

/**
 * Renders a card component displaying a feature with an icon, title, value, and description.
 * @example
 * FeatureCard({
 *   title: "CPU Usage",
 *   icon: <CpuIcon />,
 *   value: "75%",
 *   description: "Current average CPU usage",
 *   iconColorClass: "text-gray-500",
 *   valueColorClass: "text-red-600"
 * })
 * <Returns a JSX element>
 * @param {Object} FeatureCardProps - Props for the FeatureCard component.
 * @param {ReactElement} icon - A React element representing the icon.
 * @param {string} title - The title to be displayed on the card.
 * @param {string} value - The value to be prominently displayed on the card.
 * @param {string} description - Additional information displayed under the value.
 * @param {string} iconColorClass - Tailwind CSS class for icon color styling.
 * @param {string} valueColorClass - Tailwind CSS class for value color styling.
 * @returns {JSX.Element} Card component displaying the feature information.
 * @description
 *   - Utilizes CardHeader and CardContent for structured content within the card.
 *   - Styles are applied using Tailwind CSS classes for consistency and reusability.
 */
export function FeatureCard({
  title,
  icon,
  value,
  description,
  iconColorClass,
  valueColorClass,
}: FeatureCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {React.cloneElement(icon, { className: `h-4 w-4 ${iconColorClass}` })}{' '}
        {/* Removed unnecessary cast */}
      </CardHeader>
      <CardContent>
        <div className={`text-2xl font-bold ${valueColorClass}`}>{value}</div>
        <p className="text-xs text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  );
}
