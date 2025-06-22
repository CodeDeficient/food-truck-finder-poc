import React from 'react';
import { Globe } from 'lucide-react';

interface SocialMediaLinksProps {
  socialMedia?: { instagram?: string; facebook?: string; twitter?: string };
}

export function SocialMediaLinks({ socialMedia }: SocialMediaLinksProps) {
  if (!socialMedia || Object.keys(socialMedia).length === 0) {
    return null;
  }

  const socialPlatforms = [
    { key: 'instagram' as const, name: 'Instagram', baseUrl: 'https://instagram.com/', color: 'pink' },
    { key: 'facebook' as const, name: 'Facebook', baseUrl: 'https://facebook.com/', color: 'blue' },
    { key: 'twitter' as const, name: 'Twitter', baseUrl: 'https://twitter.com/', color: 'sky' },
  ];

  return (
    <div>
      <label className="text-sm font-medium text-gray-500">Social Media</label>
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
              className={`flex items-center gap-1 px-2 py-1 bg-${color}-100 text-${color}-800 rounded-md text-sm hover:bg-${color}-200`}
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
