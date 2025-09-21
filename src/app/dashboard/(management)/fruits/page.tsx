
'use client';
import { AdvisoryCard } from '@/components/dashboard/AdvisoryCard';
import { useTranslation } from '@/hooks/useTranslation';

export default function DashboardPage() {
    const { t } = useTranslation();
    
    return (
        <main>
            <div className="mb-8 space-y-2">
                <h1 className="text-3xl font-bold">{t('dashboard.welcome', { name: 'Farmer' })} - Fruits</h1>
                <p className="text-muted-foreground">{t('dashboard.tagline')}</p>
            </div>

            <div className="grid grid-cols-1 gap-6">
                <section id="advisory">
                    <AdvisoryCard itemType="Fruit" />
                </section>
            </div>
        </main>
    );
}
