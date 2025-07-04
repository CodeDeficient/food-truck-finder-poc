import React from 'react';
import TruckCard from './TruckCard';
import { formatPrice } from '@/lib/utils/foodTruckHelpers';
import { MenuSection, SocialMediaSection, ContactSection } from '.';

interface MenuItem {
  name: string;
  price_cents?: number; // Make price_cents optional
}

export function TruckCardContent({
  truck,
  todayHours,
  popularItems = [],
}: {
  readonly truck: { name: string; address?: string; phone_number?: string };
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
          {todayHours && !todayHours.closed && (
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
