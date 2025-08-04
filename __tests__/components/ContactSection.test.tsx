import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { ContactSection } from '@/components/ui/ContactSection';

describe('ContactSection Component', () => {
  describe('with valid contact information', () => {
    it('renders phone number correctly', () => {
      render(
        <ContactSection
          contactInfo={{ phone: '(555) 123-4567' }}
          showFallback={true}
        />
      );
      
      const phoneLink = screen.getByRole('link', { name: /\(555\) 123-4567/i });
      expect(phoneLink).toBeInTheDocument();
      expect(phoneLink).toHaveAttribute('href', 'tel:(555) 123-4567');
    });

    it('renders website link correctly', () => {
      render(
        <ContactSection
          contactInfo={{ website: 'https://example.com' }}
          showFallback={true}
        />
      );
      
      const websiteLink = screen.getByRole('link', { name: /website/i });
      expect(websiteLink).toBeInTheDocument();
      expect(websiteLink).toHaveAttribute('href', 'https://example.com');
      expect(websiteLink).toHaveAttribute('target', '_blank');
    });

    it('renders both phone and website when provided', () => {
      render(
        <ContactSection
          contactInfo={{ 
            phone: '(555) 123-4567',
            website: 'https://example.com'
          }}
          verificationStatus="verified"
          showFallback={true}
        />
      );
      
      expect(screen.getByRole('link', { name: /\(555\) 123-4567/i })).toBeInTheDocument();
      expect(screen.getByRole('link', { name: /website/i })).toBeInTheDocument();
      expect(screen.getByText('verified')).toBeInTheDocument();
    });
  });

  describe('with null/undefined values', () => {
    it('renders fallback message when contactInfo is undefined', () => {
      render(
        <ContactSection
          contactInfo={undefined}
          showFallback={true}
        />
      );
      
      expect(screen.getByText('No contact information available')).toBeInTheDocument();
    });

    it('renders fallback message when contactInfo is null', () => {
      render(
        <ContactSection
          contactInfo={null as any}
          showFallback={true}
        />
      );
      
      expect(screen.getByText('No contact information available')).toBeInTheDocument();
    });

    it('renders fallback message when contactInfo has empty fields', () => {
      render(
        <ContactSection
          contactInfo={{ phone: '', website: '' }}
          showFallback={true}
        />
      );
      
      expect(screen.getByText('No contact information available')).toBeInTheDocument();
    });

    it('renders fallback message when contactInfo has whitespace-only fields', () => {
      render(
        <ContactSection
          contactInfo={{ phone: '   ', website: '\t\n' }}
          showFallback={true}
        />
      );
      
      expect(screen.getByText('No contact information available')).toBeInTheDocument();
    });

    it('hides fallback message when showFallback is false', () => {
      render(
        <ContactSection
          contactInfo={undefined}
          showFallback={false}
        />
      );
      
      expect(screen.queryByText('No contact information available')).not.toBeInTheDocument();
    });
  });

  describe('with partial contact information', () => {
    it('renders only phone when website is missing', () => {
      render(
        <ContactSection
          contactInfo={{ phone: '(555) 123-4567' }}
          showFallback={true}
        />
      );
      
      expect(screen.getByRole('link', { name: /\(555\) 123-4567/i })).toBeInTheDocument();
      expect(screen.queryByRole('link', { name: /website/i })).not.toBeInTheDocument();
      expect(screen.queryByText('No contact information available')).not.toBeInTheDocument();
    });

    it('renders only website when phone is missing', () => {
      render(
        <ContactSection
          contactInfo={{ website: 'https://example.com' }}
          showFallback={true}
        />
      );
      
      expect(screen.getByRole('link', { name: /website/i })).toBeInTheDocument();
      expect(screen.queryByRole('link', { name: /phone/i })).not.toBeInTheDocument();
      expect(screen.queryByText('No contact information available')).not.toBeInTheDocument();
    });
  });

  describe('with verification status', () => {
    it('displays verification status when provided', () => {
      render(
        <ContactSection
          contactInfo={{ phone: '(555) 123-4567' }}
          verificationStatus="verified"
          showFallback={true}
        />
      );
      
      expect(screen.getByText('verified')).toBeInTheDocument();
    });

    it('does not display verification status when undefined', () => {
      render(
        <ContactSection
          contactInfo={{ phone: '(555) 123-4567' }}
          verificationStatus={undefined}
          showFallback={true}
        />
      );
      
      expect(screen.queryByText('verified')).not.toBeInTheDocument();
    });

    it('does not display verification status when empty string', () => {
      render(
        <ContactSection
          contactInfo={{ phone: '(555) 123-4567' }}
          verificationStatus=""
          showFallback={true}
        />
      );
      
      expect(screen.queryByText('verified')).not.toBeInTheDocument();
    });
  });

  describe('accessibility', () => {
    it('has proper heading structure', () => {
      render(
        <ContactSection
          contactInfo={{ phone: '(555) 123-4567' }}
          showFallback={true}
        />
      );
      
      expect(screen.getByRole('heading', { name: /contact/i })).toBeInTheDocument();
    });

    it('phone link has proper tel: protocol', () => {
      render(
        <ContactSection
          contactInfo={{ phone: '(555) 123-4567' }}
          showFallback={true}
        />
      );
      
      const phoneLink = screen.getByRole('link', { name: /\(555\) 123-4567/i });
      expect(phoneLink).toHaveAttribute('href', 'tel:(555) 123-4567');
    });

    it('website link has proper security attributes', () => {
      render(
        <ContactSection
          contactInfo={{ website: 'https://example.com' }}
          showFallback={true}
        />
      );
      
      const websiteLink = screen.getByRole('link', { name: /website/i });
      expect(websiteLink).toHaveAttribute('target', '_blank');
      expect(websiteLink).toHaveAttribute('rel', 'noopener noreferrer');
    });
  });
});
