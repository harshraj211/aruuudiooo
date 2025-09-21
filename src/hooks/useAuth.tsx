
'use client';

import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { useRouter, usePathname } from 'next/navigation';

// Define a mock user type that matches the structure your app expects.
type MockUser = {
    uid: string;
    displayName: string | null;
    email: string | null;
};

interface AuthContextType {
    user: MockUser | null;
    loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<MockUser | null>(null);
    const [loading, setLoading] = useState(true);
    const pathname = usePathname();

    useEffect(() => {
        // This is the mock implementation.
        // It sets a fake user and bypasses the real Firebase authentication.
        setUser({
            uid: 'mock-user-id-123',
            displayName: 'Pro Farmer',
            email: 'farmer@example.com',
        });
        setLoading(false);
    }, []);

    // This part is important: it prevents an infinite redirect loop for public pages.
    const publicPaths = ['/', '/login', '/signup'];
    const isPublicPath = publicPaths.includes(pathname);

    // If loading, and not a public path, show a loading indicator to prevent flashes of content.
    if (loading && !isPublicPath) {
        return <div className="flex items-center justify-center h-screen">Loading...</div>;
    }

    return (
        <AuthContext.Provider value={{ user, loading }}>
            {children}
        </AuthContext.Provider>
    );
};


export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
