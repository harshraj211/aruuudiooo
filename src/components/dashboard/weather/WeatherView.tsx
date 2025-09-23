
'use client';

import { useEffect, useState, FormEvent, ReactNode } from "react";
import { getCityNameFromCoords, CurrentWeatherData, DailyForecastData } from "@/services/weather";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Thermometer, Wind, Droplets, MapPin, AlertCircle, ArrowDown, ArrowUp, Search, LocateFixed, Loader2, Sunrise, Sunset, Gauge, CloudDrizzle } from "lucide-react";
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

    const InfoCard = ({ icon, label, value }: { icon: ReactNode, label: string, value: string | number }) => (
        <Card className="bg-background/50 p-4">
            <div className="flex items-center gap-3">
                <div className="text-primary">{icon}</div>
                <div>
                    <p className="text-sm text-muted-foreground">{label}</p>
                    <p className="font-bold text-lg">{value}</p>
                </div>
            </div>
        </Card>
    )


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
                    <Skeleton className="h-[26rem] w-full" />
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
                <Card className="bg-gradient-to-br from-background to-secondary/10">
                    <CardContent className="p-6">
                       <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                            {/* Left side */}
                           <div className="flex flex-col items-center text-center">
                                <h2 className="text-2xl font-bold">{currentWeather.location}</h2>
                                <p className="text-sm text-muted-foreground">Last updated: {currentWeather.lastUpdated}</p>
                                <div className="flex items-center my-4">
                                     <WeatherIcon iconCode={currentWeather.icon} alt={currentWeather.condition} className="w-24 h-24 -ml-4" />
                                     <div className="-ml-4">
                                        <p className="text-7xl font-bold">{currentWeather.temperature}°C</p>
                                        <p className="text-muted-foreground">Feels like {currentWeather.feels_like}°C</p>
                                     </div>
                                </div>
                                <p className="text-xl font-semibold capitalize">{currentWeather.condition}</p>
                           </div>

                            {/* Right side */}
                           <div className="grid grid-cols-2 gap-4">
                                <InfoCard icon={<Droplets />} label="Humidity" value={`${currentWeather.humidity}%`} />
                                <InfoCard icon={<Wind />} label="Wind Speed" value={`${currentWeather.windSpeed} kph`} />
                                <InfoCard icon={<Gauge />} label="Pressure" value={`${currentWeather.pressure} mb`} />
                                <InfoCard icon={<CloudDrizzle />} label="Precipitation" value={`${currentWeather.precipitation} mm`} />
                                <InfoCard icon={<Sunrise />} label="Sunrise" value={currentWeather.sunrise} />
                                <InfoCard icon={<Sunset />} label="Sunset" value={currentWeather.sunset} />
                           </div>
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
