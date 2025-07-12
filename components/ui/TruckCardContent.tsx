
import TruckCard from './TruckCard';
import { formatPrice } from '@/lib/utils/foodTruckHelpers';
import { MenuSection, SocialMediaSection, ContactSection } from '.';

interface MenuItem {
  name: string;
  price_cents?: number; // Make price_cents optional
}

/**
* Renders the card content for a food truck including its name, operating hours, popular menu items, and contact details.
* @example
* TruckCardContent({
*   truck: { name: 'Tasty Truck', address: '123 Street', phone_number: '123-456-7890' },
*   todayHours: { open: '8:00 AM', close: '5:00 PM', closed: false },
*   popularItems: [{ name: 'Burger', price_cents: 500 }],
* })
* // returns JSX containing truck's card
* @param {object} truck - The truck object containing name, address, and phone number.
* @param {object} todayHours - An optional object specifying today's opening and closing times and whether it is closed.
* @param {MenuItem[]} popularItems - List of popular menu items to display.
* @returns {JSX.Element} The JSX content for rendering the truck's card.
* @description
*   - Uses default values for missing truck properties to ensure components render safely.
*   - Calculates the average price of popular items and formats it to two decimal places.
*   - Validates the existence of social media and contact information before rendering related sections.
*/
export function TruckCardContent({
  truck,
  todayHours,
  popularItems = [],
}: {
  readonly truck: { name: string; address?: string; phone_number?: string; social_media?: Record<string, string> };
  readonly todayHours?: { open?: string; close?: string; closed?: boolean };
  readonly popularItems: MenuItem[];
}) {
  const {
    name = 'Unnamed Truck',
    social_media = {},
    address = '', // Provide safe defaults
    phone_number = '',
  } = truck;

  const avgDailyPrice = (
    popularItems.reduce((acc, item) => acc + (item.price_cents ?? 0), 0) /
    popularItems.length ?? 0
  ).toFixed(2);

  return (
    <main className="ui-truck-container">
      {name && (
        <>
          <TruckCard title={name} avgCost={`$${avgDailyPrice}`} />
          {todayHours !== undefined && !todayHours.closed && (
            <div className="hours-display">
              <strong>Today:</strong> {todayHours.open} - {todayHours.close}
            </div>
          )}
        </>
      )}

      {popularItems.length > 0 && (
        <MenuSection
          items={popularItems.map(item => ({
            name: item.name,
            price: formatPrice(item.price_cents),
          }))}
        />
      )}

      {/* SocialMediaSection and ContactSection require validation */}
      {Object.keys(social_media).length > 0 && (typeof social_media === 'object')&& (
        <SocialMediaSection social_media={social_media} />
      )}

      {/* Refactored ContactSection - handle undefined values explicitly*/}
      {(address || phone_number) && (
        <ContactSection address={address} phone_number={phone_number} />
      )}
    </main>
  );
}
