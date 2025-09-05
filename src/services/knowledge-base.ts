/**
 * @fileOverview A service for managing and querying the RAG knowledge base.
 */
'use server';

import { Document, index, retrieve as genkitRetrieve, fromText } from 'genkit';
import { googleCloud } from '@genkit-ai/google-cloud';
import { googleAI } from '@genkit-ai/googleai';

// Sample documents for the knowledge base.
// In a real application, you would load these from files (PDF, TXT, etc.).
const CROP_DOCUMENTS = {
    'wheat-guide.txt': `
        Wheat Farming Guide:
        - Sowing Season: Rabi (October-December)
        - Soil Type: Well-drained loamy soil
        - Common Diseases: Rust, Powdery Mildew
        - Fertilizers: NPK ratio of 120:60:40 kg/ha
        - Irrigation: Critical stages are Crown Root Initiation and Flowering
    `,
    'pest-control.txt': `
        Common Pest Control for Crops:
        - Aphids: Use neem oil or insecticidal soap sprays.
        - Whiteflies: Introduce lacewing larvae or use yellow sticky traps.
        - Borers: Use pheromone traps or specific insecticides like Coragen.
    `
};

const FRUIT_DOCUMENTS = {
    'mango-guide.txt': `
        Mango Farming Guide:
        - Climate: Tropical and subtropical
        - Common Diseases: Anthracnose, Powdery Mildew
        - Pruning: Essential after harvesting to encourage new growth.
        - Common Pests: Mango hoppers, fruit flies.
        - Pollination: Cross-pollination by insects like flies and bees is crucial.
    `,
    'apple-guide.txt': `
        Apple Orchard Guide:
        - Chilling Requirement: Apples need a certain number of chill hours (below 7°C) to break dormancy.
        - Common Diseases: Apple Scab, Fire Blight. Apple Scab is a fungal disease, treat with fungicides.
        - Pollination: Most apple varieties are not self-pollinating and require a different variety nearby.
    `
};


// Define indexers for crops and fruits
const CROP_INDEX_ID = 'ekheti-crops-kb';
const FRUIT_INDEX_ID = 'ekheti-fruits-kb';

const cropIndexer = googleCloud.firestore({
    indexId: CROP_INDEX_ID,
    embedder: googleAI('text-embedding-004'),
});

const fruitIndexer = googleCloud.firestore({
    indexId: FRUIT_INDEX_ID,
    embedder: googleAI('text-embedding-004'),
});


/**
 * Initializes the knowledge base by indexing the sample documents.
 * This should be run once at startup.
 */
export async function startup() {
    console.log("Starting knowledge base indexing...");

    const cropDocs = Object.entries(CROP_DOCUMENTS).map(([fileName, content]) =>
        fromText(content, { source: fileName })
    );

    const fruitDocs = Object.entries(FRUIT_DOCUMENTS).map(([fileName, content]) =>
        fromText(content, { source: fileName })
    );

    try {
        await index({ indexer: cropIndexer, documents: cropDocs });
        console.log(`Successfully indexed ${cropDocs.length} crop documents.`);
    } catch(e) {
        console.warn("Could not index crop documents, maybe they are already indexed.", e);
    }
    
    try {
        await index({ indexer: fruitIndexer, documents: fruitDocs });
        console.log(`Successfully indexed ${fruitDocs.length} fruit documents.`);
    } catch(e) {
        console.warn("Could not index fruit documents, maybe they are already indexed.", e);
    }

    console.log("Knowledge base indexing finished.");
}

/**
 * Retrieves relevant documents from the specified knowledge base.
 * @param query The user's query.
 * @param type The type of knowledge base to query ('Crops' or 'Fruits').
 * @returns A promise that resolves to an array of relevant documents.
 */
export async function retrieve(query: string, type: 'Crops' | 'Fruits'): Promise<Document[]> {
    const indexer = type === 'Crops' ? cropIndexer : fruitIndexer;
    
    const results = await genkitRetrieve({
        retriever: indexer,
        query: query,
        options: {
            k: 3, // Retrieve top 3 most relevant chunks
        }
    });

    // Filter results by score if needed
    return results.filter(r => (r.metadata?.score || 0) >= 0.7);
}
