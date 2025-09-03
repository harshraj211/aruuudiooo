// This is a mock auth hook for prototyping.
// In a real app, this would be replaced with Firebase Auth context.
import { useState, useEffect } from 'react';

export const useAuth = () => {
    const [user, setUser] = useState<{
        displayName: string;
        email: string;
    } | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Simulate fetching user data
        const timer = setTimeout(() => {
            setUser({
                displayName: 'Pro Farmer',
                email: 'farmer@example.com',
            });
            setLoading(false);
        }, 500);

        return () => clearTimeout(timer);
    }, []);

    return { user, loading };
};
