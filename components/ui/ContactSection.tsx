
import { Phone, Globe, Star } from 'lucide-react';

interface ContactSectionProps {
  readonly contactInfo?: { phone?: string; website?: string };
  readonly verificationStatus?: string;
  readonly showFallback?: boolean;
}

// Default props to ensure consistent behavior
const defaultProps = {
  contactInfo: undefined,
  showFallback: true,
};

/**
* Renders a contact section displaying phone, website, and verification status information.
* @example
* ContactSection({ contactInfo: { phone: '123-456-7890', website: 'https://example.com' }, verificationStatus: 'verified' })
* JSX component displaying contact details.
* @param {Readonly<ContactSectionProps>} props - Object containing contact information, verification status, and options.
* @returns {JSX.Element} A component that renders the user's contact information section.
* @description
*   - Uses conditional rendering to display contact details only if they are defined and not empty.
*   - The phone link allows users to initiate a call via a clickable phone number.
*   - The website link opens in a new tab ensuring original page remains intact.
*   - Verification status is displayed as text indicating the status of the contact.
*   - Shows fallback message when no contact info is available (if showFallback is true).
*/
export function ContactSection(props: Readonly<ContactSectionProps>) {
  const { contactInfo, verificationStatus, showFallback } = { ...defaultProps, ...props };
  
  // Validate contact information - check for undefined, null, empty string, and whitespace-only strings
  const validPhone = (contactInfo?.phone && contactInfo.phone.trim() !== '') ? contactInfo.phone.trim() : undefined;
  const validWebsite = (contactInfo?.website && contactInfo.website.trim() !== '') ? contactInfo.website.trim() : undefined;
  const validVerificationStatus = (verificationStatus && verificationStatus.trim() !== '') ? verificationStatus.trim() : undefined;
  
  // Check if any valid contact info exists
  const hasValidContactInfo = Boolean(validPhone ?? validWebsite);
  
  return (
    <div>
      <h4 className="font-medium mb-2 text-sm dark:text-gray-100">Contact</h4>
      <div className="space-y-1 dark:text-gray-300">
        {hasValidContactInfo ? (
          <>
            {validPhone && (
              <a
                href={`tel:${validPhone}`}
                className="flex items-center text-sm hover:text-blue-600 dark:hover:text-blue-400"
              >
                <Phone className="size-3 mr-1" />
                <span className="truncate">{validPhone}</span>
              </a>
            )}
            {validWebsite && (
              <a
                href={validWebsite}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center text-sm hover:text-blue-600 dark:hover:text-blue-400"
              >
                <Globe className="size-3 mr-1" />
                <span className="truncate">Website</span>
              </a>
            )}
          </>
        ) : (
          showFallback && (
            <p className="text-sm text-gray-500 dark:text-gray-400 italic">No contact information available</p>
          )
        )}
        {validVerificationStatus && (
          <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
            <Star className="size-3 mr-1" />
            <span className="capitalize">{validVerificationStatus}</span>
          </div>
        )}
      </div>
    </div>
  );
}
