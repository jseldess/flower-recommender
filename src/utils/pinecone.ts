import { Pinecone } from '@pinecone-database/pinecone';
import { FlowerData } from '../types/flower';

export interface GeoLocation {
  climate: string;
  latitude: number;
  longitude: number;
}

console.log('Environment variables:', {
  apiKey: process.env.PINECONE_API_KEY?.slice(0, 10) + '...',
  indexName: process.env.PINECONE_INDEX_NAME
});

const pinecone = new Pinecone({
  apiKey: process.env.PINECONE_API_KEY!,
  maxRetries: 5,
});

const index = pinecone.index(process.env.PINECONE_INDEX_NAME!);
const NAMESPACE = 'flowers';

interface FlowerFields {
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
}

export async function upsertFlower(flower: FlowerData) {
  const description = `${flower.name} (${flower.scientificName}) is a ${flower.description}. 
    It grows best in ${flower.climate.join(', ')} climates with ${flower.sunExposure} sun exposure. 
    It needs ${flower.wateringNeeds} watering and ${flower.soilType} soil. 
    It blooms in ${flower.bloomingSeason.join(', ')} and is hardy to ${flower.hardiness}.`;

  await index.namespace(NAMESPACE).upsertRecords([{
    id: flower.id,
    name: flower.name,
    scientificName: flower.scientificName,
    climate: flower.climate.join(','),
    sunExposure: flower.sunExposure,
    wateringNeeds: flower.wateringNeeds,
    soilType: flower.soilType,
    bloomingSeason: flower.bloomingSeason.join(','),
    hardiness: flower.hardiness,
    description: flower.description,
    imageUrl: flower.imageUrl || '',
    chunk_text: description
  }]);
}

export interface SearchParams {
  climate?: string;
  sunExposure?: string;
  wateringNeeds?: string;
  soilType?: string;
  bloomingSeason?: string;
  hardiness?: string;
  searchQuery?: string;
  limit?: number;
}

export async function searchSimilarFlowers({ 
  climate, 
  sunExposure, 
  wateringNeeds, 
  soilType, 
  bloomingSeason, 
  hardiness,
  searchQuery, 
  limit = 10
}: SearchParams) {
  console.log('Starting search with params:', { 
    climate, 
    sunExposure, 
    wateringNeeds, 
    soilType, 
    bloomingSeason, 
    hardiness,
    searchQuery, 
    limit 
  });
  
  try {
    // Create filter conditions for each provided parameter
    const filterConditions = [];
    
    if (climate) filterConditions.push({ climate: { $eq: climate } });
    if (sunExposure) filterConditions.push({ sunExposure: { $eq: sunExposure } });
    if (wateringNeeds) filterConditions.push({ wateringNeeds: { $eq: wateringNeeds } });
    if (soilType) filterConditions.push({ soilType: { $eq: soilType } });
    if (bloomingSeason) filterConditions.push({ bloomingSeason: { $eq: bloomingSeason } });
    if (hardiness) filterConditions.push({ hardiness: { $eq: hardiness } });
    
    // Create search description from search query or use a default
    const description = searchQuery || 'flowers and plants';
    
    const searchRequest = {
      query: {
        topK: limit,
        inputs: { text: description },
        filter: filterConditions.length > 0 ? { $and: filterConditions } : undefined
      },
      fields: ['name', 'scientificName', 'climate', 'sunExposure', 'wateringNeeds', 
               'soilType', 'bloomingSeason', 'hardiness', 'description', 'imageUrl']
    };

    console.log('Search request:', JSON.stringify(searchRequest, null, 2));
    
    const results = await index.namespace(NAMESPACE).searchRecords(searchRequest);

    console.log('Raw Pinecone response:', JSON.stringify(results, null, 2));

    if (!results.result?.hits) {
      console.log('No hits found in search results');
      return [];
    }

    const flowers = results.result.hits.map(hit => {
      const fields = hit.fields as FlowerFields;
      if (!fields) {
        console.log('Missing fields for hit:', hit._id);
        return null;
      }
      
      try {
        const flower: FlowerData = {
          id: hit._id,
          name: fields.name,
          scientificName: fields.scientificName,
          climate: typeof fields.climate === 'string' ? fields.climate.split(',') : [fields.climate],
          sunExposure: fields.sunExposure,
          wateringNeeds: fields.wateringNeeds,
          soilType: fields.soilType,
          bloomingSeason: typeof fields.bloomingSeason === 'string' ? fields.bloomingSeason.split(',') : [fields.bloomingSeason],
          hardiness: fields.hardiness,
          description: fields.description,
          imageUrl: fields.imageUrl || undefined
        };

        return flower;
      } catch (err) {
        console.error('Error processing hit:', hit._id, err);
        return null;
      }
    }).filter((flower): flower is FlowerData => flower !== null);

    console.log('Processed flowers:', flowers);
    return flowers;
  } catch (error) {
    console.error('Error in searchSimilarFlowers:', error);
    if (error instanceof Error) {
      console.error('Error details:', error.message);
      console.error('Error stack:', error.stack);
    }
    throw error;
  }
} 