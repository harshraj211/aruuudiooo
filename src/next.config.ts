
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
      }
    ],
  },
  env: {
    OPENWEATHERMAP_API_KEY: process.env.OPENWEATHERMAP_API_KEY,
  },
  publicRuntimeConfig: {
    OPENWEATHERMAP_API_KEY: process.env.OPENWEATHERMAP_API_KEY,
  },
};

export default nextConfig;
