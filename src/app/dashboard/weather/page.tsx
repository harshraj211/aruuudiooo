
'use client';

import { WeatherView } from "@/components/dashboard/weather/WeatherView";
import { YearlyWeatherReport } from "@/components/dashboard/weather/YearlyWeatherReport";
import { useTranslation } from "@/hooks/useTranslation";
import { Separator } from "@/components/ui/separator";

export default function WeatherPage() {
    const { t } = useTranslation();

    return (
        <main>
            <div className="mb-8 space-y-2">
                <h1 className="text-3xl font-bold">{t('weatherPage.title')}</h1>
                <p className="text-muted-foreground">{t('weatherPage.description')}</p>
            </div>
            <div className="space-y-8">
                <WeatherView />
                <Separator />
                <YearlyWeatherReport />
            </div>
        </main>
    );
}
