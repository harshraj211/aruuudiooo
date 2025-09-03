
'use client';

import { WeatherAlertsCard } from '@/components/dashboard/notifications/WeatherAlertsCard';
import { MarketPriceAlerts } from '@/components/dashboard/notifications/MarketPriceAlerts';
import { useTranslation } from '@/hooks/useTranslation';

export default function NotificationsPage() {
  const { t } = useTranslation();

  return (
    <main>
      <div className="mb-8 space-y-2">
        <h1 className="text-3xl font-bold">{t('notificationsPage.title')}</h1>
        <p className="text-muted-foreground">
          {t('notificationsPage.description')}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        <div className="lg:col-span-2 space-y-6">
          <MarketPriceAlerts />
        </div>
        <div className="lg:col-span-1 space-y-6">
          <WeatherAlertsCard />
        </div>
      </div>
    </main>
  );
}
