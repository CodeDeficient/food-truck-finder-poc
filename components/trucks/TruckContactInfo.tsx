import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Phone, Mail, Globe } from 'lucide-react';
import type { FoodTruck } from '@/lib/supabase';

interface TruckContactInfoProps {
  readonly truck: FoodTruck;
}

function ContactField({ 
  icon: Icon, 
  label, 
  value, 
  href, 
  unavailableText 
}: {
  readonly icon: React.ComponentType<{ className?: string }>;
  readonly label: string;
  readonly value?: string;
  readonly href?: string;
  readonly unavailableText: string;
}) {
  if (value == undefined || value === '') {
    return (
      <div className="flex items-center gap-3 text-gray-400">
        <Icon className="h-4 w-4" />
        <span className="text-sm">{unavailableText}</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3">
      <Icon className="h-4 w-4 text-gray-500" />
      <div>
        <label className="text-sm font-medium text-gray-500 dark:text-gray-400">{label}</label>
        {href ? (
          <a 
            href={href}
            target={href.startsWith('http') ? '_blank' : undefined}
            rel={href.startsWith('http') ? 'noopener noreferrer' : undefined}
            className="block text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 underline"
          >
            {href.startsWith('http') ? 'Visit Website' : value}
          </a>
        ) : (
          <p className="text-gray-900 dark:text-gray-200">{value}</p>
        )}
      </div>
    </div>
  );
}

function SocialMediaLinks({ socialMedia }: { readonly socialMedia?: Record<string, string> }) {
  if (!socialMedia || Object.keys(socialMedia).length === 0) {
    return null;
  }

  const socialPlatforms = [
    { key: 'instagram', name: 'Instagram', baseUrl: 'https://instagram.com/', color: 'pink' },
    { key: 'facebook', name: 'Facebook', baseUrl: 'https://facebook.com/', color: 'blue' },
    { key: 'twitter', name: 'Twitter', baseUrl: 'https://twitter.com/', color: 'sky' },
  ];

  return (
    <div>
      <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Social Media</label>
      <div className="flex flex-wrap gap-2 mt-2">
        {socialPlatforms.map(({ key, name, baseUrl, color }) => {
          const handle = socialMedia[key];
          if (handle == undefined || handle === '') return null;

          return (
            <a
              key={key}
              href={`${baseUrl}${handle}`}
              target="_blank"
              rel="noopener noreferrer"
              className={`flex items-center gap-1 px-2 py-1 bg-${color}-100 text-${color}-800 rounded-md text-sm hover:bg-${color}-200 dark:bg-${color}-900 dark:text-${color}-200`}
            >
              <Globe className="h-3 w-3" />
              {name}
            </a>
          );
        })}
      </div>
    </div>
  );
}

export function TruckContactInfo({ truck }: TruckContactInfoProps) {
  return (
    <Card className="dark:bg-slate-800 dark:border-slate-700">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 dark:text-gray-100">
          <Phone className="h-5 w-5" />
          Contact Information
        </CardTitle>
        <CardDescription className="dark:text-gray-400">Get in touch</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <ContactField
          icon={Phone}
          label="Phone"
          value={truck.contact_info?.phone}
          href={truck.contact_info?.phone ? `tel:${truck.contact_info.phone}` : undefined}
          unavailableText="No phone number available"
        />

        <ContactField
          icon={Mail}
          label="Email"
          value={truck.contact_info?.email}
          href={truck.contact_info?.email ? `mailto:${truck.contact_info.email}` : undefined}
          unavailableText="No email available"
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
