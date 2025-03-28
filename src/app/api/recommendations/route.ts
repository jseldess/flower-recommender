import { NextResponse } from 'next/server';
import { searchSimilarFlowers, SearchParams } from '@/utils/pinecone';

export async function POST(request: Request) {
  try {
    const searchParams: SearchParams = await request.json();
    console.log('Received search params:', searchParams);

    const hasFilters = Object.values(searchParams).some(value => value !== undefined && value !== '');
    
    if (!hasFilters) {
      console.log('Missing required search criteria');
      return NextResponse.json(
        { error: 'Please provide at least one search criteria' },
        { status: 400 }
      );
    }

    const recommendations = await searchSimilarFlowers(searchParams);
    
    if (!recommendations.length) {
      console.log('No recommendations found');
      return NextResponse.json(
        { error: 'No matching flowers found' },
        { status: 404 }
      );
    }

    return NextResponse.json(recommendations);
  } catch (error) {
    console.error('Error getting recommendations:', error);
    if (error instanceof Error) {
      console.error('Error details:', error.message);
      console.error('Error stack:', error.stack);
    }
    return NextResponse.json(
      { error: 'Failed to get recommendations' },
      { status: 500 }
    );
  }
} 