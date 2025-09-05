
'use server';

/**
 * @fileOverview A service for managing and querying the RAG knowledge bases.
 */

import { Document, index, retrieve as genkitRetrieve, fromText } from 'genkit';
import { googleCloud } from '@genkit-ai/google-cloud';
import { googleAI } from '@genkit-ai/googleai';

// Sample documents for the knowledge base.
// In a real application, these would come from a CMS, database, or file uploads.
const CROP_DOCUMENTS = {
  "wheat-guide.txt": "Wheat requires well-drained loamy soil. Optimal temperature for growth is between 15-25°C. Key nutrients are Nitrogen, Phosphorus, and Potassium. Common diseases include Rust and Powdery Mildew. Rust appears as orange pustules on leaves.",
  "rice-faq.txt": "Rice is typically grown in flooded paddies. It is a staple food for a large part of the world's population. It is best to transplant seedlings when they are 25-30 days old. Common pests include stem borer and leafhopper.",
  "fertilizer-info.txt": "Urea is a common nitrogen fertilizer. DAP (Diammonium Phosphate) provides both Nitrogen and Phosphorus. It is crucial to apply fertilizers based on soil test results to avoid overuse and environmental damage.",
};

const FRUIT_DOCUMENTS = {
    "mango-guide.txt": "Mango trees thrive in tropical and subtropical climates. They need deep, well-drained soil. Pruning should be done after the fruiting season to encourage new growth. Common pests include mealybugs and fruit flies. Anthracnose is a major fungal disease.",
    "apple-care.txt": "Apple trees require a period of cold dormancy to produce fruit. They are susceptible to Apple Scab, which appears as dark, scabby spots on leaves and fruit. Regular spraying with fungicides may be necessary. Pollination from a different apple variety is often required.",
    "citrus-faq.txt": "Citrus trees need plenty of sunlight and protection from frost. Citrus greening is a devastating bacterial disease with no cure. Regular monitoring for the Asian citrus psyllid, the vector of the disease, is critical. Fertilize with a balanced citrus-specific fertilizer.",
};


const CROP_INDEX_ID = 'ekheti-crops-kb';
const FRUIT_INDEX_ID = 'ekheti-fruits-kb';

const cropIndexer = googleCloud().firestore({
    indexId: CROP_INDEX_ID,
    embedder: googleAI('text-embedding-004'),
});
const fruitIndexer = googleCloud().firestore({
    indexId: FRUIT_INDEX_ID,
    embedder: googleAI('text-embedding-004'),
});

const cropRetriever = cropIndexer;
const fruitRetriever = fruitIndexer;

/**
 * Indexes the sample documents into their respective Firestore vector stores.
 * This should be run once during application startup.
 */
export async function startup() {
    console.log('Starting knowledge base indexing...');

    // Check if documents are already indexed to avoid re-indexing on every server restart
    const cropCheck = await cropRetriever.retrieve('wheat');
    if (cropCheck.length === 0) {
        console.log("Indexing Crop Documents...");
        const cropDocs = Object.entries(CROP_DOCUMENTS).map(([filename, content]) =>
            fromText(content, { title: filename })
        );
        await index({ indexer: cropIndexer, documents: cropDocs });
        console.log("Crop documents indexed.");
    } else {
        console.log("Crop documents already indexed.");
    }

    const fruitCheck = await fruitRetriever.retrieve('mango');
    if (fruitCheck.length === 0) {
        console.log("Indexing Fruit Documents...");
        const fruitDocs = Object.entries(FRUIT_DOCUMENTS).map(([filename, content]) =>
            fromText(content, { title: filename })
        );
        await index({ indexer: fruitIndexer, documents: fruitDocs });
        console.log("Fruit documents indexed.");
    } else {
        console.log("Fruit documents already indexed.");
    }
}

/**
 * Retrieves relevant document chunks from the specified knowledge base.
 * @param {object} input - The input object.
 * @param {string} input.query - The user's query.
 * @param {'Crops' | 'Fruits'} input.knowledgeBase - The knowledge base to query.
 * @returns {Promise<Document[]>} A promise that resolves to an array of relevant documents.
 */
export async function retrieve({ query, knowledgeBase }: { query: string; knowledgeBase: 'Crops' | 'Fruits' }): Promise<Document[]> {
    console.log(`Retrieving from ${knowledgeBase} knowledge base for query: ${query}`);
    const retriever = knowledgeBase === 'Crops' ? cropRetriever : fruitRetriever;
    return await genkitRetrieve({ retriever, query, options: { k: 3 } });
}
