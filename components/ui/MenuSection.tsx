import React from 'react';

interface MenuSectionProps {
  items: { name: string; price: string }[];
}

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
