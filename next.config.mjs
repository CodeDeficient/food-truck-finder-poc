/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: false, // Enable ESLint checks during production builds
  },
  typescript: {
    ignoreBuildErrors: false, // Enable TypeScript checks during production builds
  },
  images: {
    // Enable Next.js Image optimization for better Core Web Vitals
    unoptimized: false,
    // Configure image domains for external images
    domains: [
      'images.unsplash.com',
      'via.placeholder.com',
      'example.com',
      'zkwliyjjkdnigizidlln.supabase.co'
    ],
    // Configure image formats for optimal loading
    formats: ['image/webp', 'image/avif'],
    // Configure image sizes for responsive loading
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },
  // Enable React Strict Mode for better development experience
  reactStrictMode: true,
  // Enable experimental features for performance
  experimental: {
    // Enable optimized package imports for better tree shaking
    optimizePackageImports: [
      '@radix-ui/react-icons',
      '@radix-ui/react-dropdown-menu',
      '@radix-ui/react-dialog',
      '@radix-ui/react-slot',
      'lucide-react',
      'recharts'
    ],
    // Enable SWC minification for better performance
    swcMinify: true,
  },
  // Bundle optimization
  webpack: (config, { buildId, dev, isServer, defaultLoaders, webpack }) => {
    // Optimize bundle splitting
    if (!dev && !isServer) {
      config.optimization.splitChunks = {
        chunks: 'all',
        cacheGroups: {
          // Vendor chunk for stable dependencies
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendors',
            priority: 10,
            reuseExistingChunk: true,
          },
          // UI components chunk
          ui: {
            test: /[\\/]node_modules[\\/](@radix-ui|lucide-react)[\\/]/,
            name: 'ui',
            priority: 20,
            reuseExistingChunk: true,
          },
          // Charts chunk (heavy dependency)
          charts: {
            test: /[\\/]node_modules[\\/](recharts)[\\/]/,
            name: 'charts',
            priority: 30,
            reuseExistingChunk: true,
          },
          // Supabase chunk
          supabase: {
            test: /[\\/]node_modules[\\/](@supabase)[\\/]/,
            name: 'supabase',
            priority: 25,
            reuseExistingChunk: true,
          },
        },
      };
    }

    return config;
  },
  // SOTA Security Headers Implementation
  async headers() {
    // Content Security Policy for XSS protection
    const cspHeader = `
      default-src 'self';
      script-src 'self' 'unsafe-eval' 'unsafe-inline' https://accounts.google.com https://apis.google.com;
      style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
      img-src 'self' blob: data: https: *.supabase.co;
      font-src 'self' https://fonts.gstatic.com;
      object-src 'none';
      base-uri 'self';
      form-action 'self';
      frame-ancestors 'none';
      connect-src 'self' https://*.supabase.co https://accounts.google.com https://api.firecrawl.dev https://generativelanguage.googleapis.com wss://*.supabase.co;
      worker-src 'self' blob:;
      child-src 'self';
      manifest-src 'self';
      media-src 'self';
      upgrade-insecure-requests;
    `.replace(/\n/g, '').replace(/\s{2,}/g, ' ').trim();

    return [
      {
        // Apply security headers to all routes
        source: '/(.*)',
        headers: [
          // Content Security Policy
          {
            key: 'Content-Security-Policy',
            value: cspHeader,
          },
          // Prevent clickjacking attacks
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          // Prevent MIME type sniffing
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          // Force HTTPS connections
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload',
          },
          // Control referrer information
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin',
          },
          // Disable DNS prefetching for privacy
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on',
          },
          // Permissions policy for enhanced security
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=(self), interest-cohort=()',
          },
        ],
      },
    ];
  },
}

export default nextConfig
