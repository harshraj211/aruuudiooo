'use client';
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { simulateCropProfitability, SimulateCropProfitabilityOutput } from '@/ai/flows/simulate-crop-profitability';
import { useToast } from '@/hooks/use-toast';
import { AlertCircle, ArrowUp, ArrowDown, Banknote, BarChart, CheckCircle, LineChart, Loader2, Pickaxe, Scale, TrendingUp } from 'lucide-react';
import { cropData } from '@/lib/item-data';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { cn } from '@/lib/utils';

const simulationSchema = z.object({
  landSizeInAcres: z.coerce.number().positive({ message: "Land size must be positive." }),
  cropName: z.string().min(1, { message: "Please select a crop." }),
  inputCosts: z.coerce.number().min(0, { message: "Input costs cannot be negative." }),
  location: z.string().min(2, { message: "Location is required." }),
});

type SimulationInput = z.infer<typeof simulationSchema>;
type SimulationResult = SimulateCropProfitabilityOutput;

const loadingMessages = [
    "Fetching weather data…",
    "Analyzing soil conditions…",
    "Checking market prices…",
    "Calculating profit margins…",
    "Finalizing simulation...",
];

export default function CropSimulationPage() {
    const [result, setResult] = useState<SimulationResult | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [loadingStep, setLoadingStep] = useState(0);

    const { toast } = useToast();

    const form = useForm<SimulationInput>({
        resolver: zodResolver(simulationSchema),
        defaultValues: {
            landSizeInAcres: 1,
            cropName: '',
            inputCosts: 10000,
            location: '',
        },
    });

    useEffect(() => {
        const savedLocation = localStorage.getItem('agriVision-location');
        if (savedLocation) {
            form.setValue('location', savedLocation);
        }
    }, [form]);

    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (isLoading) {
            interval = setInterval(() => {
                setLoadingStep(prev => (prev + 1) % loadingMessages.length);
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [isLoading]);


    const onSubmit = async (values: SimulationInput) => {
        setIsLoading(true);
        setError(null);
        setResult(null);
        setLoadingStep(0);

        try {
            const simulationResult = await simulateCropProfitability(values);
            setResult(simulationResult);
        } catch (e: any) {
            console.error(e);
            setError(`Simulation failed: ${e.message || "An unknown error occurred."}`);
            toast({
                variant: 'destructive',
                title: "Simulation Error",
                description: e.message || "Could not complete the simulation.",
            });
        } finally {
            setIsLoading(false);
        }
    };
    
    const cropOptions = Object.values(cropData).map(c => ({ value: c.name, label: c.name }));

    return (
        <main>
            <div className="mb-8 space-y-2">
                <h1 className="text-3xl font-bold">Crop Yield & Profit Simulator</h1>
                <p className="text-muted-foreground">
                    Make informed decisions by simulating potential outcomes before you sow.
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                <Card className="lg:col-span-1 sticky top-20">
                    <CardHeader>
                        <CardTitle>Simulation Inputs</CardTitle>
                        <CardDescription>Enter your farm and crop details below.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                                <FormField
                                    control={form.control}
                                    name="cropName"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Crop Choice</FormLabel>
                                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                <FormControl>
                                                    <SelectTrigger><SelectValue placeholder="Select a crop" /></SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    {cropOptions.map(c => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="landSizeInAcres"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Land Size (in acres)</FormLabel>
                                            <FormControl><Input type="number" {...field} /></FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="inputCosts"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Total Input Costs (₹)</FormLabel>
                                            <FormControl><Input type="number" placeholder="e.g., 15000" {...field} /></FormControl>
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
                                            <FormControl><Input placeholder="e.g., Punjab, India" {...field} /></FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <Button type="submit" disabled={isLoading} className="w-full">
                                    {isLoading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Simulating...</> : <>Simulate Profitability</>}
                                </Button>
                            </form>
                        </Form>
                    </CardContent>
                </Card>
                <div className="lg:col-span-2">
                    {isLoading && (
                         <Card className="flex flex-col items-center justify-center h-96">
                            <CardContent className="text-center">
                                <Loader2 className="h-16 w-16 text-primary animate-spin mb-4" />
                                <h3 className="text-xl font-semibold mb-2">Running Simulation...</h3>
                                <p className="text-muted-foreground">{loadingMessages[loadingStep]}</p>
                            </CardContent>
                        </Card>
                    )}
                    {error && (
                         <Alert variant="destructive">
                            <AlertCircle className="h-4 w-4" />
                            <AlertTitle>Error</AlertTitle>
                            <AlertDescription>{error}</AlertDescription>
                        </Alert>
                    )}
                    {result && !isLoading && (
                        <Card>
                            <CardHeader>
                                <CardTitle className='text-2xl'>Simulation Results for {form.getValues('cropName')}</CardTitle>
                                <CardDescription>Based on the data provided and real-time market analysis.</CardDescription>
                            </CardHeader>
                             <CardContent className="space-y-6">
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                     <ResultCard icon={Scale} title="Expected Yield" value={`${result.expectedYieldPerAcre.toLocaleString()} kg/acre`} />
                                     <ResultCard icon={Banknote} title="Est. Price" value={`₹${result.estimatedSellingPricePerKg.toFixed(2)}/kg`} />
                                     <ResultCard icon={TrendingUp} title="Total Revenue" value={`₹${result.totalRevenue.toLocaleString()}`} />
                                     <ResultCard icon={Pickaxe} title="Input Costs" value={`₹${form.getValues('inputCosts').toLocaleString()}`} isNegative />
                                </div>
                                
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                     <Card className={cn("border-2", 
                                        result.profitabilityIndicator === 'High' && 'border-green-500 bg-green-500/5',
                                        result.profitabilityIndicator === 'Medium' && 'border-yellow-500 bg-yellow-500/5',
                                        result.profitabilityIndicator === 'Low' && 'border-red-500 bg-red-500/5'
                                    )}>
                                        <CardHeader className='text-center'>
                                            <CardDescription>Net Profit</CardDescription>
                                            <CardTitle className={cn(
                                                "text-4xl",
                                                result.netProfit < 0 ? 'text-red-500' : 'text-green-600'
                                            )}>
                                                {result.netProfit < 0 ? '-' : ''}₹{Math.abs(result.netProfit).toLocaleString()}
                                            </CardTitle>
                                        </CardHeader>
                                    </Card>
                                     <Card className="flex items-center justify-center">
                                        <CardHeader className='text-center'>
                                             <CardDescription>Profitability</CardDescription>
                                             <CardTitle className={cn("text-4xl", 
                                                result.profitabilityIndicator === 'High' && 'text-green-500',
                                                result.profitabilityIndicator === 'Medium' && 'text-yellow-500',
                                                result.profitabilityIndicator === 'Low' && 'text-red-500'
                                            )}>{result.profitabilityIndicator}</CardTitle>
                                        </CardHeader>
                                     </Card>
                                </div>
                                
                                <Alert className='border-primary/20 bg-primary/5'>
                                    <CheckCircle className="h-4 w-4" />
                                    <AlertTitle>AI Recommendation</AlertTitle>
                                    <AlertDescription>
                                        <p>{result.recommendation}</p>
                                        {result.alternativeCropSuggestion && (
                                            <p className='mt-2'><strong>Alternative:</strong> {result.alternativeCropSuggestion}</p>
                                        )}
                                    </AlertDescription>
                                </Alert>
                            </CardContent>
                        </Card>
                    )}
                     {!isLoading && !result && !error && (
                        <Card className="flex flex-col items-center justify-center h-96 text-center">
                             <CardContent>
                                <BarChart className="h-16 w-16 text-muted-foreground/50 mb-4" />
                                <h3 className="text-xl font-semibold text-muted-foreground">Your results will appear here.</h3>
                                <p className="text-muted-foreground">Fill out the form and click "Simulate" to begin.</p>
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>
        </main>
    );
}


function ResultCard({ title, value, icon: Icon, isNegative = false }: { title: string, value: string, icon: React.ElementType, isNegative?: boolean }) {
    return (
        <Card className="text-center p-4">
            <Icon className={cn("h-8 w-8 mx-auto mb-2", isNegative ? 'text-red-500' : 'text-primary')} />
            <p className="text-lg font-bold">{value}</p>
            <p className="text-sm text-muted-foreground">{title}</p>
        </Card>
    );
}