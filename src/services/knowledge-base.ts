
'use server';

/**
 * @fileoverview Manages the knowledge base for the eKheti application using Genkit.
 * This file sets up Firestore-based indexers and retrievers for different farming contexts
 * and provides functions to query the knowledge base.
 */

import { Document, index, retrieve as genkitRetrieve } from 'genkit';
import { googleCloud } from '@genkit-ai/google-cloud';
import { googleAI } from '@genkit-ai/googleai';

// Sample documents for the knowledge base. In a real application, these would come from a database or CMS.
const CROP_DOCUMENTS = [
    Document.fromText("Wheat requires well-drained loamy soil and temperatures between 15-25°C. Common diseases include rust and powdery mildew. Use certified seeds and balanced fertilizers for best results."),
    Document.fromText("Rice cultivation needs flooded conditions and high humidity. Pests like stem borer and diseases like blast are major concerns. Integrated Pest Management (IPM) is highly recommended."),
    Document.fromText("Potato is a tuber crop that prefers sandy loam soil. Late blight is a devastating disease; ensure proper ventilation and use fungicides preventively. Harvest when the vines turn yellow."),
    Document.fromText("Sugarcane is a cash crop that requires a lot of water. Red rot is a major disease. It's a long-duration crop, taking about 10-18 months to mature."),
];

const FRUIT_DOCUMENTS = [
    Document.fromText("Mango trees need well-drained soil and a distinct dry season to flower. Anthracnose and powdery mildew are common diseases affecting mangoes. Pruning after harvest is essential for good yield."),
    Document.fromText("Banana plants are heavy feeders and require rich, well-drained soil with regular irrigation. Panama disease and Sigatoka leaf spot are major threats. Tissue culture plantlets are recommended for disease-free start."),
    Document.fromText("Apple orchards thrive in cold climates with a chilling period. Scab and fire blight are serious diseases. Proper rootstock selection is crucial for adapting to local soil conditions."),
    Document.fromText("Grapes grow best in sunny, dry climates. Downy mildew and powdery mildew can significantly reduce yield. Training the vines on a trellis system is important for fruit quality."),
];


// Define indexer and retriever for Crops
const CROP_INDEX_ID = 'ekheti-crops-kb';
const cropIndexer = googleCloud().firestore({
    indexId: CROP_INDEX_ID,
    embedder: googleAI('text-embedding-004'),
});
const cropRetriever = cropIndexer;


// Define indexer and retriever for Fruits
const FRUIT_INDEX_ID = 'ekheti-fruits-kb';
const fruitIndexer = googleCloud().firestore({
    indexId: FRUIT_INDEX_ID,
    embedder: googleAI('text-embedding-004'),
});
const fruitRetriever = fruitIndexer;


/**
 * Populates the knowledge base if it's empty. This should be run on server startup.
 */
export async function startup() {
  console.log("Checking and populating knowledge base...");
  await index({ indexer: cropIndexer, documents: CROP_DOCUMENTS, options: { where: "docId NOT IN ('indexed')" } });
  await index({ indexer: fruitIndexer, documents: FRUIT_DOCUMENTS, options: { where: "docId NOT IN ('indexed')" } });
  console.log("Knowledge base is ready.");
}

/**
 * Retrieves relevant documents from the knowledge base based on the management type.
 * @param {object} input - The input object.
 * @param {string} input.query - The user's query.
 * @param {'Crops' | 'Fruits'} input.managementType - The type of management context.
 * @returns {Promise<Document[]>} A promise that resolves to an array of relevant documents.
 */
export async function retrieve({ query, managementType }: { query: string; managementType: 'Crops' | 'Fruits' }) {
  const retriever = managementType === 'Crops' ? cropRetriever : fruitRetriever;
  const documents = await genkitRetrieve({
    retriever,
    query,
    options: {
      k: 3, // Retrieve the top 3 most relevant documents
    },
  });
  return documents;
}
