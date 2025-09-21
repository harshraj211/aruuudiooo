
'use client';

import { useEffect, useState } from "react";
import { getForecast } from "@/services/weather";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Sun, Cloud, CloudRain, Wind, Droplets, MapPin, AlertCircle } from "lucide-react";
import { useTranslation } from "@/hooks/useTranslation";

type WeatherData = {
    location: string;
    temperature: number;
    condition: string;
    humidity: number;
    windSpeed: number;
}

const WeatherIcon = ({ condition, className }: { condition: string; className?: string }) => {
    const props = { className: className || "h-10 w-10 text-amber-400" };
    switch (condition.toLowerCase()) {
        case 'sunny':
        case 'clear':
            return <Sun {...props} />;
        case 'cloudy':
        case 'partly cloudy':
            return <Cloud {...props} className="h-10 w-10 text-gray-400" />;
        case 'rainy':
        case 'shower rain':
            return <CloudRain {...props} className="h-10 w-10 text-blue-400" />;
        default:
            return <Sun {...props} />;
    }
}

export function WeatherWidget() {
    const [weather, setWeather] = useState<WeatherData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const { t } = useTranslation();

    useEffect(() => {
        const fetchWeather = async () => {
            setIsLoading(true);
            setError(null);
            
            const location = localStorage.getItem('agriVision-location');
            const apiKey = process.env.NEXT_PUBLIC_OPENWEATHERMAP_API_KEY;

            if (!location) {
                setError("Location not set. Please set it in the advisory card.");
                setIsLoading(false);
                return;
            }
             if (!apiKey) {
                setError("Weather API key not configured.");
                setIsLoading(false);
                return;
            }

            try {
                const data = await getForecast(location, apiKey);
                setWeather({ ...data, location });
            } catch (err) {
                console.error(err);
                setError("Could not fetch weather data.");
            } finally {
                setIsLoading(false);
            }
        };

        fetchWeather();
    }, []);

    if (isLoading) {
        return (
            <div className="p-2 mt-auto">
                <Skeleton className="h-48 w-full" />
            </div>
        );
    }
    
    if (error) {
         return (
            <Card className="m-2 mt-auto bg-destructive/10 border-destructive/30 text-destructive-foreground">
                <CardContent className="p-3 text-center text-xs">
                     <AlertCircle className="h-6 w-6 mx-auto mb-2 text-destructive" />
                    <p className="font-semibold">Weather Error</p>
                    <p>{error}</p>
                </CardContent>
            </Card>
        )
    }

    if (!weather) {
        return null;
    }

    return (
        <Card className="m-2 mt-auto bg-gradient-to-br from-primary/10 to-accent/10 border-primary/20 hover:shadow-lg transition-shadow group-data-[collapsible=icon]:hidden">
            <CardHeader className="p-3">
                 <div className="flex items-start justify-between">
                    <div>
                        <CardTitle className="text-4xl font-bold">{weather.temperature}°C</CardTitle>
                        <CardDescription className="flex items-center gap-1 text-xs">
                            <MapPin className="h-3 w-3"/>
                            {weather.location}
                        </CardDescription>
                    </div>
                     <WeatherIcon condition={weather.condition} />
                </div>
            </CardHeader>
            <CardContent className="p-3 pt-0">
                <div className="text-center font-semibold mb-3">{weather.condition}</div>
                <div className="flex justify-around text-xs text-center">
                    <div className="flex flex-col items-center gap-1">
                        <Droplets className="h-5 w-5 text-blue-500"/>
                        <span className="font-bold">{weather.humidity}%</span>
                        <span className="text-muted-foreground">{t('advisoryCard.humidity')}</span>
                    </div>
                     <div className="flex flex-col items-center gap-1">
                        <Wind className="h-5 w-5 text-gray-500"/>
                        <span className="font-bold">{weather.windSpeed} km/h</span>
                        <span className="text-muted-foreground">{t('advisoryCard.windSpeed')}</span>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}
