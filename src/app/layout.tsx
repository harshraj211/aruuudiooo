
import type {Metadata} from 'next';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import { LanguageProvider } from '@/hooks/useTranslation';
import { AuthProvider } from '@/hooks/useAuth';

export const metadata: Metadata = {
  title: 'eKheti',
  description: 'Smart Crop Advisory for modern farming.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <LanguageProvider>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Alegreya:wght@400;700&family=PT+Sans:wght@400;700&display=swap" rel="stylesheet" />
      </head>
      <body>
        <AuthProvider>
            {children}
        </AuthProvider>
        <Toaster />
      </body>
    </LanguageProvider>
  );
}
