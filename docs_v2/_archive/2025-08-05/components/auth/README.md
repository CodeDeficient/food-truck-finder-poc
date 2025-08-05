# Authentication Components

Enterprise-grade authentication components with state-of-the-art security features and best practices.

## Components Overview

### 🔐 AuthModal
Main authentication modal component with email/OAuth authentication.

### 📧 AuthEmailForm  
Dedicated email/password authentication form with password strength validation.

### 🌐 AuthOAuthForm
OAuth social login form supporting Google, GitHub, and other providers.

### 👤 AvatarMenu
User avatar dropdown menu with profile access and sign-out functionality.

## 🛡️ Security Features

### Password Security
- **Real-time strength validation** with visual feedback
- **Complexity requirements**: minimum 8 characters, mixed case, numbers, symbols
- **Progressive scoring** from weak (0-1) to strong (4)
- **Detailed feedback** with specific improvement suggestions

### Rate Limiting
- **Configurable attempt limits** (default: 5 attempts)
- **Time window protection** (default: 15 minutes)
- **Automatic account protection** from brute force attacks
- **Client-side attempt tracking** with state persistence

### Device Fingerprinting
- **Browser fingerprinting** for device identification
- **Canvas-based fingerprinting** for uniqueness
- **Session tracking** across authentication attempts
- **Enhanced security** for suspicious activity detection

### Error Handling
- **Detailed error messages** with field-specific feedback
- **Graceful degradation** for network issues
- **User-friendly notifications** with actionable guidance
- **Comprehensive logging** for debugging

## 🎨 Design Features

### SSR Safety
- **Hydration-safe rendering** with mounted state checks
- **Theme-aware styling** with dark/light mode support
- **Progressive enhancement** for JavaScript-disabled users

### Accessibility
- **ARIA labels and roles** for screen readers
- **Keyboard navigation** support
- **Focus management** within modals
- **Color contrast compliance** (WCAG AA)

### Responsive Design
- **Mobile-first approach** with touch-friendly interfaces
- **Flexible layouts** adapting to screen sizes
- **Consistent spacing** using design system tokens

## 📱 Usage Examples

### Basic Authentication Modal

```tsx
import { AuthModal } from '@/components/auth';

export function LoginPage() {
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <AuthModal
      mounted={mounted}
      isOpen={isOpen}
      onClose={() => setIsOpen(false)}
      onAuthSuccess={() => {
        setIsOpen(false);
        // Handle successful authentication
      }}
    />
  );
}
```

### Enhanced Security Configuration

```tsx
<AuthModal
  mounted={mounted}
  isOpen={isOpen}
  enableCaptcha={true}
  rateLimitConfig={{
    maxAttempts: 3,
    windowMs: 300000 // 5 minutes
  }}
  onClose={() => setIsOpen(false)}
  onAuthSuccess={handleAuthSuccess}
/>
```

### Avatar Menu with User Data

```tsx
import { AvatarMenu } from '@/components/auth';

export function NavigationBar({ user }: { user: User | null }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <AvatarMenu
      mounted={mounted}
      user={user}
      onSignOut={() => {
        // Handle sign out
      }}
      onProfileClick={() => {
        // Navigate to profile
      }}
    />
  );
}
```

## 🧪 Testing

### Unit Tests
Comprehensive test suite covering:
- Component rendering and state management
- Authentication flow handling
- Error state management
- Security feature validation
- Accessibility compliance

### Integration Tests
- Supabase authentication integration
- OAuth provider flows
- Rate limiting enforcement
- Password strength validation

### Visual Regression Tests
- Storybook stories for all component states
- Cross-browser compatibility testing
- Mobile responsiveness validation
- Dark/light theme consistency

## 🔧 Configuration Options

### AuthModal Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `mounted` | `boolean` | - | SSR safety flag |
| `resolvedTheme` | `string` | - | Current theme for styling |
| `isOpen` | `boolean` | `false` | Modal visibility |
| `onClose` | `function` | - | Close callback |
| `onAuthSuccess` | `function` | - | Success callback |
| `enableCaptcha` | `boolean` | `false` | Enable CAPTCHA |
| `rateLimitConfig` | `object` | See below | Rate limiting settings |

### Rate Limit Configuration

```tsx
interface RateLimitConfig {
  maxAttempts: number;    // Maximum attempts allowed
  windowMs: number;       // Time window in milliseconds
}

// Default configuration
const defaultRateLimit = {
  maxAttempts: 5,
  windowMs: 900000  // 15 minutes
};
```

## 🚀 Performance

### Bundle Size
- **Optimized imports** to minimize bundle impact
- **Code splitting** for authentication features
- **Tree shaking** support for unused components

### Runtime Performance
- **Efficient re-renders** with React.memo optimizations
- **Debounced inputs** for password strength calculation
- **Minimal API calls** with intelligent caching

## 🔄 Integration with Supabase

### Authentication Methods
- **Email/Password**: Native Supabase auth
- **OAuth Providers**: Google, GitHub, Apple, etc.
- **Magic Links**: Email-based passwordless auth
- **Phone Auth**: SMS-based authentication

### Security Best Practices
- **Row Level Security (RLS)** for user data
- **JWT tokens** with automatic refresh
- **Secure session management**
- **CSRF protection** built-in

## 📊 Monitoring & Analytics

### Security Metrics
- Failed authentication attempts
- Rate limiting activations
- Password strength distributions
- Device fingerprint uniqueness

### User Experience Metrics
- Authentication success rates
- Form completion times
- Error message effectiveness
- Mobile vs desktop usage

## 🎯 Future Enhancements

### Planned Features
- **Biometric authentication** (WebAuthn)
- **Multi-factor authentication** (TOTP, SMS)
- **Advanced CAPTCHA** integration
- **Enhanced device fingerprinting**

### Security Improvements
- **Behavioral analysis** for fraud detection
- **Advanced rate limiting** with IP reputation
- **Session anomaly detection**
- **Enhanced password policies**

## 🤝 Contributing

When contributing to authentication components:

1. **Security First**: All changes must maintain or improve security posture
2. **Test Coverage**: Maintain 90%+ test coverage for security-critical code
3. **Documentation**: Update all relevant documentation
4. **Accessibility**: Ensure WCAG AA compliance
5. **Performance**: Validate bundle size and runtime performance

## 📞 Support

For security vulnerabilities, please report privately to the security team.
For general questions, use the project's issue tracker.
