
'use client';

import { useEffect, useState, FormEvent } from "react";
import { getCityNameFromCoords, CurrentWeatherData, DailyForecastData } from "@/services/weather";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Thermometer, Wind, Droplets, MapPin, AlertCircle, ArrowDown, ArrowUp, Search, LocateFixed, Loader2 } from "lucide-react";
import { useTranslation } from "@/hooks/useTranslation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import Image from "next/image";
import { cn } from "@/lib/utils";

type WeatherViewProps = {
    onLocationSubmit: (location: string | { lat: number, lon: number }) => void;
    currentWeather: CurrentWeatherData | null;
    forecast: DailyForecastData[];
    isLoading: boolean;
    error: string | null;
}

export function WeatherView({ onLocationSubmit, currentWeather, forecast, isLoading, error }: WeatherViewProps) {
    const [locationInput, setLocationInput] = useState('');
    const [isLocating, setIsLocating] = useState(false);
    
    const { t } = useTranslation();
    const { toast } = useToast();
    
    useEffect(() => {
        if(currentWeather?.location) {
            setLocationInput(currentWeather.location);
        } else {
             const savedLocation = localStorage.getItem('agriVision-location');
            if (savedLocation) {
                setLocationInput(savedLocation);
            }
        }
    }, [currentWeather]);

    const handleLocationSubmit = (e: FormEvent) => {
        e.preventDefault();
        if (locationInput.trim()) {
            onLocationSubmit(locationInput.trim());
        }
    };

    const handleUseMyLocation = () => {
        if (!navigator.geolocation) {
             toast({ variant: "destructive", title: "Geolocation Not Supported" });
            return;
        }
        setIsLocating(true);
        navigator.geolocation.getCurrentPosition(
            async (position) => {
                const { latitude, longitude } = position.coords;
                onLocationSubmit({ lat: latitude, lon: longitude });
                setIsLocating(false);
            },
            () => {
                toast({ variant: "destructive", title: "Geolocation Error", description: "Could not access your location. Please enable location services in your browser settings."});
                setIsLocating(false);
            }
        );
    }
    
    const WeatherIcon = ({ iconCode, alt, className }: { iconCode: string, alt: string, className?: string }) => (
        <Image
            src={`https://openweathermap.org/img/wn/${iconCode}@2x.png`}
            alt={alt}
            width={100}
            height={100}
            className={cn("mx-auto", className)}
            unoptimized
        />
    );


    return (
        <div className="space-y-6">
            <form onSubmit={handleLocationSubmit} className="flex gap-2">
                <Input 
                    type="text"
                    value={locationInput}
                    onChange={(e) => setLocationInput(e.target.value)}
                    placeholder={t('weatherPage.searchPlaceholder')}
                    className="flex-grow"
                    disabled={isLoading || isLocating}
                />
                <Button type="button" size="icon" variant="outline" onClick={handleUseMyLocation} disabled={isLoading || isLocating}>
                    {isLocating ? <Loader2 className="animate-spin" /> : <LocateFixed />}
                </Button>
                <Button type="submit" disabled={isLoading || isLocating}>
                    <Search className="mr-2 h-4 w-4" />
                    {t('weatherPage.searchButton')}
                </Button>
            </form>

            {isLoading ? (
                <div className="space-y-6">
                    <Skeleton className="h-64 w-full" />
                    <div className="flex space-x-4 overflow-hidden">
                        {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-40 w-32 flex-shrink-0" />)}
                    </div>
                </div>
            ) : error || !currentWeather ? (
                <Card className="text-center p-8">
                    <CardHeader>
                        <AlertCircle className="h-12 w-12 mx-auto mb-4 text-destructive" />
                        <CardTitle>{t('weatherPage.error.title')}</CardTitle>
                        <CardDescription>{error || t('weatherPage.error.noLocation')}</CardDescription>
                    </CardHeader>
                </Card>
            ) : (
                <>
                <Card className="bg-gradient-to-br from-primary/10 to-accent/10 hover:shadow-xl transition-shadow duration-300">
                    <CardHeader className="text-center">
                        <CardDescription className="flex items-center justify-center gap-2">
                            <MapPin className="h-4 w-4"/>
                            {currentWeather.location}
                        </CardDescription>
                         <div className="flex flex-col sm:flex-row justify-center items-center gap-2 sm:gap-6 py-4">
                            <WeatherIcon iconCode={currentWeather.icon} alt={currentWeather.condition} className="h-28 w-28" />
                            <div className="text-center sm:text-left">
                                <CardTitle className="text-7xl font-bold">{currentWeather.temperature}°C</CardTitle>
                                <p className="font-semibold text-lg text-muted-foreground capitalize">{currentWeather.condition}</p>
                            </div>
                         </div>
                    </CardHeader>
                    <CardContent>
                         <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                            <Card className="p-3">
                                <Thermometer className="h-6 w-6 mx-auto mb-2 text-red-500"/>
                                <p className="font-bold text-lg flex items-center justify-center gap-2">
                                   <ArrowUp size={16}/> {currentWeather.temp_max}° / <ArrowDown size={16}/> {currentWeather.temp_min}°
                                </p>
                                <p className="text-xs text-muted-foreground">{t('weatherPage.highLow')}</p>
                            </Card>
                             <Card className="p-3">
                                <Droplets className="h-6 w-6 mx-auto mb-2 text-blue-500"/>
                                <p className="font-bold text-lg">{currentWeather.humidity}%</p>
                                <p className="text-xs text-muted-foreground">{t('weatherPage.humidity')}</p>
                            </Card>
                             <Card className="p-3">
                                <Wind className="h-6 w-6 mx-auto mb-2 text-gray-500"/>
                                <p className="font-bold text-lg">{currentWeather.windSpeed} km/h</p>
                                <p className="text-xs text-muted-foreground">{t('weatherPage.windSpeed')}</p>
                            </Card>
                             <Card className="p-3 bg-accent/20">
                                <p className="font-bold text-lg">{t('weatherPage.advisory')}</p>
                                <p className="text-xs text-muted-foreground">{t('weatherPage.advisoryText')}</p>
                            </Card>
                        </div>
                    </CardContent>
                </Card>

                <div>
                    <h3 className="text-xl font-bold mb-4">{t('weatherPage.forecastTitle')}</h3>
                    <div className="flex gap-4 overflow-x-auto pb-4 -mx-4 px-4">
                        {forecast.map((day, index) => (
                             <Card key={day.date} className={cn("flex-shrink-0 w-36 text-center p-3 transition-all hover:scale-105 hover:shadow-lg", index === 0 ? "border-primary/50" : "")}>
                                <CardHeader className="p-2">
                                    <CardTitle className="text-base">{t(`weatherPage.day.${day.dayOfWeek.toLowerCase()}`)}</CardTitle>
                                    <CardDescription className="text-xs">{new Date(day.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric'})}</CardDescription>
                                </CardHeader>
                                <CardContent className="p-2">
                                    <WeatherIcon iconCode={day.icon} alt={day.condition} className="w-16 h-16" />
                                    <p className="font-bold text-lg">{day.temp_max}°</p>
                                    <p className="text-muted-foreground">{day.temp_min}°</p>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>
                </>
            )}
        </div>
    );
}
