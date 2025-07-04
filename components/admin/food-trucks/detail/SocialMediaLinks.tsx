import React from 'react';
import { Globe } from 'lucide-react';

interface SocialMediaLinksProps {
  readonly socialMedia?: { instagram?: string; facebook?: string; twitter?: string };
}

/**
 * Displays links to social media profiles based on given handles.
 * @example
 * SocialMediaLinks({ instagram: 'handle', facebook: 'handle', twitter: 'handle' })
 * Renders social media links for provided handles.
 * @param {Object} socialMedia - Social media handles mapped by platform key.
 * @returns {JSX.Element} JSX elements with social media links, or undefined if no valid handles are provided.
 * @description
 *   - If social media handles are undefined or empty, the function returns without rendering.
 *   - Displays links styled appropriately for each social media platform.
 *   - Ensures external links open in a new tab with security features.
 */
export function SocialMediaLinks({ socialMedia }: Readonly<SocialMediaLinksProps>) {
  // Added readonly
  if (socialMedia === undefined || Object.keys(socialMedia).length === 0) {
    return;
  }

  const socialPlatforms = [
    {
      key: 'instagram' as const,
      name: 'Instagram',
      baseUrl: 'https://instagram.com/',
      color: 'pink',
    },
    { key: 'facebook' as const, name: 'Facebook', baseUrl: 'https://facebook.com/', color: 'blue' },
    { key: 'twitter' as const, name: 'Twitter', baseUrl: 'https://twitter.com/', color: 'sky' },
  ];

  return (
    <div>
      <label className="text-sm font-medium text-gray-500">Social Media</label>
      <div className="flex flex-wrap gap-2 mt-2">
        {socialPlatforms.map(({ key, name, baseUrl, color }) => {
          const handle = socialMedia[key];
          if (handle === undefined || handle === '') return;

          return (
            <a
              key={key}
              href={`${baseUrl}${handle}`}
              target="_blank"
              rel="noopener noreferrer"
              className={`flex items-center gap-1 px-2 py-1 bg-${color}-100 text-${color}-800 rounded-md text-sm hover:bg-${color}-200`}
            >
              <Globe className="size-3" />
              {name}
            </a>
          );
        })}
      </div>
    </div>
  );
}
