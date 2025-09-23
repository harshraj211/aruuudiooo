'use server';
/**
 * @fileOverview Fetches market prices for crops.
 *
 * - getMarketPrices - A function that fetches market prices for a given location and crop.
 * - GetMarketPricesInput - The input type for the getMarketPrices function.
 * - GetMarketPricesOutput - The return type for the getMarketPrices function.
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
    const url = new URL("https://api.agmarknet.nic.in/v1/arrivals/search");

    let filters: Record<string, string> = {};
    if (input.location) {
        // The new API uses 'stateName'
        filters['stateName'] = input.location;
    }
    if (input.crop && input.crop.toLowerCase() !== 'all') {
        // The new API uses 'commodityName'
        filters['commodityName'] = input.crop;
    }

    // Append filters as search parameters
    Object.entries(filters).forEach(([key, value]) => {
        url.searchParams.append(key, value);
    })

    try {
        const response = await fetch(url.toString(), {
            headers: {
                'Accept': 'application/json',
                'User-Agent': 'AgriVisionApp/1.0', // Some APIs require a user agent
            }
        });
        if (!response.ok) {
            const errorText = await response.text();
            console.error('Agmarknet API request failed:', response.status, errorText);
            throw new Error(`API request failed with status ${response.status}: ${errorText}`);
        }
        const data = await response.json();

        if (!data.results) {
            console.warn("No records found in API response", data);
            return { prices: [] };
        }

        const prices: z.infer<typeof MarketPriceSchema>[] = data.results.map((record: any) => ({
            cropName: record.commodityName,
            variety: record.variety,
            market: record.marketName,
            minPrice: Number(record.minPrice),
            maxPrice: Number(record.maxPrice),
            modalPrice: Number(record.modalPrice),
            arrivalDate: record.arrivalDate,
        })).filter((p: { modalPrice: number; }) => !isNaN(p.modalPrice) && p.modalPrice > 0); // Filter out invalid entries

        return { prices };

    } catch (error) {
        console.error("Error fetching or parsing market prices:", error);
        throw new Error("Failed to fetch market prices from the API.");
    }
  }
);
