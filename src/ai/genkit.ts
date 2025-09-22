
import {genkit} from 'genkit';
import {googleAI} from '@gen-kit-ai/googleai';
import { config } from 'dotenv';

config({ path: '.env' });

export const ai = genkit({
  plugins: [googleAI({apiKey: process.env.GEMINI_API_KEY})],
  model: 'googleai/gemini-1.5-flash',
  embedder: 'googleai/text-embedding-004',
});
