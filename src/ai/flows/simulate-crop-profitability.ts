'use server';
/**
 * @fileOverview A flow to simulate crop yield and profitability.
 *
 * - simulateCropProfitability - Simulates the potential outcome of planting a crop.
 * - SimulateCropProfitabilityInput - The input type for the flow.
 * - SimulateCropProfitabilityOutput - The return type for the flow.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import { getCurrentWeather } from '@/services/weather';
import { getMarketPrices } from './get-market-prices';


// Define Tools
const getWeatherTool = ai.defineTool(
    {
        name: 'getCurrentWeather',
        description: 'Gets the current weather and a 5-day forecast for a specified location.',
        inputSchema: z.object({ location: z.string() }),
        outputSchema: z.object({
            current: z.any(),
            forecast: z.array(z.any()),
        }),
    },
    async ({ location }) => {
        const apiKey = process.env.NEXT_PUBLIC_OPENWEATHERMAP_API_KEY;
        if (!apiKey) throw new Error("Weather API key not configured.");
        const current = await getCurrentWeather(location, apiKey);
        // Note: For a more advanced simulation, we'd use a proper forecast tool.
        // For this prototype, current weather is sufficient to demonstrate tool use.
        return { current, forecast: [] };
    }
);


const getMarketPricesTool = ai.defineTool(
    {
        name: 'getMarketPrices',
        description: 'Gets the latest market prices for a specific crop in a given state.',
        inputSchema: z.object({
            location: z.string().describe("The state to search for prices in."),
            crop: z.string().describe("The crop to get prices for."),
        }),
        outputSchema: z.any(),
    },
    async (input) => {
        return await getMarketPrices(input);
    }
);


// Define Input and Output Schemas for the Flow
const SimulateCropProfitabilityInputSchema = z.object({
    landSizeInAcres: z.number(),
    cropName: z.string(),
    inputCosts: z.number(),
    location: z.string().describe("The farmer's location (e.g., city, state)."),
});
export type SimulateCropProfitabilityInput = z.infer<typeof SimulateCropProfitabilityInputSchema>;

const SimulateCropProfitabilityOutputSchema = z.object({
    expectedYieldPerAcre: z.number().describe('Expected yield in kilograms per acre.'),
    estimatedSellingPricePerKg: z.number().describe('Estimated selling price in rupees per kilogram.'),
    totalRevenue: z.number().describe('Calculated as (Yield * Price * Land Size).'),
    netProfit: z.number().describe('Calculated as (Total Revenue - Input Costs).'),
    profitabilityIndicator: z.enum(['High', 'Medium', 'Low']).describe('An indicator of profitability.'),
    recommendation: z.string().describe('A concise recommendation and summary of the simulation.'),
    bestCropChoice: z.string().describe('The crop with the highest simulated profit.'),
    alternativeCropSuggestion: z.string().optional().describe('An alternative crop suggestion if risks are high.')
});
export type SimulateCropProfitabilityOutput = z.infer<typeof SimulateCropProfitabilityOutputSchema>;

export async function simulateCropProfitability(
    input: SimulateCropProfitabilityInput
): Promise<SimulateCropProfitabilityOutput> {
    return simulateCropProfitabilityFlow(input);
}


// Define the Prompt
const prompt = ai.definePrompt({
    name: 'simulateCropProfitabilityPrompt',
    input: { schema: SimulateCropProfitabilityInputSchema },
    output: { schema: SimulateCropProfitabilityOutputSchema },
    tools: [getWeatherTool, getMarketPricesTool],
    prompt: `You are an expert agricultural economist. Your task is to simulate the profitability of a chosen crop based on user inputs and real-world data obtained from your tools.

    **User Inputs:**
    - Crop to Simulate: {{{cropName}}}
    - Land Size: {{{landSizeInAcres}}} acres
    - Total Input Costs: ₹{{{inputCosts}}}
    - Location: {{{location}}}

    **Your Task:**
    1.  **Analyze Data**: Use the \`getCurrentWeather\` and \`getMarketPrices\` tools to gather real-time data for the user's location and crop.
    2.  **Estimate Yield**: Based on the crop type, typical agricultural data, and weather conditions, estimate the 'expectedYieldPerAcre' in kilograms.
    3.  **Estimate Price**: From the market data, determine a realistic 'estimatedSellingPricePerKg'. If you have multiple market prices, use the average of the modal prices. If no prices are found, use a realistic national average for that crop in India.
    4.  **Calculate Financials**:
        - Calculate 'totalRevenue' = (Yield per Acre * Price per Kg * Land Size).
        - Calculate 'netProfit' = (Total Revenue - Input Costs).
    5.  **Assess Profitability**:
        - Set 'profitabilityIndicator' to 'High' if Net Profit > 50% of Input Costs.
        - Set 'profitabilityIndicator' to 'Medium' if Net Profit is between 10% and 50% of Input Costs.
        - Set 'profitabilityIndicator' to 'Low' if Net Profit < 10% of Input Costs.
    6.  **Provide Recommendations**:
        - Write a concise summary in the 'recommendation' field. Explain the key factors (yield, price) that led to the result.
        - Set the 'bestCropChoice' field to the name of the simulated crop, as this is the only one you are evaluating.
        - If profitability is 'Low', suggest a more suitable crop for the region in the 'alternativeCropSuggestion' field.

    IMPORTANT: Your final output MUST be in the specified JSON format only. Do not include any other text, greetings, or explanations before or after the JSON object.
    `,
});


// Define the Flow
const simulateCropProfitabilityFlow = ai.defineFlow(
    {
        name: 'simulateCropProfitabilityFlow',
        inputSchema: SimulateCropProfitabilityInputSchema,
        outputSchema: SimulateCropProfitabilityOutputSchema,
    },
    async (input) => {
        const { output } = await prompt(input);
        if (!output) {
            throw new Error("The model failed to generate a simulation result.");
        }
        return output;
    }
);
