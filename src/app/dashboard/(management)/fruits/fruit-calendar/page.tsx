
'use client';

import { ItemCalendar } from '@/components/dashboard/item-calendar/ItemCalendar';
import { useTranslation } from '@/hooks/useTranslation';

export default function FruitCalendarPage() {
    const { t } = useTranslation();
    return (
        <main>
            <div className="mb-8 space-y-2">
                <h1 className="text-3xl font-bold">{t('fruitCalendarPage.title')}</h1>
                <p className="text-muted-foreground">
                    Plan irrigation, pruning, and harvest dates for healthier yields.
                </p>
            </div>
            <ItemCalendar itemType="Fruit" />
        </main>
    );
}

