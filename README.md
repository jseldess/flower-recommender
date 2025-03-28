# 🌸 Flower Recommender

A garden planning tool that helps you find the perfect flowers for your garden based on climate, sun exposure, watering needs, and other growing conditions.

## Features

- 🔍 Flower search based on multiple criteria:
  - Climate zones
  - Sun exposure requirements
  - Watering needs
  - Soil type preferences
  - Blooming seasons
  - Hardiness zones
- 🎨 Color-coded flower cards based on flower descriptions
- 📊 Detailed growing information for each flower
- 🌿 Database of 75+ flowers
- 🎯 Semantic search powered by Pinecone Database
- 🤖 Integrated vector embedding using multilingual-e5-large model hosted by Pinecone

## Tech Stack

- Next.js 14 with App Router
- TypeScript
- Tailwind CSS
- Pinecone Database
- Environment: Node.js 18+

## Prerequisites

1. Node.js 18 or higher
2. A Pinecone account
3. npm or yarn package manager

## Setup

1. Clone the repository:

   ```bash
   git clone https://github.com/yourusername/flower-recommender.git
   cd flower-recommender
   ```

2. Install dependencies:

   ```bash
   npm install
   # or
   yarn install
   ```

3. Create a `.env` file in the root directory with your Pinecone credentials:

   ```env
   PINECONE_API_KEY=your_api_key_here
   PINECONE_INDEX_NAME=flower-recommender
   ```

4. Create the Pinecone index:

   ```bash
   npx ts-node scripts/create-index.ts
   ```

   This script will:
   - Check if the index already exists
   - Create a new index with integrated embedding using the multilingual-e5-large model
   - Configure automatic text embedding for flower descriptions
   - Wait for the index to be ready
   - Handle any errors during creation

   The index is configured with:
   - AWS cloud deployment in us-west-2
   - Multilingual-e5-large embedding model
   - Automatic text embedding for the 'description' field
   - Serverless architecture for automatic scaling

5. Seed the database with flower data:

   ```bash
   npx ts-node scripts/seed-flowers.ts
   ```

6. Start the development server:

   ```bash
   npm run dev
   # or
   yarn dev
   ```

7. Open [http://localhost:3000](http://localhost:3000) in your browser

## License

[MIT](https://choosealicense.com/licenses/mit/)
