import React from 'react';
import { formatPrice } from '@/lib/utils/foodTruckHelpers'; // Assuming formatPrice is moved here

interface MenuItem {
  name: string;
  price?: number;
}

interface MenuSectionProps {
  popularItems: MenuItem[];
  formatPrice: (price: number) => string;
}

export function MenuSection({ popularItems, formatPrice }: MenuSectionProps) {
  return (
    <div>
      <h4 className="font-medium mb-2 text-sm dark:text-gray-100">Popular Items</h4>
      <div className="space-y-1">
        {popularItems.map((item, idx) => (
          <div key={idx} className="flex justify-between text-sm dark:text-gray-300">
            <span className="truncate dark:text-gray-200">{item.name}</span>
            {typeof item.price === 'number' && item.price > 0 && (
              <span className="text-green-600 dark:text-green-400 ml-2">
                {formatPrice(item.price)}
              </span>
            )}
          </div>
        ))}
        {popularItems.length === 0 && (
          <p className="text-gray-500 dark:text-gray-400 text-sm">Menu not available</p>
        )}
      </div>
    </div>
  );
}
