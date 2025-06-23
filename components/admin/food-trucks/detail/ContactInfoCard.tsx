import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Phone, Mail, Globe } from 'lucide-react';
import { ContactField } from './ContactField';
import { SocialMediaLinks } from './SocialMediaLinks';

interface ContactInfoCardProps {
  readonly truck: { contact_info?: { phone?: string; email?: string; website?: string }; social_media?: { instagram?: string; facebook?: string; twitter?: string } };
}

export function ContactInfoCard({ truck }: Readonly<ContactInfoCardProps>) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Phone className="h-5 w-5" />
          Contact Information
        </CardTitle>
        <CardDescription>Phone, email, website, and social media</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <ContactField
          icon={Phone}
          label="Phone"
          value={truck.contact_info?.phone}
          href={(typeof truck.contact_info?.phone === 'string' && truck.contact_info.phone.length > 0) ? `tel:${truck.contact_info.phone}` : undefined}
          unavailableText="No phone number available"
        />

        <ContactField
          icon={Mail}
          label="Email"
          value={truck.contact_info?.email}
          href={(typeof truck.contact_info?.email === 'string' && truck.contact_info.email.length > 0) ? `mailto:${truck.contact_info.email}` : undefined}
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
