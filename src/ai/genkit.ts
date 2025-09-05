import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/googleai';
import {googleCloud} from '@genkit-ai/google-cloud';


export const ai = genkit({
  plugins: [
    googleAI(),
    googleCloud,
  ],
  model: 'googleai/gemini-2.5-flash',
  embedder: 'googleai/text-embedding-004',
});
