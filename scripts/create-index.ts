import { Pinecone } from '@pinecone-database/pinecone';
import dotenv from 'dotenv';

dotenv.config();

const apiKey = process.env.PINECONE_API_KEY;
const indexName = process.env.PINECONE_INDEX_NAME;

if (!apiKey) {
  console.error('Error: PINECONE_API_KEY is not set in .env file');
  process.exit(1);
}

if (!indexName) {
  console.error('Error: PINECONE_INDEX_NAME is not set in .env file');
  process.exit(1);
}

// After validation, we can safely assert these are strings
const validatedApiKey: string = apiKey;
const validatedIndexName: string = indexName;

async function createIndex() {
  console.log('Creating Pinecone index...');
  
  try {
    const pinecone = new Pinecone({
      apiKey: validatedApiKey,
    });

    // Check if index already exists
    const indexes = await pinecone.listIndexes();
    const existingIndex = indexes.indexes?.find(index => index.name === validatedIndexName);

    if (existingIndex) {
      console.log(`Index "${validatedIndexName}" already exists.`);
      console.log('Index details:', existingIndex);
      return;
    }

    // Create the index with integrated embedding
    await pinecone.createIndexForModel({
      name: validatedIndexName,
      cloud: 'aws',
      region: 'us-west-2',
      embed: {
        model: 'multilingual-e5-large',
        fieldMap: { text: 'description' },
      },
      waitUntilReady: true
    });

    console.log(`Successfully created index "${validatedIndexName}" with integrated embedding`);
    console.log('Index is ready to use!');

  } catch (error) {
    console.error('Error creating index:', error instanceof Error ? error.message : String(error));
    process.exit(1);
  }
}

createIndex().catch(console.error); 