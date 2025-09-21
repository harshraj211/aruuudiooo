

import type {NextConfig} from 'next';
import { config } from 'dotenv';

config({ path: '.env' });

const nextConfig: NextConfig = {
  /* config options here */
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'picsum.photos',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'i.pravatar.cc',
        port: '',
        pathname: '/**',
      },
       {
        protocol: 'https',
        hostname: 'openweathermap.org',
        port: '',
        pathname: '/img/wn/**',
      },
      {
        protocol: 'https',
        hostname: 'newsdata.io',
      },
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
  env: {
    // This makes the variable available to server-side code
    OPENWEATHERMAP_API_KEY: process.env.OPENWEATHERMAP_API_KEY,
    GEMINI_API_KEY: process.env.GEMINI_API_KEY,
    NEWSDATA_API_KEY: process.env.NEWSDATA_API_KEY,
    AGMARKNET_API_KEY: process.env.AGMARKNET_API_KEY,
  }
};

export default nextConfig;
