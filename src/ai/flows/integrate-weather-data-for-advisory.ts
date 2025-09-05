
'use server';

/**
 * @fileOverview Integrates weather data into the advisory for farmers.
 *
 * - integrateWeatherDataForAdvisory - A function that integrates weather data into the advisory process.
 * - IntegrateWeatherDataForAdvisoryInput - The input type for the integrateWeatherDataForAdvisory function.
 * - IntegrateWeatherDataForAdvisoryOutput - The return type for the integrateWeatherDataForAdvisory function.
 */

import {ai} from '@/ai/genkit';
import { getForecast } from '@/services/weather';
import {z} from 'genkit';

const IntegrateWeatherDataForAdvisoryInputSchema = z.object({
  cropType: z.string().describe('The type of crop.'),
  soilDetails: z.string().describe('Details about the soil.'),
  currentStageOfCrop: z.string().describe('The current stage of the crop.'),
  location: z.string().describe('The location of the farm.'),
  advisory: z.string().describe('The base advisory before weather integration.'),
  language: z.string().optional().describe("The language for the response (e.g., 'en', 'hi')."),
});
export type IntegrateWeatherDataForAdvisoryInput = z.infer<typeof IntegrateWeatherDataForAdvisoryInputSchema>;

const WeatherDataSchema = z.object({
  temperature: z.number().describe('The current temperature in Celsius.'),
  condition: z.string().describe('The current weather condition (e.g., sunny, rainy).'),
  humidity: z.number().describe('The current humidity percentage.'),
  windSpeed: z.number().describe('The current wind speed in km/h'),
});

const IntegrateWeatherDataForAdvisoryOutputSchema = z.object({
  integratedAdvisory: z.string().describe('The advisory integrated with weather data.'),
  weather: WeatherDataSchema.optional().describe('The weather data used for the advisory.'),
});
export type IntegrateWeatherDataForAdvisoryOutput = z.infer<typeof IntegrateWeatherDataForAdvisoryOutputSchema>;

export async function integrateWeatherDataForAdvisory(input: IntegrateWeatherDataForAdvisoryInput): Promise<IntegrateWeatherDataForAdvisoryOutput> {
  return integrateWeatherDataForAdvisoryFlow(input);
}


const PromptInputSchema = IntegrateWeatherDataForAdvisoryInputSchema.extend({
    weather: WeatherDataSchema.optional(),
});


const prompt = ai.definePrompt({
  name: 'integrateWeatherDataForAdvisoryPrompt',
  input: {schema: PromptInputSchema},
  output: {schema: z.object({ integratedAdvisory: z.string() }) },
  prompt: `You are an expert agricultural advisor. You are provided with a base advisory, crop information, and current weather data. Your task is to integrate the weather data into the advisory to provide more specific and relevant recommendations.

Base Advisory: {{{advisory}}}
Crop Type: {{{cropType}}}
Soil Details: {{{soilDetails}}}
Current Stage: {{{currentStageOfCrop}}}

Location: {{{location}}}

{{#if language}}
IMPORTANT: Your entire response must be in the following language: {{{language}}}.
{{/if}}

{{#if weather}}
Current Weather Conditions:
- Temperature: {{weather.temperature}}°C
- Condition: {{weather.condition}}
- Humidity: {{weather.humidity}}%
- Wind Speed: {{weather.windSpeed}} km/h

Based on all this information, provide an integrated advisory that takes into account the current weather conditions.
{{else}}
Could not retrieve weather data. Please provide a general advisory based on the crop and soil information.
{{/if}}
`,
});

const integrateWeatherDataForAdvisoryFlow = ai.defineFlow(
  {
    name: 'integrateWeatherDataForAdvisoryFlow',
    inputSchema: IntegrateWeatherDataForAdvisoryInputSchema,
    outputSchema: IntegrateWeatherDataForAdvisoryOutputSchema,
  },
  async input => {
    let weatherData;
    const apiKey = process.env.OPENWEATHERMAP_API_KEY;
    
    if (apiKey) {
        try {
            weatherData = await getForecast(input.location, apiKey);
        } catch (e) {
            console.error("Failed to fetch weather in flow:", e);
            // We can continue without weather data, the prompt is designed to handle this.
        }
    } else {
        console.warn("OPENWEATHERMAP_API_KEY is not configured. Skipping weather fetch.");
    }
    
    const { output } = await prompt({ ...input, weather: weatherData });

    if (!output) {
      throw new Error("Failed to generate advisory from the model.");
    }

    return {
        integratedAdvisory: output.integratedAdvisory,
        weather: weatherData,
    };
  }
);
