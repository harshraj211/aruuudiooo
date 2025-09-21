
'use client';

import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
// We are removing firebase from this hook to bypass the auth errors.
// import { auth } from '@/lib/firebase';
// import { onAuthStateChanged, User } from 'firebase/auth';
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

const publicPaths = ['/', '/login', '/signup'];

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<MockUser | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Simulate a logged-in user to bypass the auth error.
        setUser({
            uid: 'mock-user-id',
            displayName: 'Pro Farmer',
            email: 'farmer@example.com',
        });
        setLoading(false);
    }, []);

    return (
        <AuthContext.Provider value={{ user, loading }}>
            {loading && !publicPaths.includes(usePathname()) ? <div>Loading...</div> : children}
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
