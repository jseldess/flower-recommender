import 'dotenv/config';
import { Pinecone } from '@pinecone-database/pinecone';
import axios from 'axios';

const pinecone = new Pinecone({
  apiKey: process.env.PINECONE_API_KEY!,
});

const index = pinecone.index(process.env.PINECONE_INDEX_NAME!);
const NAMESPACE = 'flowers';

async function checkImageUrl(url: string): Promise<boolean> {
  try {
    const response = await axios.head(url);
    const contentType = response.headers['content-type'];
    return response.status === 200 && contentType?.startsWith('image/') || false;
  } catch {
    return false;
  }
}

async function verifyImages() {
  console.log('Starting image verification...');
  
  try {
    // Get all records from the database
    const query = {
      query: {
        topK: 100,
        inputs: { text: "all flowers" },
        filter: {}
      },
      fields: ['name', 'imageUrl']
    };
    
    const results = await index.namespace(NAMESPACE).searchRecords(query);
    
    if (!results.result?.hits) {
      console.log('No records found');
      return;
    }

    const problemImages: { id: string; name: string; url: string }[] = [];
    
    // Check each image URL
    for (const hit of results.result.hits) {
      const fields = hit.fields as { name: string; imageUrl?: string };
      const imageUrl = fields.imageUrl;
      const name = fields.name;
      
      if (!imageUrl) {
        problemImages.push({ id: hit._id, name, url: 'Missing URL' });
        continue;
      }

      console.log(`Checking image for ${name}...`);
      const isValid = await checkImageUrl(imageUrl);
      if (!isValid) {
        console.log(`✗ Invalid image for ${name}`);
        problemImages.push({ id: hit._id, name, url: imageUrl });
      } else {
        console.log(`✓ Valid image for ${name}`);
      }
    }

    // Report problems
    if (problemImages.length > 0) {
      console.log('\nProblematic images found:');
      problemImages.forEach(({ id, name, url }) => {
        console.log(`\n${name} (${id}):`);
        console.log(`Current URL: ${url}`);
      });
    } else {
      console.log('\nAll images are valid!');
    }
  } catch (error) {
    console.error('Error verifying images:', error);
  }
}

// Run the verification
verifyImages().catch(console.error); 