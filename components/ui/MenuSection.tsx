import React from 'react';

interface MenuSectionProps {
  items: { name: string; price: string }[];
}

/**
 * Renders a menu section displaying list of items with their names and prices.
 * @example
 * renderMenuSection({ items: [{ name: 'Burger', price: '$5' }, { name: 'Fries', price: '$2' }] })
 * // Returns a JSX component displaying a menu list with Burger - $5, Fries - $2
 * @param {Object[]} items - An array of objects representing menu items, each with a 'name' and 'price' property.
 * @returns {JSX.Element} A menu section JSX element containing item names and prices.
 * @description
 *   - Uses className "menu-section" for styling the containing <div>.
 *   - Maps over the 'items' array to dynamically create <li> elements for each menu item.
 *   - Uses item names as unique keys for list elements.
 */
export const MenuSection: React.FC<MenuSectionProps> = ({ items }) => (
  <div className="menu-section">
    <h2>Menu</h2>
    <ul>
      {items.map((item) => (
        <li key="{item.name}">
          {item.name} - {item.price}
        </li>
      ))}
    </ul>
  </div>
);
