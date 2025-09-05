
'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { integrateWeatherDataForAdvisory, IntegrateWeatherDataForAdvisoryOutput } from '@/ai/flows/integrate-weather-data-for-advisory';
import { useEffect, useState, useTransition } from 'react';
import { Loader2, Sun, Wind, Droplets, AlertCircle, LocateFixed } from 'lucide-react';
import { Separator } from '../ui/separator';
import { useTranslation } from '@/hooks/useTranslation';
import { Alert, AlertDescription, AlertTitle } from '../ui/alert';
import { useToast } from '@/hooks/use-toast';
import { getCityNameFromCoords } from '@/services/weather';
import { Combobox } from '../ui/combobox';

const formSchema = z.object({
  cropType: z.string().min(1, 'Please enter or select a type.'),
  soilDetails: z.string().min(1, 'Please enter or select a soil type.'),
  currentStageOfCrop: z.string().min(1, 'Please enter or select a stage.'),
  location: z.string().min(2, 'Please enter your location.'),
});

type AdvisoryResult = {
    advisory: string;
    weather?: {
        temperature: number;
        condition: string;
        humidity: number;
        windSpeed: number;
    }
}

type AdvisoryCardProps = {
    itemType?: 'Crop' | 'Fruit';
}

const cropOptions = [
    { value: 'Rice', label: 'Rice' },
    { value: 'Wheat', label: 'Wheat' },
    { value: 'Maize', label: 'Maize' },
    { value: 'Barley', label: 'Barley' },
    { value: 'Jowar (Sorghum)', label: 'Jowar (Sorghum)' },
    { value: 'Bajra (Pearl Millet)', label: 'Bajra (Pearl Millet)' },
    { value: 'Oats', label: 'Oats' },
    { value: 'Ragi (Finger Millet)', label: 'Ragi (Finger Millet)' },
    { value: 'Arhar (Pigeon Pea)', label: 'Arhar (Pigeon Pea)' },
    { value: 'Moong (Green Gram)', label: 'Moong (Green Gram)' },
    { value: 'Urad (Black Gram)', label: 'Urad (Black Gram)' },
    { value: 'Masoor (Lentil)', label: 'Masoor (Lentil)' },
    { value: 'Chana (Bengal Gram)', label: 'Chana (Bengal Gram)' },
    { value: 'Rajma (Kidney Beans)', label: 'Rajma (Kidney Beans)' },
    { value: 'Moth Bean', label: 'Moth Bean' },
    { value: 'Horse Gram', label: 'Horse Gram' },
    { value: 'Cowpea', label: 'Cowpea' },
    { value: 'Cotton', label: 'Cotton' },
    { value: 'Sugarcane', label: 'Sugarcane' },
    { value: 'Jute', label: 'Jute' },
    { value: 'Tobacco', label: 'Tobacco' },
    { value: 'Groundnut (Peanut)', label: 'Groundnut (Peanut)' },
    { value: 'Sunflower', label: 'Sunflower' },
    { value: 'Soybean', label: 'Soybean' },
    { value: 'Mustard', label: 'Mustard' },
    { value: 'Sesame (Til)', label: 'Sesame (Til)' },
    { value: 'Linseed (Flax)', label: 'Linseed (Flax)' },
    { value: 'Castor', label: 'Castor' },
    { value: 'Potato', label: 'Potato' },
    { value: 'Onion', label: 'Onion' },
    { value: 'Tomato', label: 'Tomato' },
    { value: 'Brinjal (Eggplant)', label: 'Brinjal (Eggplant)' },
    { value: 'Cauliflower', label: 'Cauliflower' },
    { value: 'Cabbage', label: 'Cabbage' },
    { value: 'Carrot', label: 'Carrot' },
    { value: 'Radish', label: 'Radish' },
    { value: 'Okra (Ladyfinger)', label: 'Okra (Ladyfinger)' },
    { value: 'Bottle Gourd', label: 'Bottle Gourd' },
    { value: 'Bitter Gourd', label: 'Bitter Gourd' },
    { value: 'Pumpkin', label: 'Pumpkin' },
    { value: 'Spinach', label: 'Spinach' },
    { value: 'Peas', label: 'Peas' },
    { value: 'Beans', label: 'Beans' },
    { value: 'Chillies', label: 'Chillies' },
    { value: 'Capsicum', label: 'Capsicum' },
    { value: 'Garlic', label: 'Garlic' },
    { value: 'Ginger', label: 'Ginger' },
    { value: 'Turmeric', label: 'Turmeric' },
    { value: 'Coriander', label: 'Coriander' },
    { value: 'Cumin', label: 'Cumin' },
    { value: 'Fennel', label: 'Fennel' },
    { value: 'Fenugreek', label: 'Fenugreek' },
    { value: 'Black Pepper', label: 'Black Pepper' },
    { value: 'Cardamom', label: 'Cardamom' },
    { value: 'Cloves', label: 'Cloves' },
    { value: 'Cinnamon', label: 'Cinnamon' },
    { value: 'Mustard Seeds', label: 'Mustard Seeds' },
    { value: 'Ajwain (Carom Seeds)', label: 'Ajwain (Carom Seeds)' },
    { value: 'Dill', label: 'Dill' },
    { value: 'Tea', label: 'Tea' },
    { value: 'Coffee', label: 'Coffee' },
    { value: 'Rubber', label: 'Rubber' },
];

const fruitOptions = [
    { value: 'Mango', label: 'Mango' },
    { value: 'Apple', label: 'Apple' },
    { value: 'Banana', label: 'Banana' },
    { value: 'Grapes', label: 'Grapes' },
    { value: 'Orange', label: 'Orange' },
    { value: 'Pomegranate', label: 'Pomegranate' },
    { value: 'Guava', label: 'Guava' },
    { value: 'Papaya', label: 'Papaya' },
    { value: 'Lemon', label: 'Lemon' },
    { value: 'Fig', label: 'Fig' },
    { value: 'Pineapple', label: 'Pineapple' },
    { value: 'Litchi', label: 'Litchi' },
    { value: 'Jackfruit', label: 'Jackfruit' },
    { value: 'Amla', label: 'Amla' },
    { value: 'Coconut', label: 'Coconut' },
    { value: 'Areca Nut', label: 'Areca Nut' },
    { value: 'Cocoa', label: 'Cocoa' },
];


const soilOptions = [
    { value: 'Alluvial', label: 'Alluvial' }, { value: 'Black', label: 'Black' }, { value: 'Red', label: 'Red' }, { value: 'Laterite', label: 'Laterite' }, { value: 'Desert', label: 'Desert' }, { value: 'Mountainous', label: 'Mountainous' }, 
    { value: 'Loamy', label: 'Loamy' }, { value: 'Sandy', label: 'Sandy' }, { value: 'Clay', label: 'Clay' }, { value: 'Saline', label: 'Saline' }, { value: 'Peaty', label: 'Peaty' }
];

const cropStageOptions = [
    { value: 'Land Preparation', label: 'Land Preparation' }, { value: 'Sowing', label: 'Sowing' }, { value: 'Germination', label: 'Germination' }, { value: 'Seedling', label: 'Seedling' }, { value: 'Vegetative', label: 'Vegetative' }, 
    { value: 'Flowering', label: 'Flowering' }, { value: 'Fruiting', label: 'Fruiting' }, { value: 'Ripening', label: 'Ripening' }, { value: 'Harvesting', label: 'Harvesting' }
];

const fruitStageOptions = [
    { value: 'Planting', label: 'Planting' }, { value: 'Juvenile', label: 'Juvenile' }, { value: 'Vegetative', label: 'Vegetative' }, { value: 'Budding', label: 'Budding' }, { value: 'Flowering', label: 'Flowering' }, { value: 'Fruit Set', label: 'Fruit Set' }, 
    { value: 'Fruit Development', label: 'Fruit Development' }, { value: 'Ripening', label: 'Ripening' }, { value: 'Harvesting', label: 'Harvesting' }, { value: 'Dormancy', label: 'Dormancy' }
];


export function AdvisoryCard({ itemType = 'Crop' }: AdvisoryCardProps) {
  const [isPending, startTransition] = useTransition();
  const [isLocating, setIsLocating] = useState(false);
  const [result, setResult] = useState<AdvisoryResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const { t } = useTranslation();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      cropType: '',
      soilDetails: '',
      currentStageOfCrop: '',
      location: '',
    },
  });
  
  useEffect(() => {
    form.reset({
      cropType: itemType === 'Crop' ? 'Wheat' : 'Mango',
      soilDetails: itemType === 'Crop' ? 'Alluvial' : 'Loamy',
      currentStageOfCrop: itemType === 'Crop' ? 'Vegetative' : 'Flowering',
      location: localStorage.getItem('agriVision-location') || '',
    });
    const cachedAdvisory = localStorage.getItem(`agriVision-advisory-${itemType}`);
    if (cachedAdvisory) {
      setResult(JSON.parse(cachedAdvisory));
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [itemType]);


  useEffect(() => {
    const cachedAdvisory = localStorage.getItem(`agriVision-advisory-${itemType}`);
    if (cachedAdvisory) {
      setResult(JSON.parse(cachedAdvisory));
    }
    const cachedLocation = localStorage.getItem('agriVision-location');
    if(cachedLocation) {
        form.setValue('location', cachedLocation);
    }
  }, [form, itemType]);

  const handleUseLocation = async () => {
    if (!navigator.geolocation) {
        toast({
            variant: "destructive",
            title: "Geolocation Not Supported",
            description: "Your browser does not support geolocation.",
        });
        return;
    }
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
        async (position) => {
            const { latitude, longitude } = position.coords;
            try {
                const apiKey = process.env.NEXT_PUBLIC_OPENWEATHERMAP_API_KEY;
                if (!apiKey) {
                    toast({
                        variant: "destructive",
                        title: "Configuration Error",
                        description: "Weather API key is not configured in the application.",
                    });
                    throw new Error("API Key not found");
                }
                
                const cityName = await getCityNameFromCoords({lat: latitude, lon: longitude}, apiKey);
                form.setValue('location', cityName);
                localStorage.setItem('agriVision-location', cityName);
                toast({
                    title: "Location Set",
                    description: `Your location has been set to ${cityName}`,
                });
            } catch (err) {
                 toast({
                    variant: "destructive",
                    title: "Could not fetch location name.",
                    description: "Please enter your location manually."
                });
            } finally {
                setIsLocating(false);
            }
        },
        (error) => {
             toast({
                variant: "destructive",
                title: "Geolocation Error",
                description: error.message,
            });
            setIsLocating(false);
        }
    );
  };

  function onSubmit(values: z.infer<typeof formSchema>) {
    startTransition(async () => {
      setError(null);
      setResult(null);

      try {
        const response: IntegrateWeatherDataForAdvisoryOutput = await integrateWeatherDataForAdvisory({
            ...values,
            advisory: `Provide general farming advice for ${values.cropType}.`,
        });

        const apiResult: AdvisoryResult = {
            advisory: response.integratedAdvisory,
            weather: response.weather,
        };

        if(!response.weather) {
            toast({
                variant: 'destructive',
                title: 'Weather Data Unavailable',
                description: 'Could not fetch weather data. The advisory is based on general information.',
            });
        }

        setResult(apiResult);
        localStorage.setItem(`agriVision-advisory-${itemType}`, JSON.stringify(apiResult));
      } catch (e: any) {
        console.error(e);
        let errorMessage = `Failed to get advisory. ${e.message}`;
        setError(errorMessage);
      }
    });
  }
  
  const currentItemOptions = itemType === 'Crop' ? cropOptions : fruitOptions;
  const currentStageOptions = itemType === 'Crop' ? cropStageOptions : fruitStageOptions;

  return (
    <Card>
      <CardHeader>
        <CardTitle>{itemType} & Weather Advisory</CardTitle>
        <CardDescription>
          Fill in your farm details to receive a personalized, weather-integrated advisory.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                    control={form.control}
                    name="cropType"
                    render={({ field }) => (
                        <FormItem className="flex flex-col">
                            <FormLabel>{itemType} Type</FormLabel>
                            <Combobox 
                                options={currentItemOptions}
                                {...field}
                                placeholder={`Select or type a ${itemType.toLowerCase()}...`}
                            />
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="soilDetails"
                    render={({ field }) => (
                         <FormItem className="flex flex-col">
                            <FormLabel>Soil Details</FormLabel>
                             <Combobox 
                                options={soilOptions}
                                {...field}
                                placeholder="Select or type a soil type..."
                            />
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="currentStageOfCrop"
                    render={({ field }) => (
                        <FormItem className="flex flex-col">
                            <FormLabel>Current {itemType} Stage</FormLabel>
                            <Combobox 
                                options={currentStageOptions}
                                {...field}
                                placeholder="Select or type a stage..."
                            />
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                control={form.control}
                name="location"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>Location</FormLabel>
                        <div className="flex gap-2">
                        <FormControl>
                            <Input placeholder="e.g., Punjab, India" {...field} />
                        </FormControl>
                         <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            onClick={handleUseLocation}
                            disabled={isLocating}
                            aria-label="Use my location"
                            >
                            {isLocating ? <Loader2 className="h-4 w-4 animate-spin" /> : <LocateFixed className="h-4 w-4" />}
                        </Button>
                        </div>
                        <FormMessage />
                    </FormItem>
                )}
                />
            </div>
            <Button type="submit" disabled={isPending} className="w-full">
              {isPending ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> {t('advisoryCard.generating')}</> : t('advisoryCard.getAdvisory')}
            </Button>
          </form>
        </Form>
        
        {isPending && !result && (
          <div className="mt-6 text-center text-muted-foreground">
            <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary" />
            <p className='mt-2'>{t('advisoryCard.loading')}</p>
          </div>
        )}

        {error && (
            <Alert variant="destructive" className="mt-4">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
            </Alert>
        )}

        {result && (
          <div className="mt-6 space-y-6">
            <Separator />
            {result.weather && (
                <div>
                <h3 className="text-lg font-semibold mb-2">{t('advisoryCard.weatherTitle', { location: form.getValues('location') })}</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                    <div className="flex items-center gap-2 p-3 rounded-lg bg-secondary">
                        <Sun className="w-5 h-5 text-amber-500" />
                        <div>
                            <p className="text-muted-foreground">{t('advisoryCard.temperature')}</p>
                            <p className="font-semibold">{result.weather.temperature}°C ({result.weather.condition})</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 p-3 rounded-lg bg-secondary">
                        <Droplets className="w-5 h-5 text-blue-500" />
                        <div>
                            <p className="text-muted-foreground">{t('advisoryCard.humidity')}</p>
                            <p className="font-semibold">{result.weather.humidity}%</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 p-3 rounded-lg bg-secondary">
                        <Wind className="w-5 h-5 text-gray-500" />
                        <div>
                            <p className="text-muted-foreground">{t('advisoryCard.windSpeed')}</p>
                            <p className="font-semibold">{result.weather.windSpeed} km/h</p>
                        </div>
                    </div>
                </div>
                </div>
            )}
            <div>
                <h3 className="text-lg font-semibold mb-2">{t('advisoryCard.advisoryTitle')}</h3>
                <div className="prose prose-sm max-w-none p-4 bg-primary/5 rounded-lg border border-primary/20 text-foreground">
                    <p>{result.advisory}</p>
                </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

    

    