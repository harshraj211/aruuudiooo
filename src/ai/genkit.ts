import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/googleai';
import {googleCloud} from '@genkit-ai/google-cloud';
import firebase from '@genkit-ai/firebase';


export const ai = genkit({
  plugins: [
    googleAI(),
    googleCloud(),
    firebase(),
  ],
  model: 'googleai/gemini-2.5-flash',
  embedder: 'googleai/text-embedding-004',
});
