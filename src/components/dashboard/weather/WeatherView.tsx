
'use client';

import { useEffect, useState } from "react";
import { getForecast } from "@/services/weather";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Sun, Cloud, CloudRain, Wind, Droplets, MapPin, AlertCircle, Thermometer } from "lucide-react";
import { useTranslation } from "@/hooks/useTranslation";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { getCityNameFromCoords } from "@/services/weather";
import { useToast } from "@/hooks/use-toast";


type WeatherData = {
    location: string;
    temperature: number;
    condition: string;
    humidity: number;
    windSpeed: number;
}

const WeatherIcon = ({ condition, className }: { condition: string; className?: string }) => {
    const props = { className: className || "h-24 w-24 text-amber-400" };
    switch (condition.toLowerCase()) {
        case 'sunny':
        case 'clear':
            return <Sun {...props} />;
        case 'cloudy':
        case 'partly cloudy':
        case 'scattered clouds':
        case 'broken clouds':
            return <Cloud {...props} className="h-24 w-24 text-gray-400" />;
        case 'rainy':
        case 'shower rain':
        case 'rain':
            return <CloudRain {...props} className="h-24 w-24 text-blue-400" />;
        default:
            return <Sun {...props} />;
    }
}

export function WeatherView() {
    const [weather, setWeather] = useState<WeatherData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const { t } = useTranslation();
    const [isLocating, setIsLocating] = useState(false);
    const { toast } = useToast();

    useEffect(() => {
        const fetchWeather = async () => {
            setIsLoading(true);
            setError(null);
            
            const location = localStorage.getItem('agriVision-location');
            const apiKey = process.env.NEXT_PUBLIC_OPENWEATHERMAP_API_KEY;

            if (!location) {
                setError(t('weatherPage.error.noLocation'));
                setIsLoading(false);
                return;
            }
             if (!apiKey) {
                setError(t('weatherPage.error.noApiKey'));
                setIsLoading(false);
                return;
            }

            try {
                const data = await getForecast(location, apiKey);
                setWeather({ ...data, location });
            } catch (err) {
                console.error(err);
                setError(t('weatherPage.error.fetchFailed'));
            } finally {
                setIsLoading(false);
            }
        };

        fetchWeather();
    }, [t]);

    const handleSetLocation = () => {
        if (!navigator.geolocation) {
             toast({
                variant: "destructive",
                title: "Geolocation Not Supported",
            });
            return;
        }
        setIsLocating(true);
        navigator.geolocation.getCurrentPosition(
            async (position) => {
                const { latitude, longitude } = position.coords;
                 const apiKey = process.env.NEXT_PUBLIC_OPENWEATHERMAP_API_KEY;
                if (!apiKey) return;
                try {
                    const cityName = await getCityNameFromCoords({lat: latitude, lon: longitude}, apiKey);
                    localStorage.setItem('agriVision-location', cityName);
                    window.location.reload(); // Reload to fetch weather for new location
                } catch (err) {
                     toast({ variant: "destructive", title: "Could not fetch location name."});
                } finally {
                    setIsLocating(false);
                }
            },
            () => {
                toast({ variant: "destructive", title: "Geolocation Error"});
                setIsLocating(false);
            }
        );
    }


    if (isLoading) {
        return <Skeleton className="h-96 w-full" />;
    }
    
    if (error || !weather) {
         return (
            <Card className="text-center p-8">
                <CardHeader>
                    <AlertCircle className="h-12 w-12 mx-auto mb-4 text-destructive" />
                    <CardTitle>{t('weatherPage.error.title')}</CardTitle>
                    <CardDescription>{error}</CardDescription>
                </CardHeader>
                <CardContent>
                    <p className="mb-4">{t('weatherPage.error.setLocationPrompt')}</p>
                    <Button onClick={handleSetLocation} disabled={isLocating}>
                         {isLocating ? <>{t('weatherPage.locating')}...</> : <>{t('weatherPage.useCurrentLocation')}</>}
                    </Button>
                </CardContent>
            </Card>
        )
    }

    return (
        <Card className="bg-gradient-to-br from-primary/5 to-accent/5 hover:shadow-xl transition-shadow duration-300">
            <CardHeader className="text-center">
                <CardDescription className="flex items-center justify-center gap-2">
                    <MapPin className="h-4 w-4"/>
                    {weather.location}
                </CardDescription>
                <div className="flex justify-center items-center gap-4 py-4">
                     <WeatherIcon condition={weather.condition} />
                     <div>
                        <CardTitle className="text-7xl font-bold">{weather.temperature}°C</CardTitle>
                        <p className="font-semibold text-lg text-muted-foreground">{weather.condition}</p>
                     </div>
                </div>
            </CardHeader>
            <CardContent>
                 <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                    <Card className="p-4">
                         <Thermometer className="h-8 w-8 mx-auto mb-2 text-red-500"/>
                        <p className="font-bold text-2xl">{weather.temperature}°C</p>
                        <p className="text-muted-foreground">{t('weatherPage.temperature')}</p>
                    </Card>
                    <Card className="p-4">
                         <Droplets className="h-8 w-8 mx-auto mb-2 text-blue-500"/>
                        <p className="font-bold text-2xl">{weather.humidity}%</p>
                        <p className="text-muted-foreground">{t('weatherPage.humidity')}</p>
                    </Card>
                     <Card className="p-4">
                        <Wind className="h-8 w-8 mx-auto mb-2 text-gray-500"/>
                        <p className="font-bold text-2xl">{weather.windSpeed} km/h</p>
                        <p className="text-muted-foreground">{t('weatherPage.windSpeed')}</p>
                    </Card>
                </div>
            </CardContent>
            <CardFooter className="justify-center">
                <Button asChild variant="link">
                    <Link href="/dashboard/crops/notifications">{t('weatherPage.manageAlerts')}</Link>
                </Button>
            </CardFooter>
        </Card>
    )
}
