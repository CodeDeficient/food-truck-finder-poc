import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { SocialMediaSection } from '@/components/ui/SocialMediaSection';

describe('SocialMediaSection Component', () => {
  describe('with valid social media information', () => {
    it('renders Instagram link correctly', () => {
      render(
        <SocialMediaSection
          socialMedia={{ instagram: 'test_user' }}
          showFallback={true}
        />
      );
      
      const instagramLink = screen.getByRole('link', { name: /instagram/i });
      expect(instagramLink).toBeInTheDocument();
      expect(instagramLink).toHaveAttribute('href', 'https://instagram.com/test_user');
      expect(instagramLink).toHaveAttribute('target', '_blank');
      expect(instagramLink).toHaveAttribute('rel', 'noopener noreferrer');
    });

    it('renders Facebook link correctly', () => {
      render(
        <SocialMediaSection
          socialMedia={{ facebook: 'test.page' }}
          showFallback={true}
        />
      );
      
      const facebookLink = screen.getByRole('link', { name: /facebook/i });
      expect(facebookLink).toBeInTheDocument();
      expect(facebookLink).toHaveAttribute('href', 'https://facebook.com/test.page');
    });

    it('renders Twitter link correctly', () => {
      render(
        <SocialMediaSection
          socialMedia={{ twitter: 'test_handle' }}
          showFallback={true}
        />
      );
      
      const twitterLink = screen.getByRole('link', { name: /twitter/i });
      expect(twitterLink).toBeInTheDocument();
      expect(twitterLink).toHaveAttribute('href', 'https://twitter.com/test_handle');
    });

    it('renders all social media platforms when provided', () => {
      render(
        <SocialMediaSection
          socialMedia={{
            instagram: 'insta_user',
            facebook: 'fb_user',
            twitter: 'tw_user'
          }}
          showFallback={true}
        />
      );
      
      expect(screen.getByRole('link', { name: /instagram/i })).toBeInTheDocument();
      expect(screen.getByRole('link', { name: /facebook/i })).toBeInTheDocument();
      expect(screen.getByRole('link', { name: /twitter/i })).toBeInTheDocument();
    });
  });

  describe('with null/undefined values', () => {
    it('renders fallback message when socialMedia is undefined', () => {
      render(
        <SocialMediaSection
          socialMedia={undefined}
          showFallback={true}
        />
      );
      
      expect(screen.getByText('No social media profiles available')).toBeInTheDocument();
    });

    it('renders fallback message when socialMedia is null', () => {
      render(
        <SocialMediaSection
          socialMedia={null as any}
          showFallback={true}
        />
      );
      
      expect(screen.getByText('No social media profiles available')).toBeInTheDocument();
    });

    it('renders fallback message when all social media fields are empty', () => {
      render(
        <SocialMediaSection
          socialMedia={{ instagram: '', facebook: '', twitter: '' }}
          showFallback={true}
        />
      );
      
      expect(screen.getByText('No social media profiles available')).toBeInTheDocument();
    });

    it('renders fallback message when all social media fields are whitespace-only', () => {
      render(
        <SocialMediaSection
          socialMedia={{ instagram: '   ', facebook: '\t', twitter: '\n' }}
          showFallback={true}
        />
      );
      
      expect(screen.getByText('No social media profiles available')).toBeInTheDocument();
    });

    it('does not render anything when showFallback is false and no social media', () => {
      const { container } = render(
        <SocialMediaSection
          socialMedia={undefined}
          showFallback={false}
        />
      );
      
      expect(container.firstChild).toBeNull();
    });

    it('does not render anything when showFallback is false and empty social media', () => {
      const { container } = render(
        <SocialMediaSection
          socialMedia={{ instagram: '', facebook: '', twitter: '' }}
          showFallback={false}
        />
      );
      
      expect(container.firstChild).toBeNull();
    });
  });

  describe('with partial social media information', () => {
    it('renders only Instagram when other platforms are missing', () => {
      render(
        <SocialMediaSection
          socialMedia={{ instagram: 'test_user' }}
          showFallback={true}
        />
      );
      
      expect(screen.getByRole('link', { name: /instagram/i })).toBeInTheDocument();
      expect(screen.queryByRole('link', { name: /facebook/i })).not.toBeInTheDocument();
      expect(screen.queryByRole('link', { name: /twitter/i })).not.toBeInTheDocument();
      expect(screen.queryByText('No social media profiles available')).not.toBeInTheDocument();
    });

    it('renders only Facebook when other platforms are missing', () => {
      render(
        <SocialMediaSection
          socialMedia={{ facebook: 'test_page' }}
          showFallback={true}
        />
      );
      
      expect(screen.getByRole('link', { name: /facebook/i })).toBeInTheDocument();
      expect(screen.queryByRole('link', { name: /instagram/i })).not.toBeInTheDocument();
      expect(screen.queryByRole('link', { name: /twitter/i })).not.toBeInTheDocument();
      expect(screen.queryByText('No social media profiles available')).not.toBeInTheDocument();
    });

    it('renders only Twitter when other platforms are missing', () => {
      render(
        <SocialMediaSection
          socialMedia={{ twitter: 'test_handle' }}
          showFallback={true}
        />
      );
      
      expect(screen.getByRole('link', { name: /twitter/i })).toBeInTheDocument();
      expect(screen.queryByRole('link', { name: /instagram/i })).not.toBeInTheDocument();
      expect(screen.queryByRole('link', { name: /facebook/i })).not.toBeInTheDocument();
      expect(screen.queryByText('No social media profiles available')).not.toBeInTheDocument();
    });

    it('handles mixed valid and invalid social media handles', () => {
      render(
        <SocialMediaSection
          socialMedia={{ 
            instagram: 'valid_user',
            facebook: '',
            twitter: '   '
          }}
          showFallback={true}
        />
      );
      
      expect(screen.getByRole('link', { name: /instagram/i })).toBeInTheDocument();
      expect(screen.queryByRole('link', { name: /facebook/i })).not.toBeInTheDocument();
      expect(screen.queryByRole('link', { name: /twitter/i })).not.toBeInTheDocument();
    });
  });

  describe('accessibility', () => {
    it('has proper heading structure', () => {
      render(
        <SocialMediaSection
          socialMedia={{ instagram: 'test_user' }}
          showFallback={true}
        />
      );
      
      expect(screen.getByRole('heading', { name: /social media/i })).toBeInTheDocument();
    });

    it('all social media links have proper security attributes', () => {
      render(
        <SocialMediaSection
          socialMedia={{
            instagram: 'insta_user',
            facebook: 'fb_user',
            twitter: 'tw_user'
          }}
          showFallback={true}
        />
      );
      
      const links = screen.getAllByRole('link');
      links.forEach(link => {
        expect(link).toHaveAttribute('target', '_blank');
        expect(link).toHaveAttribute('rel', 'noopener noreferrer');
      });
    });

    it('links have proper HTTPS protocol', () => {
      render(
        <SocialMediaSection
          socialMedia={{
            instagram: 'insta_user',
            facebook: 'fb_user',
            twitter: 'tw_user'
          }}
          showFallback={true}
        />
      );
      
      const instagramLink = screen.getByRole('link', { name: /instagram/i });
      const facebookLink = screen.getByRole('link', { name: /facebook/i });
      const twitterLink = screen.getByRole('link', { name: /twitter/i });
      
      expect(instagramLink).toHaveAttribute('href', 'https://instagram.com/insta_user');
      expect(facebookLink).toHaveAttribute('href', 'https://facebook.com/fb_user');
      expect(twitterLink).toHaveAttribute('href', 'https://twitter.com/tw_user');
    });
  });

  describe('edge cases', () => {
    it('handles social media handles with special characters', () => {
      render(
        <SocialMediaSection
          socialMedia={{ instagram: 'user_with.dots-and_underscores123' }}
          showFallback={true}
        />
      );
      
      const instagramLink = screen.getByRole('link', { name: /instagram/i });
      expect(instagramLink).toHaveAttribute('href', 'https://instagram.com/user_with.dots-and_underscores123');
    });

    it('trims whitespace from valid social media handles', () => {
      render(
        <SocialMediaSection
          socialMedia={{ instagram: '  trimmed_user  ' }}
          showFallback={true}
        />
      );
      
      const instagramLink = screen.getByRole('link', { name: /instagram/i });
      expect(instagramLink).toHaveAttribute('href', 'https://instagram.com/trimmed_user');
    });
  });
});
