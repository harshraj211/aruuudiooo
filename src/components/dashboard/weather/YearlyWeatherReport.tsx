
'use client';

import { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileDown } from 'lucide-react';
import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid } from 'recharts';
import { ChartContainer, ChartTooltipContent } from '@/components/ui/chart';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useTranslation } from '@/hooks/useTranslation';

type MonthlyData = {
  month: string;
  temperature: number;
  rainfall: number;
  humidity: number;
};

// Generates realistic mock data for the last 12 months for a location in the northern hemisphere
const generateMockYearlyData = (): MonthlyData[] => {
  const data: MonthlyData[] = [];
  const now = new Date();
  for (let i = 11; i >= 0; i--) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const month = date.toLocaleString('default', { month: 'short' });
    const monthIndex = date.getMonth(); // 0-11

    // Simulate seasonal temperature variation (cooler in winter, warmer in summer)
    const tempVariation = Math.sin((monthIndex - 3) * (Math.PI / 6)) * 15; // Peak in July
    const baseTemp = 20; // Average yearly temp
    const temperature = parseFloat((baseTemp + tempVariation + (Math.random() * 4 - 2)).toFixed(1));

    // Simulate seasonal rainfall (monsoon season)
    const isMonsoon = monthIndex >= 5 && monthIndex <= 8; // June to September
    const rainfall = parseFloat(((isMonsoon ? 150 : 30) + Math.random() * (isMonsoon ? 100 : 20)).toFixed(1));

    // Simulate humidity (higher during monsoon)
    const humidity = parseFloat(((isMonsoon ? 80 : 60) + (Math.random() * 10 - 5)).toFixed(1));

    data.push({ month, temperature, rainfall, humidity });
  }
  return data;
};

export function YearlyWeatherReport() {
  const [dataType, setDataType] = useState<'temperature' | 'rainfall' | 'humidity'>('temperature');
  const yearlyData = useMemo(() => generateMockYearlyData(), []);
  const { t } = useTranslation();

  const chartConfig = {
    [dataType]: {
      label: dataType.charAt(0).toUpperCase() + dataType.slice(1),
      color: 'hsl(var(--primary))',
    },
  };
  
  const yAxisLabel = {
      temperature: '°C',
      rainfall: 'mm',
      humidity: '%',
  }[dataType];

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="space-y-1.5">
                <CardTitle>{t('weatherPage.yearlyReport.title')}</CardTitle>
                <CardDescription>{t('weatherPage.yearlyReport.description')}</CardDescription>
            </div>
            <div className="flex items-center gap-2">
                 <Tabs value={dataType} onValueChange={(value) => setDataType(value as any)}>
                    <TabsList>
                        <TabsTrigger value="temperature">{t('weatherPage.temperature')}</TabsTrigger>
                        <TabsTrigger value="rainfall">{t('weatherPage.yearlyReport.rainfall')}</TabsTrigger>
                        <TabsTrigger value="humidity">{t('weatherPage.humidity')}</TabsTrigger>
                    </TabsList>
                </Tabs>
                <Button variant="outline" size="icon" disabled>
                    <FileDown className="h-4 w-4" />
                    <span className="sr-only">Download Report</span>
                </Button>
            </div>
        </div>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[300px] w-full">
            <LineChart
                accessibilityLayer
                data={yearlyData}
                margin={{
                    top: 5,
                    right: 20,
                    left: -10,
                    bottom: 5,
                }}
            >
                <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="hsl(var(--border) / 0.5)" />
                <XAxis
                    dataKey="month"
                    tickLine={false}
                    axisLine={false}
                    tickMargin={8}
                    tickFormatter={(value) => value.slice(0, 3)}
                />
                <YAxis
                    tickLine={false}
                    axisLine={false}
                    tickMargin={8}
                    tickFormatter={(value) => `${value}${yAxisLabel}`}
                />
                <Tooltip
                    cursor={false}
                    content={
                        <ChartTooltipContent
                            formatter={(value) => `${value}${yAxisLabel}`}
                            indicator="dot"
                        />
                    }
                />
                <Line
                    dataKey={dataType}
                    type="monotone"
                    stroke="hsl(var(--primary))"
                    strokeWidth={2}
                    dot={true}
                />
            </LineChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
