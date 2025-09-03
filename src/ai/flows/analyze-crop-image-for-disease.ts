'use server';
/**
 * @fileOverview Analyzes a crop image for potential diseases.
 *
 * - analyzeCropImageForDisease - A function that handles the crop image analysis process.
 * - AnalyzeCropImageForDiseaseInput - The input type for the analyzeCropImageForDisease function.
 * - AnalyzeCropImageForDiseaseOutput - The return type for the analyzeCropImageForDisease function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AnalyzeCropImageForDiseaseInputSchema = z.object({
  photoDataUri: z
    .string()
    .describe(
      "A photo of the crop, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
  language: z.string().optional().describe("The language for the response (e.g., 'en', 'hi')."),
});
export type AnalyzeCropImageForDiseaseInput = z.infer<typeof AnalyzeCropImageForDiseaseInputSchema>;

const AnalyzeCropImageForDiseaseOutputSchema = z.object({
  diseaseDetected: z.boolean().describe('Whether a disease is detected in the crop image.'),
  diseaseName: z.string().describe('The name of the detected disease, if any.'),
  confidenceLevel: z
    .number()
    .describe('The confidence level of the disease detection (0-1).'),
  suggestedSolutions: z
    .string()
    .describe('Suggested solutions to address the detected disease.'),
});
export type AnalyzeCropImageForDiseaseOutput = z.infer<typeof AnalyzeCropImageForDiseaseOutputSchema>;

export async function analyzeCropImageForDisease(
  input: AnalyzeCropImageForDiseaseInput
): Promise<AnalyzeCropImageForDiseaseOutput> {
  return analyzeCropImageForDiseaseFlow(input);
}

const prompt = ai.definePrompt({
  name: 'analyzeCropImageForDiseasePrompt',
  input: {schema: AnalyzeCropImageForDiseaseInputSchema},
  output: {schema: AnalyzeCropImageForDiseaseOutputSchema},
  prompt: `You are an expert in plant pathology, specializing in identifying crop diseases from images.

  Analyze the provided crop image and determine if any diseases are present. Provide the disease name, a confidence level (0-1), and suggested solutions.

  {{#if language}}
  IMPORTANT: Your entire response (diseaseName and suggestedSolutions) must be in the following language: {{{language}}}.
  {{/if}}

  Image: {{media url=photoDataUri}}

  Respond in the following JSON format:
  {
    "diseaseDetected": boolean,
    "diseaseName": string,
    "confidenceLevel": number,
    "suggestedSolutions": string
  }`,
});

const analyzeCropImageForDiseaseFlow = ai.defineFlow(
  {
    name: 'analyzeCropImageForDiseaseFlow',
    inputSchema: AnalyzeCropImageForDiseaseInputSchema,
    outputSchema: AnalyzeCropImageForDiseaseOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
