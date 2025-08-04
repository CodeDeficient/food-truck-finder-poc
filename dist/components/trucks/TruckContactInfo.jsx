import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Phone, Mail, Globe } from 'lucide-react';
import * as React from 'react';
/**
 * Renders a contact field with icon, label, and value, handling both available and unavailable states.
 * @example
 * ContactField({
 *   icon: EmailIcon,
 *   label: 'Email',
 *   value: 'example@example.com',
 *   href: 'mailto:example@example.com',
 *   unavailableText: 'Not Available'
 * })
 * <div>...</div>
 * @param {React.ComponentType} icon - The icon component to display in the contact field.
 * @param {string} label - The label to display above the contact value.
 * @param {string} value - The contact value to display; if undefined or empty, displays unavailableText instead.
 * @param {string} [href] - The link associated with the contact value for redirection. Determines link behavior based on URL format.
 * @param {string} unavailableText - Text displayed when value is unavailable or empty.
 * @returns {JSX.Element} JSX structure for the contact field.
 * @description
 *   - Opens external links in a new tab with 'noopener noreferrer' for security.
 *   - Conditionally renders either a hyperlink or plain text based on value and href.
 *   - Applies specific styling based on the availability of the value.
 */
function ContactField({ icon: Icon, label, value, href, unavailableText, }) {
    if (value == undefined || value.length === 0) {
        // Handles null, undefined, and empty string
        return (<div className="flex items-center gap-3 text-gray-400">
        <Icon className="size-4"/>
        <span className="text-sm">{unavailableText}</span>
      </div>);
    }
    return (<div className="flex items-center gap-3">
      <Icon className="size-4 text-gray-500"/>
      <div>
        <label className="text-sm font-medium text-gray-500 dark:text-gray-400">{label}</label>
        {href !== undefined && href !== '' ? (<a href={href} target={href.startsWith('http') ? '_blank' : undefined} rel={href.startsWith('http') ? 'noopener noreferrer' : undefined} className="block text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 underline">
            {href.startsWith('http') ? 'Visit Website' : value}
          </a>) : (<p className="text-gray-900 dark:text-gray-200">{value}</p>)}
      </div>
    </div>);
}
/**
 * Renders social media links based on provided handles.
 * @example
 * SocialMediaLinks({ socialMedia: { instagram: 'insta_user', twitter: 'twit_user' } })
 * Renders and displays links for Instagram and Twitter.
 * @param {Object} {socialMedia} - Contains platform keys mapped to user handles.
 * @returns {JSX.Element|undefined} A JSX element displaying social media links or undefined if no valid links exist.
 * @description
 *   - Checks for undefined or empty socialMedia input to prevent unnecessary rendering.
 *   - Supports Instagram, Facebook, and Twitter platforms with specific styles.
 *   - Handles links are generated dynamically based on platform keys and user handles.
 *   - Applies consistent styling for light and dark themes using color properties.
 */
function SocialMediaLinks({ socialMedia, }) {
    if (socialMedia == undefined || Object.keys(socialMedia).length === 0) {
        return;
    }
    const socialPlatforms = [
        { key: 'instagram', name: 'Instagram', baseUrl: 'https://instagram.com/', color: 'pink' },
        { key: 'facebook', name: 'Facebook', baseUrl: 'https://facebook.com/', color: 'blue' },
        { key: 'twitter', name: 'Twitter', baseUrl: 'https://twitter.com/', color: 'sky' },
    ];
    return (<div>
      <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Social Media</label>
      <div className="flex flex-wrap gap-2 mt-2">
        {socialPlatforms.map(({ key, name, baseUrl, color }) => {
            const handle = socialMedia[key];
            if (handle == undefined || handle.length === 0)
                return; // Handles null, undefined, and empty string
            return (<a key={key} href={`${baseUrl}${handle}`} target="_blank" rel="noopener noreferrer" className={`flex items-center gap-1 px-2 py-1 bg-${color}-100 text-${color}-800 rounded-md text-sm hover:bg-${color}-200 dark:bg-${color}-900 dark:text-${color}-200`}>
              <Globe className="size-3"/>
              {name}
            </a>);
        })}
      </div>
    </div>);
}
/**
 * Renders a truck's contact information within a styled card component.
 * @example
 * TruckContactInfo({ truck: sampleTruckObject })
 * <Card>...</Card>
 * @param {Readonly<TruckContactInfoProps>} {truck} - Object containing truck's contact information and social media links.
 * @returns {JSX.Element} A card component displaying various contact fields and social media links.
 * @description
 *   - Utilizes conditional rendering to display availability of contact information.
 *   - Applies Tailwind CSS classes for dark mode styling.
 *   - Integrates icons alongside contact labels for visual aid.
 *   - SocialMediaLinks component is used to list the truck's social media presence.
 */
export function TruckContactInfo({ truck }) {
    var _a, _b, _c, _d, _e, _f;
    return (<Card className="dark:bg-slate-800 dark:border-slate-700">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 dark:text-gray-100">
          <Phone className="size-5"/>
          Contact Information
        </CardTitle>
        <CardDescription className="dark:text-gray-400">Get in touch</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <ContactField icon={Phone} label="Phone" value={(_a = truck.contact_info) === null || _a === void 0 ? void 0 : _a.phone} href={((_b = truck.contact_info) === null || _b === void 0 ? void 0 : _b.phone) !== undefined && truck.contact_info.phone !== ''
            ? `tel:${truck.contact_info.phone}`
            : undefined} unavailableText="No phone number available"/>

        <ContactField icon={Mail} label="Email" value={(_c = truck.contact_info) === null || _c === void 0 ? void 0 : _c.email} href={((_d = truck.contact_info) === null || _d === void 0 ? void 0 : _d.email) !== undefined && truck.contact_info.email !== ''
            ? `mailto:${truck.contact_info.email}`
            : undefined} unavailableText="No email available"/>

        <ContactField icon={Globe} label="Website" value={(_e = truck.contact_info) === null || _e === void 0 ? void 0 : _e.website} href={(_f = truck.contact_info) === null || _f === void 0 ? void 0 : _f.website} unavailableText="No website available"/>

        <SocialMediaLinks socialMedia={truck.social_media}/>
      </CardContent>
    </Card>);
}
