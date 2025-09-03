'use client';

import { MarketPricesView } from '@/components/dashboard/market-prices/MarketPricesView';
import { useTranslation } from '@/hooks/useTranslation';

export default function MarketPricesPage() {
  const { t } = useTranslation();
  return (
    <main>
       <div className="mb-8 space-y-2">
        <h1 className="text-3xl font-bold">{t('marketPricesPage.title')}</h1>
        <p className="text-muted-foreground">
          {t('marketPricesPage.description')}
        </p>
      </div>
      <MarketPricesView />
    </main>
  );
}
