
'use client';

import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { auth } from '@/lib/firebase';
import { onAuthStateChanged, User } from 'firebase/auth';
import { useRouter, usePathname } from 'next/navigation';

interface AuthContextType {
    user: User | null;
    loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const publicPaths = ['/', '/login', '/signup'];

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            setUser(user);
            setLoading(false);
            
            const isPublicPath = publicPaths.includes(pathname) || pathname.startsWith('/print');

            if (!user && !isPublicPath) {
                router.push('/login');
            }
        });

        return () => unsubscribe();
    }, [pathname, router]);
    
    // Additional check to handle redirect after loading is complete
    useEffect(() => {
        if (!loading && !user && !publicPaths.includes(pathname) && !pathname.startsWith('/print')) {
             router.push('/login');
        }
         if (!loading && user && (pathname === '/login' || pathname === '/signup')) {
            router.push('/dashboard');
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [loading, user, pathname, router]);

    return (
        <AuthContext.Provider value={{ user, loading }}>
            {loading && !publicPaths.includes(pathname) ? <div>Loading...</div> : children}
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
