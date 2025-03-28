import 'dotenv/config';
import { Pinecone } from '@pinecone-database/pinecone';
import { FlowerData } from '../src/types/flower';

interface PineconeRecord {
  _id: string;
  fields: {
    name: string;
    scientificName: string;
    climate: string;
    sunExposure: string;
    wateringNeeds: string;
    soilType: string;
    bloomingSeason: string;
    hardiness: string;
    description: string;
    imageUrl?: string;
  };
}

const pinecone = new Pinecone({
  apiKey: process.env.PINECONE_API_KEY!,
});

const index = pinecone.index(process.env.PINECONE_INDEX_NAME!);
const NAMESPACE = 'flowers';

async function listAllFlowers() {
  console.log('Fetching all flowers from the index...');
  
  try {
    // Use a query that matches all records
    const response = await index.namespace(NAMESPACE).searchRecords({
      query: {
        topK: 100,
        inputs: { text: "all flowers" }
      },
      fields: ['name', 'scientificName', 'climate', 'sunExposure', 'wateringNeeds', 
               'soilType', 'bloomingSeason', 'hardiness', 'description', 'imageUrl']
    });
    
    if (!response.result?.hits) {
      console.log('No records found');
      return;
    }

    console.log(`Found ${response.result.hits.length} flowers:`);
    response.result.hits.forEach((record, index) => {
      console.log(`\n${index + 1}. ID: ${record._id}`);
      console.log('Fields:', JSON.stringify(record.fields, null, 2));
    });

  } catch (error) {
    console.error('Error fetching flowers:', error);
    if (error instanceof Error) {
      console.error('Error details:', error.message);
      console.error('Error stack:', error.stack);
    }
  }
}

listAllFlowers().catch(console.error); 