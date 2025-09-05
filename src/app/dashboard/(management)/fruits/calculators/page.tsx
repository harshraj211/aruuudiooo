
'use client';

import { Calculators } from "@/components/dashboard/calculators/Calculators";
import { useTranslation } from "@/hooks/useTranslation";

export default function CalculatorsPage() {
    const { t } = useTranslation();

    return (
        <main>
            <div className="mb-8 space-y-2">
                <h1 className="text-3xl font-bold">{t('calculatorsPage.title')}</h1>
                <p className="text-muted-foreground">
                    {t('calculatorsPage.description')}
                </p>
            </div>
            <Calculators itemType="Fruit" />
        </main>
    );
}
