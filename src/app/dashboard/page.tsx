
'use client';
import { AdvisoryCard } from '@/components/dashboard/AdvisoryCard';
import { useAuth } from '@/hooks/useAuth';
import { useTranslation } from '@/hooks/useTranslation';

export default function DashboardPage() {
    const { user, loading } = useAuth();
    const { t } = useTranslation();
    
    if (loading) {
        return <div className="flex items-center justify-center h-full">Loading...</div>
    }

    return (
        <main>
            <div className="mb-8 space-y-2">
                <h1 className="text-3xl font-bold">{t('dashboard.welcome', { name: user?.displayName || 'Farmer' })}</h1>
                <p className="text-muted-foreground">{t('dashboard.tagline')}</p>
            </div>

            <div className="grid grid-cols-1 gap-6">
                <section id="advisory">
                    <AdvisoryCard />
                </section>
            </div>
        </main>
    );
}
