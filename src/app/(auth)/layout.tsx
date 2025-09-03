import { Logo } from '@/components/Logo';
import Link from 'next/link';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4">
        <div className="absolute top-4 left-4 md:top-8 md:left-8">
            <Link href="/" aria-label="Back to home">
                <Logo />
            </Link>
        </div>
        {children}
    </div>
  );
}
