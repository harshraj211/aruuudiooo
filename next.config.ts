
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
    // For client-side code, Next.js requires the NEXT_PUBLIC_ prefix
    NEXT_PUBLIC_OPENWEATHERMAP_API_KEY: process.env.OPENWEATHERMAP_API_KEY,
  }
};

export default nextConfig;

    
