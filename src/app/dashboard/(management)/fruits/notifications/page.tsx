
'use client';

import { WeatherAlertsCard } from '@/components/dashboard/notifications/WeatherAlertsCard';
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

      <div className="max-w-md mx-auto">
          <WeatherAlertsCard />
      </div>
    </main>
  );
}
