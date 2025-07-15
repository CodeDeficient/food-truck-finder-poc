
import { formatPrice } from '@/lib/utils/foodTruckHelpers';
import { MenuItem } from '@/lib/supabase/types'; // Import MenuItem from lib/types

interface MenuSectionProps {
  readonly popularItems: MenuItem[]; // Use the imported MenuItem type
}

/**
* Renders a list of popular menu items.
* @example
* MenuSection({ popularItems: [{ name: "Burger", price: 9.99 }] })
* <div>...</div>
* @param {Object[]} popularItems - An array of popular menu items, each with a name and price.
* @returns {JSX.Element} The JSX code for rendering the menu section.
* @description
*   - If no popular items are provided, it displays a message indicating that the menu is not available.
*   - The item's price is formatted using the `formatPrice` function.
*   - Adjusts styling for light and dark themes.
*/
export function MenuSection({ popularItems }: Readonly<MenuSectionProps>) {
  return (
    <div>
      <h4 className="font-medium mb-2 text-sm dark:text-gray-100">Popular Items</h4>
      <div className="space-y-1">
        {popularItems.map((item, idx) => (
          <div key={idx} className="flex justify-between text-sm dark:text-gray-300">
            <span className="truncate dark:text-gray-200">{item.name}</span>
            {/* Handle price as string or number */}
            {item.price !== undefined && (
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
