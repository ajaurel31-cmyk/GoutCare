import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'GoutCare — AI-Powered Gout Management',
    short_name: 'GoutCare',
    description: 'Free gout management: purine tracking, uric acid monitoring, flare logging, and 3 daily AI food scans. Premium subscription unlocks unlimited AI scans and PDF health reports.',
    start_url: '/',
    display: 'standalone',
    background_color: '#0a0e1a',
    theme_color: '#0a0e1a',
    icons: [
      {
        src: '/icon-192.svg',
        sizes: '192x192',
        type: 'image/svg+xml',
      },
      {
        src: '/icon-512.svg',
        sizes: '512x512',
        type: 'image/svg+xml',
      },
    ],
  };
}
