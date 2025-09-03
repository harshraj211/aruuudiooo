
'use client';

import { CropCalendar } from '@/components/dashboard/crop-calendar/CropCalendar';
import { useTranslation } from '@/hooks/useTranslation';


export default function CropCalendarPage() {
    const { t } = useTranslation();
    return (
        <main>
             <div className="mb-8 space-y-2">
                <h1 className="text-3xl font-bold">{t('cropCalendarPage.title')}</h1>
                <p className="text-muted-foreground">
                    {t('cropCalendarPage.description')}
                </p>
            </div>
            <CropCalendar />
        </main>
    )
}
