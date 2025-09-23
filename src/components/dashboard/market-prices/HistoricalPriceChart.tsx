
'use client';

import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { getMarketPrices, type GetMarketPricesOutput } from '@/ai/flows/get-market-prices';
import { Loader2, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { MultiSelect } from '@/components/ui/multi-select';
import { parseDate } from './MarketPricesView';

const popularCrops = ["Wheat", "Paddy", "Cotton", "Maize", "Sugarcane", "Potato", "Tomato", "Onion"];

const chartColors = [
    'hsl(var(--chart-1))',
    'hsl(var(--chart-2))',
    'hsl(var(--chart-3))',
    'hsl(var(--chart-4))',
    'hsl(var(--chart-5))',
];

type HistoricalPriceChartProps = {
    location: string;
    initialCrops: string[];
}

type ChartDataPoint = {
    date: string;
    [cropName: string]: number | string;
};

export function HistoricalPriceChart({ location, initialCrops }: HistoricalPriceChartProps) {
    const [selectedCrops, setSelectedCrops] = useState<string[]>(initialCrops);
    const [chartData, setChartData] = useState<ChartDataPoint[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        // When the initial crop from the main search changes, update the multi-select
        if (initialCrops.length > 0 && initialCrops[0] !== 'All' && !selectedCrops.includes(initialCrops[0])) {
             setSelectedCrops(initialCrops);
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [initialCrops]);

    useEffect(() => {
        if (!location || selectedCrops.length === 0) {
            setChartData([]);
            return;
        }

        const fetchChartData = async () => {
            setIsLoading(true);
            setError(null);
            
            try {
                const cropDataPromises = selectedCrops.map(crop => getMarketPrices({ location, crop }));
                const results = await Promise.all(cropDataPromises);

                const priceDataByDate: { [date: string]: { [crop: string]: number } } = {};
                
                results.forEach((result, index) => {
                    const cropName = selectedCrops[index];
                    result.prices.forEach(price => {
                        const dateStr = parseDate(price.arrivalDate).toLocaleDateString('en-CA'); // YYYY-MM-DD
                        if (!priceDataByDate[dateStr]) {
                            priceDataByDate[dateStr] = {};
                        }
                        // Use modal price, average if multiple entries for the same day
                        priceDataByDate[dateStr][cropName] = price.modalPrice;
                    });
                });
                
                const formattedData = Object.keys(priceDataByDate).map(date => ({
                    date,
                    ...priceDataByDate[date]
                })).sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime());

                setChartData(formattedData);

            } catch (e) {
                console.error(e);
                setError('Failed to fetch historical price data.');
                setChartData([]);
            } finally {
                setIsLoading(false);
            }
        };

        fetchChartData();

    }, [location, selectedCrops]);

    const CustomTooltip = ({ active, payload, label }: any) => {
        if (active && payload && payload.length) {
            return (
            <div className="bg-background/80 p-2 border border-border rounded-md shadow-lg backdrop-blur-sm">
                <p className="label font-bold">{label}</p>
                {payload.map((pld: any, index: number) => (
                    <p key={index} style={{ color: pld.color }}>
                        {`${pld.name}: ₹${pld.value.toLocaleString()}`}
                    </p>
                ))}
            </div>
            );
        }
        return null;
    };


    return (
        <Card>
            <CardHeader>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <CardTitle>Historical Price Trends</CardTitle>
                        <CardDescription>Compare modal prices for multiple crops in {location}.</CardDescription>
                    </div>
                     <div className="w-full sm:w-auto sm:max-w-xs">
                        <MultiSelect
                            options={popularCrops.filter(c => c !== 'All').map(c => ({label: c, value: c}))}
                            selected={selectedCrops}
                            onChange={setSelectedCrops}
                            placeholder="Select crops..."
                        />
                     </div>
                </div>
            </CardHeader>
            <CardContent>
                <div className="h-[350px] w-full">
                    {isLoading ? (
                        <div className="flex items-center justify-center h-full">
                            <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        </div>
                    ) : error ? (
                         <Alert variant="destructive">
                            <AlertCircle className="h-4 w-4" />
                            <AlertTitle>Error</AlertTitle>
                            <AlertDescription>{error}</AlertDescription>
                        </Alert>
                    ) : chartData.length === 0 ? (
                         <div className="flex items-center justify-center h-full">
                            <p className="text-muted-foreground">No data to display. Please select at least one crop.</p>
                        </div>
                    ) : (
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={chartData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border) / 0.5)" />
                                <XAxis 
                                    dataKey="date" 
                                    tickFormatter={(str) => {
                                        const date = new Date(str);
                                        return date.toLocaleDateString('en-GB', { month: 'short', day: 'numeric' });
                                    }}
                                    tick={{fontSize: 12}}
                                />
                                <YAxis 
                                    tickFormatter={(val) => `₹${val / 1000}k`}
                                    tick={{fontSize: 12}}
                                />
                                <Tooltip content={<CustomTooltip />} />
                                <Legend />
                                {selectedCrops.map((crop, index) => (
                                    <Line 
                                        key={crop} 
                                        type="monotone" 
                                        dataKey={crop} 
                                        stroke={chartColors[index % chartColors.length]}
                                        strokeWidth={2}
                                        dot={false}
                                    />
                                ))}
                            </LineChart>
                        </ResponsiveContainer>
                    )}
                </div>
            </CardContent>
        </Card>
    )
}
