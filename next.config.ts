import type { NextConfig } from "next";

const apiUrlRaw = process.env.NEXT_PUBLIC_API_URL?.trim();
if (!apiUrlRaw) {
  throw new Error(
    "NEXT_PUBLIC_API_URL is required in clothing-shop/.env.local"
  );
}

const apiBase = apiUrlRaw.replace(/\/$/, "");
let apiOrigin: string;
let apiWs: string;
try {
  const u = new URL(apiBase);
  apiOrigin = u.origin;
  apiWs =
    u.protocol === "https:" ? `wss://${u.host}` : `ws://${u.host}`;
} catch {
  throw new Error(
    "NEXT_PUBLIC_API_URL must be a full URL including protocol and host"
  );
}

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: '*.supabase.co',
        port: '',
        pathname: '/**',
      },
    ],
  },
  async rewrites() {
    return [
      {
        source: '/api/admin/:path*',
        destination: `${apiBase}/api/admin/:path*`,
      },
      {
        source: '/api/messages',
        destination: `${apiBase}/api/messages`,
      },
    ];
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              `connect-src 'self' ${apiOrigin} ${apiWs} https://api.supabase.com https://auth.supabase.io ws://localhost:8000 https://*.supabase.co wss://*.supabase.co https://cdn-global.configcat.com https://configcat.supabase.com https://*.stripe.com https://*.stripe.network https://www.cloudflare.com https://*.vercel-insights.com https://api.github.com https://raw.githubusercontent.com https://frontend-assets.supabase.com https://*.usercentrics.eu https://ss.supabase.com https://maps.googleapis.com https://ph.supabase.com wss://*.pusher.com https://*.ingest.sentry.io https://*.ingest.us.sentry.io https://*.ingest.de.sentry.io https://cdnjs.cloudflare.com`,
              "style-src 'self' 'unsafe-inline'",
              "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://cdn.jsdelivr.net https://cdnjs.cloudflare.com",
              "img-src 'self' data: https: blob:",
              "font-src 'self' data:",
              "worker-src 'self' blob:",
              "frame-src 'self' https://js.stripe.com https://hooks.stripe.com",
              "media-src 'self' data:"
            ].join('; ')
          }
        ]
      }
    ]
  }
};

export default nextConfig;
