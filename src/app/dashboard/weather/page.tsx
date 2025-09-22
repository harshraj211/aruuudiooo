
'use client';

import { WeatherView } from "@/components/dashboard/weather/WeatherView";
import { YearlyWeatherReport } from "@/components/dashboard/weather/YearlyWeatherReport";
import { useTranslation } from "@/hooks/useTranslation";
import { Separator } from "@/components/ui/separator";
import { useEffect, useState, FormEvent } from "react";
import { getCurrentWeather, getDailyForecast, getCityNameFromCoords, CurrentWeatherData, DailyForecastData } from "@/services/weather";
import { useToast } from "@/hooks/use-toast";


export default function WeatherPage() {
    const { t } = useTranslation();
    const [currentWeather, setCurrentWeather] = useState<CurrentWeatherData | null>(null);
    const [forecast, setForecast] = useState<DailyForecastData[]>([]);
    const [location, setLocation] = useState<string>('');
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const { toast } = useToast();
    const apiKey = "992f9e0186412429d5145892550b0732";


    const fetchWeatherForLocation = async (loc: string | { lat: number, lon: number }) => {
        if (!loc) {
            setError(t('weatherPage.error.noLocation'));
            setIsLoading(false);
            return;
        }

        setIsLoading(true);
        setError(null);
        
        if (!apiKey) {
            setError(t('weatherPage.error.noApiKey'));
            setIsLoading(false);
            return;
        }

        try {
            const [currentData, forecastData] = await Promise.all([
                getCurrentWeather(loc, apiKey),
                getDailyForecast(loc, apiKey)
            ]);
            setCurrentWeather(currentData);
            setForecast(forecastData);
            setLocation(currentData.location);
            localStorage.setItem('agriVision-location', currentData.location);
        } catch (err) {
            console.error(err);
            setError(t('weatherPage.error.fetchFailed'));
            setCurrentWeather(null);
            setForecast([]);
        } finally {
            setIsLoading(false);
        }
    };
    
    // On initial mount, get location from storage or set error
    useEffect(() => {
        const savedLocation = localStorage.getItem('agriVision-location');
        if (savedLocation) {
            setLocation(savedLocation);
            fetchWeatherForLocation(savedLocation);
        } else {
            // Try to get location from IP or browser geolocation as a fallback
             if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(
                    (position) => {
                        const { latitude, longitude } = position.coords;
                        fetchWeatherForLocation({ lat: latitude, lon: longitude });
                    },
                    () => {
                        // If geolocation fails, set the error
                        setError(t('weatherPage.error.noLocation'));
                        setIsLoading(false);
                    }
                );
            } else {
                setError(t('weatherPage.error.noLocation'));
                setIsLoading(false);
            }
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);


    return (
        <main>
            <div className="mb-8 space-y-2">
                <h1 className="text-3xl font-bold">{t('weatherPage.title')}</h1>
                <p className="text-muted-foreground">{t('weatherPage.description')}</p>
            </div>
            <div className="space-y-8">
                <WeatherView 
                    onLocationSubmit={fetchWeatherForLocation}
                    currentWeather={currentWeather}
                    forecast={forecast}
                    isLoading={isLoading}
                    error={error}
                />
                <Separator />
                <YearlyWeatherReport location={location} />
            </div>
        </main>
    );
}
