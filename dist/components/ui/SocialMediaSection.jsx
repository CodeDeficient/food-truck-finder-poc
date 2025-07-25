import { Globe } from 'lucide-react';
/**
 * Renders a section with links to social media profiles if provided.
 * @example
 * SocialMediaSection({ instagram: 'username', facebook: 'user', twitter: 'user' })
 * Returns JSX elements with social media links.
 * @param {Readonly<SocialMediaSectionProps>} socialMedia - Object containing social media usernames.
 * @returns {JSX.Element | undefined} JSX elements representing social media links if available.
 * @description
 *   - Only renders if at least one social media username is provided.
 *   - Supports Instagram, Facebook, and Twitter links.
 *   - Styles links with appropriate colors based on social media platform.
 */
export function SocialMediaSection({ socialMedia }) {
    if (socialMedia === undefined || Object.keys(socialMedia).length === 0)
        return;
    return (<div>
      <h4 className="font-medium mb-2 text-sm dark:text-gray-100">Social Media</h4>
      <div className="flex flex-wrap gap-2">
        {socialMedia.instagram !== undefined && (<a href={`https://instagram.com/${socialMedia.instagram}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 px-2 py-1 bg-pink-100 text-pink-800 rounded-md text-xs hover:bg-pink-200 dark:bg-pink-900 dark:text-pink-200">
            <Globe className="size-3"/>
            Instagram
          </a>)}
        {socialMedia.facebook !== undefined && (<a href={`https://facebook.com/${socialMedia.facebook}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 rounded-md text-xs hover:bg-blue-200 dark:bg-blue-900 dark:text-blue-200">
            <Globe className="size-3"/>
            Facebook
          </a>)}
        {socialMedia.twitter !== undefined && (<a href={`https://twitter.com/${socialMedia.twitter}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 px-2 py-1 bg-sky-100 text-sky-800 rounded-md text-xs hover:bg-sky-200 dark:bg-sky-900 dark:text-sky-200">
            <Globe className="size-3"/>
            Twitter
          </a>)}
      </div>
    </div>);
}
