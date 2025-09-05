
'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Droplets, Leaf, Sprout, TestTube2, SprayCan, BrainCircuit } from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';
import { z } from 'zod';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';

// --- Mock Data (In a real app, this would come from Firestore) ---
const cropData = {
    wheat: {
        type: 'crop',
        fertilizer: { npk: '20-20-20', urea: 50, dap: 25, potash: 20 },
        pesticides: {
            rust: { name: 'Propiconazole', dosageMlPerLitre: 1 },
            aphids: { name: 'Imidacloprid', dosageMlPerLitre: 0.5 },
            termites: { name: 'Chlorpyrifos', dosageMlPerLitre: 2 },
        },
        seedRateKgPerAcre: 40,
    },
    rice: {
        type: 'crop',
        fertilizer: { npk: '15-15-15', urea: 45, dap: 20, potash: 15 },
        pesticides: {
            'brown-planthopper': { name: 'Buprofezin', dosageMlPerLitre: 1.5 },
            'leaf-blast': { name: 'Tricyclazole', dosageMlPerLitre: 0.6 },
            'stem-borer': { name: 'Cartap Hydrochloride', dosageMlPerLitre: 1 },
        },
        seedRateKgPerAcre: 20,
    },
    maize: {
        type: 'crop',
        fertilizer: { npk: '25-10-15', urea: 55, dap: 30, potash: 20 },
        pesticides: {
            'fall-armyworm': { name: 'Emamectin Benzoate', dosageMlPerLitre: 0.4 },
            'stalk-borer': { name: 'Thiamethoxam', dosageMlPerLitre: 0.5 },
        },
        seedRateKgPerAcre: 8,
    },
    cotton: {
        type: 'crop',
        fertilizer: { npk: '30-15-15', urea: 65, dap: 40, potash: 25 },
        pesticides: {
            bollworm: { name: 'Spinosad', dosageMlPerLitre: 0.3 },
            'white-fly': { name: 'Diafenthiuron', dosageMlPerLitre: 1.2 },
        },
        seedRateKgPerAcre: 3,
    },
    sugarcane: {
        type: 'crop',
        fertilizer: { npk: '18-18-18', urea: 100, dap: 50, potash: 40 },
        pesticides: {
            'early-shoot-borer': { name: 'Fipronil', dosageMlPerLitre: 2 },
            'mealy-bug': { name: 'Profenofos', dosageMlPerLitre: 1.5 },
        },
        seedRateKgPerAcre: 2000, // In terms of setts/acre
    },
    mango: {
        type: 'fruit',
         fertilizer: { npk: '10-10-10', urea: 30, dap: 15, potash: 30 },
         pesticides: {
            'powdery-mildew': { name: 'Hexaconazole', dosageMlPerLitre: 1 },
            'fruit-fly': { name: 'Spinosad', dosageMlPerLitre: 0.3 },
            'mealy-bug': { name: 'Buprofezin', dosageMlPerLitre: 1.5 },
        },
        seedRateKgPerAcre: 0, // Not applicable
    },
    apple: {
        type: 'fruit',
         fertilizer: { npk: '12-15-12', urea: 35, dap: 20, potash: 25 },
         pesticides: {
            scab: { name: 'Myclobutanil', dosageMlPerLitre: 0.5 },
            'codling-moth': { name: 'Deltamethrin', dosageMlPerLitre: 0.7 },
        },
        seedRateKgPerAcre: 0, // Not applicable
    },
    banana: {
        type: 'fruit',
        fertilizer: { npk: '19-19-19', urea: 80, dap: 40, potash: 100 },
        pesticides: {
            'pseudostem-weevil': { name: 'Chlorpyrifos', dosageMlPerLitre: 2.5 },
            'panama-wilt': { name: 'Carbendazim', dosageMlPerLitre: 1 },
        },
        seedRateKgPerAcre: 0, // Not applicable
    }
};

type CropName = keyof typeof cropData;
type ItemType = 'Crop' | 'Fruit';


const unitConversionFactors = {
    acre: 1,
    hectare: 2.47105,
    sqmeter: 0.000247105,
    sqfeet: 0.0000229568,
};
type Unit = keyof typeof unitConversionFactors;

// --- Zod Schemas for Form Validation ---
const baseSchema = z.object({
    landSize: z.coerce.number().positive({ message: "Land size must be positive." }),
    unit: z.enum(['acre', 'hectare', 'sqmeter', 'sqfeet']),
});

const fertilizerSchema = baseSchema.extend({
    item: z.string().min(1, "Please select an item."),
});

const pesticideSchema = baseSchema.extend({
    item: z.string().min(1, "Please select an item."),
    pest: z.string().min(1, "Please select a pest/disease."),
});

const seedSchema = baseSchema.extend({
    item: z.string().min(1, "Please select a crop."),
});


// --- Calculator Components ---

function FertilizerCalculator({ itemType }: { itemType: ItemType }) {
    const { t } = useTranslation();
    const [result, setResult] = useState<string | null>(null);

    const form = useForm<z.infer<typeof fertilizerSchema>>({
        resolver: zodResolver(fertilizerSchema),
        defaultValues: { item: '', landSize: 1, unit: 'acre' },
    });

    function onSubmit(values: z.infer<typeof fertilizerSchema>) {
        const landInAcres = values.landSize * unitConversionFactors[values.unit as Unit];
        const item = values.item as CropName;
        const fert = cropData[item]?.fertilizer;

        if (!fert) {
            setResult(t('calculatorsPage.error.noData'));
            return;
        }

        const urea = (fert.urea * landInAcres).toFixed(2);
        const dap = (fert.dap * landInAcres).toFixed(2);
        const potash = (fert.potash * landInAcres).toFixed(2);

        setResult(
          `${t('calculatorsPage.fertilizer.result.urea')}: ${urea} kg\n` +
          `${t('calculatorsPage.fertilizer.result.dap')}: ${dap} kg\n` +
          `${t('calculatorsPage.fertilizer.result.potash')}: ${potash} kg\n` +
          `${t('calculatorsPage.fertilizer.result.npk')}: ${fert.npk}`
        );
    }
    
    const relevantItems = Object.keys(cropData).filter(key => {
        return cropData[key as CropName].type === itemType.toLowerCase();
    });

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                    control={form.control}
                    name="item"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>{t(`calculatorsPage.inputs.${itemType.toLowerCase()}Type`)}</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                    <SelectTrigger>
                                        <SelectValue placeholder={t(`calculatorsPage.inputs.${itemType.toLowerCase()}Placeholder`)} />
                                    </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                    {relevantItems.map(c => <SelectItem key={c} value={c} className="capitalize">{c.replace('-', ' ')}</SelectItem>)}
                                </SelectContent>
                            </Select>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <div className="flex gap-4">
                    <FormField
                        control={form.control}
                        name="landSize"
                        render={({ field }) => (
                            <FormItem className="flex-1">
                                <FormLabel>{t('calculatorsPage.inputs.landSize')}</FormLabel>
                                <FormControl>
                                    <Input type="number" placeholder="e.g., 2.5" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="unit"
                        render={({ field }) => (
                            <FormItem className="w-1/3">
                                <FormLabel>{t('calculatorsPage.inputs.unit')}</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        <SelectItem value="acre">{t('calculatorsPage.units.acre')}</SelectItem>
                                        <SelectItem value="hectare">{t('calculatorsPage.units.hectare')}</SelectItem>
                                        <SelectItem value="sqmeter">{t('calculatorsPage.units.sqmeter')}</SelectItem>
                                        <SelectItem value="sqfeet">{t('calculatorsPage.units.sqfeet')}</SelectItem>
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>
                <Button type="submit" className="w-full">{t('calculatorsPage.buttons.calculate')}</Button>
                {result && <ResultCard icon={<TestTube2 />} title={t('calculatorsPage.fertilizer.result.title')} content={result} />}
            </form>
        </Form>
    )
}


function PesticideCalculator({ itemType }: { itemType: ItemType }) {
    const { t } = useTranslation();
    const [result, setResult] = useState<string | null>(null);
    const form = useForm<z.infer<typeof pesticideSchema>>({
        resolver: zodResolver(pesticideSchema),
        defaultValues: { item: '', pest: '', landSize: 1, unit: 'acre' },
    });
    
    const selectedItem = form.watch('item') as CropName;
    const itemPesticides = selectedItem ? cropData[selectedItem]?.pesticides : null;

    function onSubmit(values: z.infer<typeof pesticideSchema>) {
        const landInAcres = values.landSize * unitConversionFactors[values.unit as Unit];
        const pest = cropData[values.item as CropName]?.pesticides[values.pest as keyof typeof cropData[CropName]['pesticides']];

        if (!pest) {
            setResult(t('calculatorsPage.error.noData'));
            return;
        }

        // Standard assumption: 150-200 litres of water per acre for spray
        const waterPerAcre = 150;
        const totalWater = (waterPerAcre * landInAcres).toFixed(2);
        const totalPesticide = (parseFloat(totalWater) * pest.dosageMlPerLitre).toFixed(2);

        setResult(
            `${t('calculatorsPage.pesticide.result.mix')} ${totalPesticide} ml ${pest.name} ${t('calculatorsPage.pesticide.result.in')} ${totalWater} ${t('calculatorsPage.pesticide.result.litresWater')}.`
        );
    }
    
    const relevantItems = Object.keys(cropData).filter(key => {
        return cropData[key as CropName].type === itemType.toLowerCase();
    });

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                    control={form.control}
                    name="item"
                    render={({ field }) => (
                         <FormItem>
                            <FormLabel>{t(`calculatorsPage.inputs.${itemType.toLowerCase()}Type`)}</FormLabel>
                            <Select onValueChange={(value) => {
                                field.onChange(value);
                                form.resetField('pest');
                            }} defaultValue={field.value}>
                                <FormControl>
                                    <SelectTrigger>
                                        <SelectValue placeholder={t(`calculatorsPage.inputs.${itemType.toLowerCase()}Placeholder`)} />
                                    </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                    {relevantItems.map(c => <SelectItem key={c} value={c} className="capitalize">{c.replace('-', ' ')}</SelectItem>)}
                                </SelectContent>
                            </Select>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                 <FormField
                    control={form.control}
                    name="pest"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>{t('calculatorsPage.inputs.pestOrDisease')}</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value} disabled={!selectedItem}>
                                <FormControl>
                                    <SelectTrigger>
                                        <SelectValue placeholder={t('calculatorsPage.inputs.pestPlaceholder')} />
                                    </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                    {itemPesticides && Object.keys(itemPesticides).map(p => (
                                        <SelectItem key={p} value={p} className="capitalize">{p.replace('-', ' ')}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <div className="flex gap-4">
                    <FormField
                        control={form.control}
                        name="landSize"
                        render={({ field }) => (
                            <FormItem className="flex-1">
                                <FormLabel>{t('calculatorsPage.inputs.landSize')}</FormLabel>
                                <FormControl>
                                    <Input type="number" placeholder="e.g., 2.5" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="unit"
                        render={({ field }) => (
                            <FormItem className="w-1/3">
                                <FormLabel>{t('calculatorsPage.inputs.unit')}</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                        <SelectTrigger><SelectValue /></SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        <SelectItem value="acre">{t('calculatorsPage.units.acre')}</SelectItem>
                                        <SelectItem value="hectare">{t('calculatorsPage.units.hectare')}</SelectItem>
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>
                <Button type="submit" className="w-full">{t('calculatorsPage.buttons.calculate')}</Button>
                {result && <ResultCard icon={<SprayCan />} title={t('calculatorsPage.pesticide.result.title')} content={result} />}
            </form>
        </Form>
    )
}

function SeedCalculator({ itemType }: { itemType: ItemType }) {
    const { t } = useTranslation();
    const [result, setResult] = useState<string | null>(null);
    const form = useForm<z.infer<typeof seedSchema>>({
        resolver: zodResolver(seedSchema),
        defaultValues: { item: '', landSize: 1, unit: 'acre' },
    });

    function onSubmit(values: z.infer<typeof seedSchema>) {
        const landInAcres = values.landSize * unitConversionFactors[values.unit as Unit];
        const seedRate = cropData[values.item as CropName]?.seedRateKgPerAcre;

        if (seedRate === undefined || seedRate === 0) {
            setResult(t('calculatorsPage.error.noSeedData'));
            return;
        }

        const totalSeed = (seedRate * landInAcres).toFixed(2);
        setResult(
            `${t('calculatorsPage.seed.result.youWillNeed')} ~${totalSeed} kg ${t('calculatorsPage.seed.result.ofSeed')}.`
        );
    }
    
    const cropItems = Object.keys(cropData).filter(key => {
        return cropData[key as CropName].type === 'crop' && cropData[key as CropName].seedRateKgPerAcre > 0;
    });


    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                 <FormField
                    control={form.control}
                    name="item"
                    render={({ field }) => (
                         <FormItem>
                            <FormLabel>{t(`calculatorsPage.inputs.cropType`)}</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                    <SelectTrigger>
                                        <SelectValue placeholder={t(`calculatorsPage.inputs.cropPlaceholder`)} />
                                    </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                    {cropItems.map(c => <SelectItem key={c} value={c} className="capitalize">{c.replace('-', ' ')}</SelectItem>)}
                                </SelectContent>
                            </Select>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <div className="flex gap-4">
                    <FormField
                        control={form.control}
                        name="landSize"
                        render={({ field }) => (
                            <FormItem className="flex-1">
                                <FormLabel>{t('calculatorsPage.inputs.landSize')}</FormLabel>
                                <FormControl>
                                    <Input type="number" placeholder="e.g., 2.5" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                     <FormField
                        control={form.control}
                        name="unit"
                        render={({ field }) => (
                            <FormItem className="w-1/3">
                                <FormLabel>{t('calculatorsPage.inputs.unit')}</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                        <SelectTrigger><SelectValue /></SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        <SelectItem value="acre">{t('calculatorsPage.units.acre')}</SelectItem>
                                        <SelectItem value="hectare">{t('calculatorsPage.units.hectare')}</SelectItem>
                                        <SelectItem value="sqmeter">{t('calculatorsPage.units.sqmeter')}</SelectItem>
                                        <SelectItem value="sqfeet">{t('calculatorsPage.units.sqfeet')}</SelectItem>
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>
                <Button type="submit" className="w-full">{t('calculatorsPage.buttons.calculate')}</Button>
                {result && <ResultCard icon={<Sprout />} title={t('calculatorsPage.seed.result.title')} content={result} />}
            </form>
        </Form>
    )
}

function ResultCard({ icon, title, content }: { icon: React.ReactNode, title: string, content: string }) {
    return (
        <Card className="mt-6 bg-primary/5 border-primary/20">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    {icon}
                    {title}
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="text-lg font-medium whitespace-pre-wrap">
                    {content}
                </div>
            </CardContent>
        </Card>
    )
}

export function Calculators({ itemType }: { itemType: ItemType }) {
    const { t } = useTranslation();
    return (
        <Tabs defaultValue="fertilizer" className="w-full max-w-2xl mx-auto">
            <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="fertilizer"><TestTube2 className="mr-2 h-4 w-4" />{t('calculatorsPage.tabs.fertilizer')}</TabsTrigger>
                <TabsTrigger value="pesticide"><SprayCan className="mr-2 h-4 w-4" />{t('calculatorsPage.tabs.pesticide')}</TabsTrigger>
                <TabsTrigger value="seed" disabled={itemType === 'Fruit'}><Sprout className="mr-2 h-4 w-4" />{t('calculatorsPage.tabs.seed')}</TabsTrigger>
            </TabsList>
            <TabsContent value="fertilizer">
                <Card>
                    <CardHeader>
                        <CardTitle>{t('calculatorsPage.fertilizer.title')}</CardTitle>
                        <CardDescription>{t('calculatorsPage.fertilizer.description')}</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <FertilizerCalculator itemType={itemType} />
                    </CardContent>
                </Card>
            </TabsContent>
            <TabsContent value="pesticide">
                <Card>
                    <CardHeader>
                        <CardTitle>{t('calculatorsPage.pesticide.title')}</CardTitle>
                        <CardDescription>{t('calculatorsPage.pesticide.description')}</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <PesticideCalculator itemType={itemType} />
                    </CardContent>
                </Card>
            </TabsContent>
            <TabsContent value="seed">
                <Card>
                    <CardHeader>
                        <CardTitle>{t('calculatorsPage.seed.title')}</CardTitle>
                        <CardDescription>{t('calculatorsPage.seed.description')}</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <SeedCalculator itemType={itemType} />
                    </CardContent>
                </Card>
            </TabsContent>
        </Tabs>
    )
}
