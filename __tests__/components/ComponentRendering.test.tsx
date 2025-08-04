import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { ContactSection } from '@/components/ui/ContactSection';
import { SocialMediaSection } from '@/components/ui/SocialMediaSection';
import { TruckContactInfo } from '@/components/trucks/TruckContactInfo';

// Test cases for rendering components with full contact/social objects or null/undefined values

describe('Component Rendering Tests', () => {
  describe('ContactSection Component', () => {
    it('renders full contact info without crashing', () => {
      render(
        <ContactSection
          contactInfo={{ phone: '123-456-7890', website: 'https://example.com' }}
          verificationStatus="verified"
        />
      );
      expect(screen.getByText('123-456-7890')).toBeInTheDocument();
      expect(screen.getByText('Website')).toBeInTheDocument();
      expect(screen.getByText('verified')).toBeInTheDocument();
    });

    it('renders fallback message when contact info is undefined', () => {
      render(<ContactSection contactInfo={undefined} />);
      expect(screen.getByText('No contact information available')).toBeInTheDocument();
    });
  });

  describe('SocialMediaSection Component', () => {
    it('renders full social media info without crashing', () => {
      render(
        <SocialMediaSection
          socialMedia={{ instagram: 'instaUser', facebook: 'fbUser', twitter: 'twUser' }}
        />
      );
      expect(screen.getByText('Instagram')).toBeInTheDocument();
      expect(screen.getByText('Facebook')).toBeInTheDocument();
      expect(screen.getByText('Twitter')).toBeInTheDocument();
    });

    it('renders fallback message when social media info is undefined', () => {
      render(<SocialMediaSection socialMedia={undefined} />);
      expect(screen.getByText('No social media profiles available')).toBeInTheDocument();
    });
  });

  describe('TruckContactInfo Component', () => {
    it('renders complete contact and social media info without crashing', () => {
      render(
        <TruckContactInfo
          truck={{
            contact_info: { phone: '123-456-7890', email: 'email@example.com', website: 'https://example.com' },
            social_media: { instagram: 'instaUser', facebook: 'fbUser', twitter: 'twUser' }
          } as any}
        />
      );
      expect(screen.getByText('123-456-7890')).toBeInTheDocument();
      expect(screen.getByText('email@example.com')).toBeInTheDocument();
      expect(screen.getByText('Visit Website')).toBeInTheDocument();
      expect(screen.getByText('Instagram')).toBeInTheDocument();
      expect(screen.getByText('Facebook')).toBeInTheDocument();
      expect(screen.getByText('Twitter')).toBeInTheDocument();
    });

    it('renders fallback messages when contact and social media info is undefined', () => {
      render(<TruckContactInfo truck={{ contact_info: undefined, social_media: undefined } as any} />);
      expect(screen.getByText('No phone number available')).toBeInTheDocument();
      expect(screen.getByText('No email available')).toBeInTheDocument();
      expect(screen.getByText('No website available')).toBeInTheDocument();
    });
  });
});

