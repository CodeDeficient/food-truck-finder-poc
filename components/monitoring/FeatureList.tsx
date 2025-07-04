import React from 'react';

interface FeatureItem {
  icon: React.ReactElement<React.SVGProps<SVGSVGElement>>;
  text: string;
  iconColorClass: string;
}

interface FeatureListProps {
  readonly title: string;
  readonly items: FeatureItem[];
}

/**
 * Renders a list of features with their icons and descriptions.
 * @example
 * FeatureList({ title: "Feature Title", items: [{ icon: <IconComponent />, text: "Feature description", iconColorClass: "text-primary" }] })
 * <div className="space-y-3">...</div>
 * @param {object} FeatureListProps - The props containing the title and items for the list.
 * @param {string} FeatureListProps.title - The title of the feature list.
 * @param {Array} FeatureListProps.items - An array of items, each representing a feature with an icon and text.
 * @returns {JSX.Element} A JSX element representing the structured feature list with items.
 * @description
 *   - The function makes use of utility classes for consistent styling.
 *   - Each item's icon is cloned with additional class for dynamic color styling.
 *   - Uses map function to iterate and render list items.
 *   - Ensures unique key for each list item based on index.
 */
export function FeatureList({ title, items }: FeatureListProps) {
  return (
    <div className="space-y-3">
      <h4 className="font-semibold text-sm">{title}</h4>
      <ul className="space-y-2 text-sm text-muted-foreground">
        {items.map((item, index) => (
          <li key={index} className="flex items-center gap-2">
            {React.cloneElement(item.icon, { className: `h-3 w-3 ${item.iconColorClass}` })}
            {item.text}
          </li>
        ))}
      </ul>
    </div>
  );
}
