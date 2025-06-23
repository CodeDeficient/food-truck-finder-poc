import React from 'react';
import { LucideIcon } from 'lucide-react';

interface FeatureItem {
  icon: React.ReactElement<React.SVGProps<SVGSVGElement>>;
  text: string;
  iconColorClass: string;
}

interface FeatureListProps {
  readonly title: string;
  readonly items: FeatureItem[];
}

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
