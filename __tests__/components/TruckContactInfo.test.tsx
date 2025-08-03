import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { TruckContactInfo } from '@/components/trucks/TruckContactInfo';
import type { FoodTruck } from '@/lib/types';

// Mock the safe utility function
jest.mock('@/lib/utils/safeObject', () => ({
  safe: (obj: any) => obj || {}
}));

describe('TruckContactInfo Component', () => {
  const createMockTruck = (overrides: Partial<FoodTruck> = {}): FoodTruck => ({
    id: '1',
    name: 'Test Truck',
    description: 'Test Description',
    created_at: '2024-01-01',
    updated_at: '2024-01-01',
    current_location: {
      lat: 0,
      lng: 0,
      address: 'Test Address',
      timestamp: '2024-01-01'
    },
    scheduled_locations: [],
    operating_hours: {
      monday: { open: '09:00', close: '17:00' },
      tuesday: { open: '09:00', close: '17:00' },
      wednesday: { open: '09:00', close: '17:00' },
      thursday: { open: '09:00', close: '17:00' },
      friday: { open: '09:00', close: '17:00' },
      saturday: { closed: true },
      sunday: { closed: true }
    },
    menu: [],
    cuisine_type: ['American'],
    price_range: '$',
    specialties: [],
    data_quality_score: 0.5,
    verification_status: 'pending',
    source_urls: [],
    last_scraped_at: '2024-01-01',
    ...overrides
  });

  describe('with complete contact and social media information', () => {
    it('renders all contact information correctly', () => {
      const truck = createMockTruck({
        contact_info: {
          phone: '(555) 123-4567',
          email: 'test@example.com',
          website: 'https://example.com'
        },
        social_media: {
          instagram: 'test_insta',
          facebook: 'test_fb',
          twitter: 'test_tw'
        }
      });

      render(<TruckContactInfo truck={truck} />);

      // Check contact info
      expect(screen.getByText('(555) 123-4567')).toBeInTheDocument();
      expect(screen.getByText('test@example.com')).toBeInTheDocument();
      expect(screen.getByText('Visit Website')).toBeInTheDocument();

      // Check social media
      expect(screen.getByText('Instagram')).toBeInTheDocument();
      expect(screen.getByText('Facebook')).toBeInTheDocument();
      expect(screen.getByText('Twitter')).toBeInTheDocument();
    });

    it('renders proper links with correct hrefs', () => {
      const truck = createMockTruck({
        contact_info: {
          phone: '(555) 123-4567',
          email: 'test@example.com',
          website: 'https://example.com'
        },
        social_media: {
          instagram: 'test_insta',
          facebook: 'test_fb',
          twitter: 'test_tw'
        }
      });

      render(<TruckContactInfo truck={truck} />);

      // Check phone link
      const phoneLink = screen.getByRole('link', { name: /\(555\) 123-4567/i });
      expect(phoneLink).toHaveAttribute('href', 'tel:(555) 123-4567');

      // Check email link
      const emailLink = screen.getByRole('link', { name: /test@example\.com/i });
      expect(emailLink).toHaveAttribute('href', 'mailto:test@example.com');

      // Check website link
      const websiteLink = screen.getByRole('link', { name: /visit website/i });
      expect(websiteLink).toHaveAttribute('href', 'https://example.com');
      expect(websiteLink).toHaveAttribute('target', '_blank');

      // Check social media links
      const instagramLink = screen.getByRole('link', { name: /instagram/i });
      expect(instagramLink).toHaveAttribute('href', 'https://instagram.com/test_insta');

      const facebookLink = screen.getByRole('link', { name: /facebook/i });
      expect(facebookLink).toHaveAttribute('href', 'https://facebook.com/test_fb');

      const twitterLink = screen.getByRole('link', { name: /twitter/i });
      expect(twitterLink).toHaveAttribute('href', 'https://twitter.com/test_tw');
    });
  });

  describe('with null/undefined contact information', () => {
    it('renders fallback messages when contact_info is undefined', () => {
      const truck = createMockTruck({
        contact_info: undefined,
        social_media: undefined
      });

      render(<TruckContactInfo truck={truck} />);

      expect(screen.getByText('No phone number available')).toBeInTheDocument();
      expect(screen.getByText('No email available')).toBeInTheDocument();
      expect(screen.getByText('No website available')).toBeInTheDocument();
    });

    it('renders fallback messages when contact_info is null', () => {
      const truck = createMockTruck({
        contact_info: null as any,
        social_media: null as any
      });

      render(<TruckContactInfo truck={truck} />);

      expect(screen.getByText('No phone number available')).toBeInTheDocument();
      expect(screen.getByText('No email available')).toBeInTheDocument();
      expect(screen.getByText('No website available')).toBeInTheDocument();
    });

    it('renders fallback messages when contact fields are empty strings', () => {
      const truck = createMockTruck({
        contact_info: {
          phone: '',
          email: '',
          website: ''
        },
        social_media: {}
      });

      render(<TruckContactInfo truck={truck} />);

      expect(screen.getByText('No phone number available')).toBeInTheDocument();
      expect(screen.getByText('No email available')).toBeInTheDocument();
      expect(screen.getByText('No website available')).toBeInTheDocument();
    });

    it('does not render social media section when social_media is undefined', () => {
      const truck = createMockTruck({
        contact_info: {
          phone: '(555) 123-4567'
        },
        social_media: undefined
      });

      render(<TruckContactInfo truck={truck} />);

      expect(screen.queryByText('Instagram')).not.toBeInTheDocument();
      expect(screen.queryByText('Facebook')).not.toBeInTheDocument();
      expect(screen.queryByText('Twitter')).not.toBeInTheDocument();
    });
  });

  describe('with partial contact information', () => {
    it('renders only phone when other contact info is missing', () => {
      const truck = createMockTruck({
        contact_info: {
          phone: '(555) 123-4567'
        }
      });

      render(<TruckContactInfo truck={truck} />);

      expect(screen.getByText('(555) 123-4567')).toBeInTheDocument();
      expect(screen.getByText('No email available')).toBeInTheDocument();
      expect(screen.getByText('No website available')).toBeInTheDocument();
    });

    it('renders only email when other contact info is missing', () => {
      const truck = createMockTruck({
        contact_info: {
          email: 'test@example.com'
        }
      });

      render(<TruckContactInfo truck={truck} />);

      expect(screen.getByText('test@example.com')).toBeInTheDocument();
      expect(screen.getByText('No phone number available')).toBeInTheDocument();
      expect(screen.getByText('No website available')).toBeInTheDocument();
    });

    it('renders only website when other contact info is missing', () => {
      const truck = createMockTruck({
        contact_info: {
          website: 'https://example.com'
        }
      });

      render(<TruckContactInfo truck={truck} />);

      expect(screen.getByText('Visit Website')).toBeInTheDocument();
      expect(screen.getByText('No phone number available')).toBeInTheDocument();
      expect(screen.getByText('No email available')).toBeInTheDocument();
    });

    it('renders only available social media platforms', () => {
      const truck = createMockTruck({
        contact_info: {},
        social_media: {
          instagram: 'test_insta'
          // facebook and twitter are undefined
        }
      });

      render(<TruckContactInfo truck={truck} />);

      expect(screen.getByText('Instagram')).toBeInTheDocument();
      expect(screen.queryByText('Facebook')).not.toBeInTheDocument();
      expect(screen.queryByText('Twitter')).not.toBeInTheDocument();
    });
  });

  describe('edge cases', () => {
    it('renders whitespace-only contact information as links (actual behavior)', () => {
      const truck = createMockTruck({
        contact_info: {
          phone: '   ',
          email: '\t\n',
          website: '  '
        }
      });

      render(<TruckContactInfo truck={truck} />);

      // The component doesn't trim whitespace, so whitespace-only strings are treated as valid values
      // and render as clickable links. Since testing library trims accessible names,
      // we check for links with the appropriate hrefs
      const links = screen.getAllByRole('link');
      expect(links).toHaveLength(3); // Three empty-name links
      expect(links.some(link => link.getAttribute('href') === 'tel:   ')).toBe(true);
      expect(links.some(link => link.getAttribute('href') === 'mailto:\t\n')).toBe(true);
      expect(links.some(link => link.getAttribute('href') === '  ')).toBe(true);
    });

    it('handles mixed valid and invalid contact information', () => {
      const truck = createMockTruck({
        contact_info: {
          phone: '(555) 123-4567',
          email: '',
          website: '   '
        }
      });

      render(<TruckContactInfo truck={truck} />);

      expect(screen.getByText('(555) 123-4567')).toBeInTheDocument();
      expect(screen.getByText('No email available')).toBeInTheDocument();
      // Website with spaces is treated as valid by the component - check by href since name is trimmed
      const links = screen.getAllByRole('link');
      expect(links.some(link => link.getAttribute('href') === '   ')).toBe(true);
    });

    it('handles empty social media object', () => {
      const truck = createMockTruck({
        social_media: {}
      });

      render(<TruckContactInfo truck={truck} />);

      expect(screen.queryByText('Instagram')).not.toBeInTheDocument();
      expect(screen.queryByText('Facebook')).not.toBeInTheDocument();
      expect(screen.queryByText('Twitter')).not.toBeInTheDocument();
    });
  });

  describe('accessibility', () => {
    it('has proper card structure with title', () => {
      const truck = createMockTruck({
        contact_info: {
          phone: '(555) 123-4567'
        }
      });

      render(<TruckContactInfo truck={truck} />);

      // CardTitle is a div, not a semantic heading
      expect(screen.getByText('Contact Information')).toBeInTheDocument();
      expect(screen.getByText('Get in touch')).toBeInTheDocument();
    });

    it('has proper labels for each contact field', () => {
      const truck = createMockTruck({
        contact_info: {
          phone: '(555) 123-4567',
          email: 'test@example.com',
          website: 'https://example.com'
        }
      });

      render(<TruckContactInfo truck={truck} />);

      expect(screen.getByText('Phone')).toBeInTheDocument();
      expect(screen.getByText('Email')).toBeInTheDocument();
      expect(screen.getByText('Website')).toBeInTheDocument();
    });

    it('has proper security attributes for external links', () => {
      const truck = createMockTruck({
        contact_info: {
          website: 'https://example.com'
        },
        social_media: {
          instagram: 'test_insta'
        }
      });

      render(<TruckContactInfo truck={truck} />);

      const websiteLink = screen.getByRole('link', { name: /visit website/i });
      expect(websiteLink).toHaveAttribute('target', '_blank');
      expect(websiteLink).toHaveAttribute('rel', 'noopener noreferrer');

      const instagramLink = screen.getByRole('link', { name: /instagram/i });
      expect(instagramLink).toHaveAttribute('target', '_blank');
      expect(instagramLink).toHaveAttribute('rel', 'noopener noreferrer');
    });
  });

  describe('component resilience', () => {
    it('does not crash when truck object has missing required fields', () => {
      const incompleteTruck = {
        contact_info: {
          phone: '(555) 123-4567'
        },
        social_media: {
          instagram: 'test_insta'
        }
      } as FoodTruck;

      expect(() => {
        render(<TruckContactInfo truck={incompleteTruck} />);
      }).not.toThrow();

      expect(screen.getByText('(555) 123-4567')).toBeInTheDocument();
      expect(screen.getByText('Instagram')).toBeInTheDocument();
    });

    it('handles deeply nested undefined properties gracefully', () => {
      const truck = {
        ...createMockTruck(),
        contact_info: {
          phone: undefined,
          email: undefined,
          website: undefined
        },
        social_media: {
          instagram: undefined,
          facebook: undefined,
          twitter: undefined
        }
      };

      render(<TruckContactInfo truck={truck} />);

      expect(screen.getByText('No phone number available')).toBeInTheDocument();
      expect(screen.getByText('No email available')).toBeInTheDocument();
      expect(screen.getByText('No website available')).toBeInTheDocument();
    });
  });
});
