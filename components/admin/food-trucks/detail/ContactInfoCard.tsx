import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Phone, Mail, Globe } from 'lucide-react';
import { ContactField } from './ContactField';
import { SocialMediaLinks } from './SocialMediaLinks';

interface ContactInfoCardProps {
  readonly truck: {
    contact_info?: { phone?: string; email?: string; website?: string };
    social_media?: { instagram?: string; facebook?: string; twitter?: string };
  };
}

/**
 * Renders the contact information for a specific truck in a card format.
 * @example
 * ContactInfoCard({ truck: { contact_info: { phone: '1234567890', email: 'example@mail.com', website: 'example.com' }, social_media: [] } })
 * Returns a JSX element displaying the contact information including phone, email, website, and social media links.
 * @param {Readonly<ContactInfoCardProps>} truck - Contains contact information and social media details of the truck.
 * @returns {JSX.Element} A card component containing contact information fields and social media links.
 * @description
 *   - Uses several ContactField components to display phone, email, and website details.
 *   - Includes a social media section using the SocialMediaLinks component.
 *   - Handles cases where contact information might be unavailable, displaying an appropriate message.
 *   - Designed to be used in the admin panel for the food truck detail page.
 */
export function ContactInfoCard({ truck }: Readonly<ContactInfoCardProps>) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Phone className="size-5" />
          Contact Information
        </CardTitle>
        <CardDescription>Phone, email, website, and social media</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <ContactField
          icon={Phone}
          label="Phone"
          value={truck.contact_info?.phone}
          href={
            truck.contact_info?.phone != undefined && truck.contact_info.phone !== ''
              ? `tel:${truck.contact_info.phone}`
              : undefined
          }
          unavailableText="No phone number available"
        />

        <ContactField
          icon={Mail}
          label="Email"
          value={truck.contact_info?.email}
          href={
            truck.contact_info?.email != undefined && truck.contact_info.email !== ''
              ? `mailto:${truck.contact_info.email}`
              : undefined
          }
          unavailableText="No email address available"
        />

        <ContactField
          icon={Globe}
          label="Website"
          value={truck.contact_info?.website}
          href={truck.contact_info?.website}
          unavailableText="No website available"
        />

        <SocialMediaLinks socialMedia={truck.social_media} />
      </CardContent>
    </Card>
  );
}
