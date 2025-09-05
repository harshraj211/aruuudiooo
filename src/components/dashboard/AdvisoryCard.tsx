
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Combobox } from '../ui/command';
import { Icon } from '../ui/icon';

const formSchema = z.object({
  cropType: z.string().min(1, 'Please select a type.'),
  soilDetails: z.string().min(1, 'Please select a soil type.'),
  currentStageOfCrop: z.string().min(1, 'Please select a stage.'),
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
    { value: 'rice', label: 'Rice', icon: 'Rice' },
    { value: 'wheat', label: 'Wheat', icon: 'Wheat' },
    { value: 'maize', label: 'Maize', icon: 'Corn' },
    { value: 'barley', label: 'Barley', icon: 'Barley' },
    { value: 'jowar', label: 'Jowar (Sorghum)', icon: 'Sorghum' },
    { value: 'bajra', label: 'Bajra (Pearl Millet)', icon: 'Millet' },
    { value: 'oats', label: 'Oats', icon: 'Oat' },
    { value: 'ragi', label: 'Ragi (Finger Millet)', icon: 'Millet' },
    { value: 'arhar', label: 'Arhar (Pigeon Pea)', icon: 'Pea' },
    { value: 'moong', label: 'Moong (Green Gram)', icon: 'Bean' },
    { value: 'urad', label: 'Urad (Black Gram)', icon: 'Bean' },
    { value: 'masoor', label: 'Masoor (Lentil)', icon: 'Lentil' },
    { value: 'chana', label: 'Chana (Bengal Gram)', icon: 'Chickpea' },
    { value: 'rajma', label: 'Rajma (Kidney Beans)', icon: 'Bean' },
    { value: 'moth bean', label: 'Moth Bean', icon: 'Bean' },
    { value: 'horse gram', label: 'Horse Gram', icon: 'Bean' },
    { value: 'cowpea', label: 'Cowpea', icon: 'Pea' },
    { value: 'cotton', label: 'Cotton', icon: 'Cotton' },
    { value: 'sugarcane', label: 'Sugarcane', icon: 'Sugarcane' },
    { value: 'jute', label: 'Jute', icon: 'Jute' },
    { value: 'tobacco', label: 'Tobacco', icon: 'Tobacco' },
    { value: 'groundnut', label: 'Groundnut (Peanut)', icon: 'Peanut' },
    { value: 'sunflower', label: 'Sunflower', icon: 'Sunflower' },
    { value: 'soybean', label: 'Soybean', icon: 'Soybean' },
    { value: 'mustard', label: 'Mustard', icon: 'Mustard' },
    { value: 'sesame', label: 'Sesame (Til)', icon: 'Sesame' },
    { value: 'linseed', label: 'Linseed (Flax)', icon: 'Flax' },
    { value: 'castor', label: 'Castor', icon: 'Castor' },
    { value: 'potato', label: 'Potato', icon: 'Potato' },
    { value: 'onion', label: 'Onion', icon: 'Onion' },
    { value: 'tomato', label: 'Tomato', icon: 'Tomato' },
    { value: 'brinjal', label: 'Brinjal (Eggplant)', icon: 'Eggplant' },
    { value: 'cauliflower', label: 'Cauliflower', icon: 'Cauliflower' },
    { value: 'cabbage', label: 'Cabbage', icon: 'Cabbage' },
    { value: 'carrot', label: 'Carrot', icon: 'Carrot' },
    { value: 'radish', label: 'Radish', icon: 'Radish' },
    { value: 'okra', label: 'Okra (Ladyfinger)', icon: 'Okra' },
    { value: 'bottle gourd', label: 'Bottle Gourd', icon: 'Gourd' },
    { value: 'bitter gourd', label: 'Bitter Gourd', icon: 'Gourd' },
    { value: 'pumpkin', label: 'Pumpkin', icon: 'Pumpkin' },
    { value: 'spinach', label: 'Spinach', icon: 'Spinach' },
    { value: 'peas', label: 'Peas', icon: 'Pea' },
    { value: 'beans', label: 'Beans', icon: 'Bean' },
    { value: 'chillies', label: 'Chillies', icon: 'Chilli' },
    { value: 'capsicum', label: 'Capsicum', icon: 'BellPepper' },
    { value: 'garlic', label: 'Garlic', icon: 'Garlic' },
    { value: 'ginger', label: 'Ginger', icon: 'Ginger' },
    { value: 'turmeric', label: 'Turmeric', icon: 'Turmeric' },
    { value: 'coriander', label: 'Coriander', icon: 'Coriander' },
    { value: 'cumin', label: 'Cumin', icon: 'Cumin' },
    { value: 'fennel', label: 'Fennel', icon: 'Fennel' },
    { value: 'fenugreek', label: 'Fenugreek', icon: 'Fenugreek' },
    { value: 'black pepper', label: 'Black Pepper', icon: 'Pepper' },
    { value: 'cardamom', label: 'Cardamom', icon: 'Cardamom' },
    { value: 'cloves', label: 'Cloves', icon: 'Clove' },
    { value: 'cinnamon', label: 'Cinnamon', icon: 'Cinnamon' },
    { value: 'mustard seeds', label: 'Mustard Seeds', icon: 'Mustard' },
    { value: 'ajwain', label: 'Ajwain (Carom Seeds)', icon: 'Caraway' },
    { value: 'dill', label: 'Dill', icon: 'Dill' },
    { value: 'tea', label: 'Tea', icon: 'Tea' },
    { value: 'coffee', label: 'Coffee', icon: 'Coffee' },
    { value: 'rubber', label: 'Rubber', icon: 'Rubber' },
    { value: 'coconut', label: 'Coconut', icon: 'Coconut' },
    { value: 'areca nut', label: 'Areca Nut', icon: 'ArecaNut' },
    { value: 'cocoa', label: 'Cocoa', icon: 'Cocoa' },
];

const fruitOptions = [
    { value: 'mango', label: 'Mango', icon: 'Mango' },
    { value: 'apple', label: 'Apple', icon: 'Apple' },
    { value: 'banana', label: 'Banana', icon: 'Banana' },
    { value: 'grapes', label: 'Grapes', icon: 'Grape' },
    { value: 'orange', label: 'Orange', icon: 'Orange' },
    { value: 'pomegranate', label: 'Pomegranate', icon: 'Pomegranate' },
    { value: 'guava', label: 'Guava', icon: 'Guava' },
    { value: 'papaya', label: 'Papaya', icon: 'Papaya' },
    { value: 'lemon', label: 'Lemon', icon: 'Lemon' },
    { value: 'fig', label: 'Fig', icon: 'Fig' },
    { value: 'pineapple', label: 'Pineapple', icon: 'Pineapple' },
    { value: 'litchi', label: 'Litchi', icon: 'Litchi' },
    { value: 'jackfruit', label: 'Jackfruit', icon: 'Jackfruit' },
    { value: 'amla', label: 'Amla', icon: 'Amla' },
];

const soilOptions = [
    'Alluvial', 'Black', 'Red', 'Laterite', 'Desert', 'Mountainous', 
    'Loamy', 'Sandy', 'Clay', 'Saline', 'Peaty', 'Chalky', 'Silty'
];

const cropStageOptions = [
    'Land Preparation', 'Sowing', 'Germination', 'Seedling', 'Vegetative', 
    'Tillering', 'Flowering', 'Milking', 'Ripening', 'Harvesting', 'Post-Harvest'
];

const fruitStageOptions = [
    'Planting', 'Juvenile', 'Vegetative', 'Budding', 'Flowering', 'Fruit Set', 
    'Fruit Development', 'Ripening', 'Harvesting', 'Dormancy', 'Pruning'
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
      cropType: itemType === 'Crop' ? 'wheat' : 'mango',
      soilDetails: itemType === 'Crop' ? 'Alluvial' : 'Loamy',
      currentStageOfCrop: itemType === 'Crop' ? 'Vegetative' : 'Flowering',
      location: '',
    },
  });
  
  useEffect(() => {
    form.reset({
      cropType: itemType === 'Crop' ? 'wheat' : 'mango',
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

      const friendlyCropName = (itemType === 'Crop' ? cropOptions : fruitOptions).find(o => o.value === values.cropType)?.label || values.cropType;

      try {
        const response: IntegrateWeatherDataForAdvisoryOutput = await integrateWeatherDataForAdvisory({
            ...values,
            cropType: friendlyCropName,
            advisory: `Provide general farming advice for ${friendlyCropName}.`,
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
                            value={field.value}
                            onChange={field.onChange}
                            placeholder={`Select a ${itemType.toLowerCase()}...`}
                            searchPlaceholder={`Search ${itemType.toLowerCase()}...`}
                        />
                        <FormMessage />
                    </FormItem>
                )}
                />
                <FormField
                control={form.control}
                name="soilDetails"
                render={({ field }) => (
                     <FormItem>
                        <FormLabel>Soil Details</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                                <SelectTrigger>
                                <SelectValue placeholder="Select a soil type" />
                                </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                                {soilOptions.map(opt => <SelectItem key={opt} value={opt}>{opt}</SelectItem>)}
                            </SelectContent>
                        </Select>
                        <FormMessage />
                    </FormItem>
                )}
                />
                <FormField
                control={form.control}
                name="currentStageOfCrop"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>Current {itemType} Stage</FormLabel>
                         <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                                <SelectTrigger>
                                <SelectValue placeholder={`Select a stage`} />
                                </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                                {currentStageOptions.map(opt => <SelectItem key={opt} value={opt}>{opt}</SelectItem>)}
                            </SelectContent>
                        </Select>
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
