
import { Phone, Globe, Star } from 'lucide-react';

interface ContactSectionProps {
  readonly contactInfo?: { phone?: string; website?: string };
  readonly verificationStatus?: string;
}

/**
* Renders a contact section displaying phone, website, and verification status information.
* @example
* ContactSection({ contactInfo: { phone: '123-456-7890', website: 'https://example.com' }, verificationStatus: 'verified' })
* JSX component displaying contact details.
* @param {Readonly<ContactSectionProps>} {contactInfo, verificationStatus} - Object containing contact information and verification status.
* @returns {JSX.Element} A component that renders the user's contact information section.
* @description
*   - Uses conditional rendering to display contact details only if they are defined.
*   - The phone link allows users to initiate a call via a clickable phone number.
*   - The website link opens in a new tab ensuring original page remains intact.
*   - Verification status is displayed as text indicating the status of the contact.
*/
export function ContactSection({ contactInfo, verificationStatus }: Readonly<ContactSectionProps>) {
  return (
    <div>
      <h4 className="font-medium mb-2 text-sm dark:text-gray-100">Contact</h4>
      <div className="space-y-1 dark:text-gray-300">
        {contactInfo?.phone !== undefined && (
          <a
            href={`tel:${contactInfo.phone}`}
            className="flex items-center text-sm hover:text-blue-600 dark:hover:text-blue-400"
          >
            <Phone className="size-3 mr-1" />
            <span className="truncate">{contactInfo.phone}</span>
          </a>
        )}
        {contactInfo?.website !== undefined && (
          <a
            href={contactInfo.website}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center text-sm hover:text-blue-600 dark:hover:text-blue-400"
          >
            <Globe className="size-3 mr-1" />
            <span className="truncate">Website</span>
          </a>
        )}
        {verificationStatus !== undefined && (
          <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
            <Star className="size-3 mr-1" />
            <span className="capitalize">{verificationStatus}</span>
          </div>
        )}
      </div>
    </div>
  );
}
