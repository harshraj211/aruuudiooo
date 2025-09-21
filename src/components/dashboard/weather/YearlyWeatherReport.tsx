
'use client';

import { useState, useMemo, useRef, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileDown, Loader2 } from 'lucide-react';
import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid, Legend } from 'recharts';
import { ChartContainer, ChartTooltipContent } from '@/components/ui/chart';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useTranslation } from '@/hooks/useTranslation';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { toPng } from 'html-to-image';


type MonthlyData = {
  month: string;
  temperature: number;
  rainfall: number;
  humidity: number;
};

// Generates realistic mock data for the last 12 months for a location in the northern hemisphere
const generateMockYearlyData = (location: string): MonthlyData[] => {
  const data: MonthlyData[] = [];
  const now = new Date();
  
  // Use location to seed the random data for some variation
  let seed = 0;
  for (let i = 0; i < location.length; i++) {
    seed += location.charCodeAt(i);
  }
  const random = () => {
      const x = Math.sin(seed++) * 10000;
      return x - Math.floor(x);
  }

  for (let i = 11; i >= 0; i--) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const month = date.toLocaleString('default', { month: 'short' });
    const monthIndex = date.getMonth(); // 0-11

    // Simulate seasonal temperature variation (cooler in winter, warmer in summer)
    const tempVariation = Math.sin((monthIndex - 3) * (Math.PI / 6)) * 15; // Peak in July
    const baseTemp = 20; // Average yearly temp
    const temperature = parseFloat((baseTemp + tempVariation + (random() * 4 - 2)).toFixed(1));

    // Simulate seasonal rainfall (monsoon season)
    const isMonsoon = monthIndex >= 5 && monthIndex <= 8; // June to September
    const rainfall = parseFloat(((isMonsoon ? 150 : 30) + random() * (isMonsoon ? 100 : 20)).toFixed(1));

    // Simulate humidity (higher during monsoon)
    const humidity = parseFloat(((isMonsoon ? 80 : 60) + (random() * 10 - 5)).toFixed(1));

    data.push({ month, temperature, rainfall, humidity });
  }
  return data;
};

type YearlyWeatherReportProps = {
    location: string;
}

export function YearlyWeatherReport({ location }: YearlyWeatherReportProps) {
  const [dataType, setDataType] = useState<'temperature' | 'rainfall' | 'humidity'>('temperature');
  const [isDownloading, setIsDownloading] = useState(false);
  const yearlyData = useMemo(() => generateMockYearlyData(location), [location]);
  const { t } = useTranslation();
  const chartRef = useRef<HTMLDivElement>(null);

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

  const handleDownload = useCallback(async () => {
    if (!chartRef.current || !location) return;
    setIsDownloading(true);
    
    try {
        const dataUrl = await toPng(chartRef.current, { 
            cacheBust: true, 
            quality: 0.95,
            // This option is crucial to fix the cross-origin font issue.
            fetchRequestInit: {
                headers: new Headers(),
                credentials: 'omit'
            }
        });
        const doc = new jsPDF();

        // Header
        doc.setFontSize(18);
        doc.setFont('helvetica', 'bold');
        doc.text(`Yearly Weather Report for ${location}`, 14, 22);
        doc.setFontSize(11);
        doc.setFont('helvetica', 'normal');
        doc.text(`Report Generated: ${new Date().toLocaleDateString()}`, 14, 30);

        // Chart Image
        doc.setFontSize(14);
        doc.text('Weather Trend Chart', 14, 45);
        doc.addImage(dataUrl, 'PNG', 14, 50, 180, 100);

        // Data Table
        const tableColumn = ["Month", "Temperature (°C)", "Rainfall (mm)", "Humidity (%)"];
        const tableRows: (string|number)[][] = [];

        yearlyData.forEach(d => {
            const row = [d.month, d.temperature, d.rainfall, d.humidity];
            tableRows.push(row);
        });

        doc.autoTable({
            startY: 160,
            head: [tableColumn],
            body: tableRows,
            theme: 'striped',
        });
        
        doc.save(`eKheti_Yearly_Weather_Report_${location}.pdf`);

    } catch (err) {
        console.error('Failed to generate PDF', err);
    } finally {
        setIsDownloading(false);
    }
  }, [location, yearlyData]);

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="space-y-1.5">
                <CardTitle>{t('weatherPage.yearlyReport.title')}{location && ` for ${location}`}</CardTitle>
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
                <Button variant="outline" size="icon" onClick={handleDownload} disabled={isDownloading}>
                    {isDownloading ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileDown className="h-4 w-4" />}
                    <span className="sr-only">Download Report</span>
                </Button>
            </div>
        </div>
      </CardHeader>
      <CardContent>
        <div ref={chartRef} className="bg-background p-4">
            <ChartContainer config={chartConfig} className="h-[300px] w-full">
                <ResponsiveContainer>
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
                </ResponsiveContainer>
            </ChartContainer>
        </div>
      </CardContent>
    </Card>
  );
}
