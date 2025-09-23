
'use server';
/**
 * @fileOverview Fetches market prices for crops.
 *
 * - getMarketPrices - A function that fetches market prices for a given location and crop.
 * - GetMarketPricesInput - The input type for the getMarketPrices function.
 * - GetMarketPricesOutput - The return type for the getMarketprices function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GetMarketPricesInputSchema = z.object({
  location: z.string().describe('The location (e.g., state or district) to fetch market prices for.'),
  crop: z.string().describe('The specific crop to fetch prices for.'),
});
export type GetMarketPricesInput = z.infer<typeof GetMarketPricesInputSchema>;

const MarketPriceSchema = z.object({
    cropName: z.string().describe('The name of the crop.'),
    variety: z.string().describe('The variety of the crop.'),
    market: z.string().describe('The name of the market (mandi).'),
    minPrice: z.number().describe('The minimum price per quintal.'),
    maxPrice: z.number().describe('The maximum price per quintal.'),
    modalPrice: z.number().describe('The most common price per quintal.'),
    arrivalDate: z.string().describe('The date of price recording.'),
});

const GetMarketPricesOutputSchema = z.object({
  prices: z.array(MarketPriceSchema).describe('A list of market prices for the specified crop and location.'),
});
export type GetMarketPricesOutput = z.infer<typeof GetMarketPricesOutputSchema>;

export async function getMarketPrices(input: GetMarketPricesInput): Promise<GetMarketPricesOutput> {
  return getMarketPricesFlow(input);
}

const getMarketPricesFlow = ai.defineFlow(
  {
    name: 'getMarketPricesFlow',
    inputSchema: GetMarketPricesInputSchema,
    outputSchema: GetMarketPricesOutputSchema,
  },
  async (input) => {
    // The previous data.gov.in endpoint is deprecated. Using a community-maintained fork.
    const url = new URL("https://api.data.gov.in/resource/9ef84268-d588-465a-a308-a864a43d0070");
    
    url.searchParams.append('api-key', '579b464db66ec23bdd000001c778e3be6290459551881dcc39f66586');
    url.searchParams.append('format', 'json');
    url.searchParams.append('limit', '500'); // Get a decent number of records
    url.searchParams.append('offset', '0');

    let filters: Record<string, string> = {};
    if (input.location) {
        // The API is inconsistent, sometimes it needs state, sometimes district.
        // Let's try to be flexible.
        filters['state'] = input.location;
    }
    if (input.crop && input.crop.toLowerCase() !== 'all') {
        filters['commodity'] = input.crop;
    }
    
    url.searchParams.set('filters', JSON.stringify(filters));

    try {
        const response = await fetch(url.toString());
        
        if (!response.ok) {
            const errorText = await response.text();
            console.error('Data.gov.in API request failed:', response.status, errorText);
            throw new Error(`API request failed with status ${response.status}: ${errorText}`);
        }
        
        const data = await response.json();

        if (!data.records) {
            console.warn("No records found in API response for filters:", filters, data);
            return { prices: [] };
        }

        const prices: z.infer<typeof MarketPriceSchema>[] = data.records.map((record: any) => ({
            cropName: record.commodity,
            variety: record.variety,
            market: record.market,
            minPrice: Number(record.min_price),
            maxPrice: Number(record.max_price),
            modalPrice: Number(record.modal_price),
            arrivalDate: record.arrival_date,
        })).filter((p: { modalPrice: number; }) => !isNaN(p.modalPrice) && p.modalPrice > 0); // Filter out invalid entries

        return { prices };

    } catch (error) {
        console.error("Error fetching or parsing market prices:", error);
        throw new Error("Failed to fetch market prices from the API.");
    }
  }
);
