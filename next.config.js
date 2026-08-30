/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.supabase.co',
      },
    ],
  },

  // Disable source maps in production to avoid exposing server code
  productionBrowserSourceMaps: false,

  // Security headers applied to all routes
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          // Prevent MIME-type sniffing
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          // Prevent clickjacking on all pages
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
          // Control referrer info sent to external sites
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          // Restrict browser features
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=(), interest-cohort=()',
          },
        ],
      },
      // Extra: deny framing of admin pages entirely
      {
        source: '/admin/(.*)',
        headers: [
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'Cache-Control', value: 'no-store, no-cache, must-revalidate, proxy-revalidate' },
        ],
      },
    ]
  },
}

module.exports = nextConfig
