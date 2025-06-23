import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

import { LucideIcon } from 'lucide-react'; // Import LucideIcon type

interface FeatureCardProps {
  readonly title: string;
  readonly icon: React.ReactElement<React.SVGProps<SVGSVGElement>>; // More specific type for Lucide icons
  readonly value: string;
  readonly description: string;
  readonly iconColorClass: string;
  readonly valueColorClass: string;
}

export function FeatureCard({ title, icon, value, description, iconColorClass, valueColorClass }: FeatureCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {React.cloneElement(icon, { className: `h-4 w-4 ${iconColorClass}` })} {/* Removed unnecessary cast */}
      </CardHeader>
      <CardContent>
        <div className={`text-2xl font-bold ${valueColorClass}`}>{value}</div>
        <p className="text-xs text-muted-foreground">
          {description}
        </p>
      </CardContent>
    </Card>
  );
}
