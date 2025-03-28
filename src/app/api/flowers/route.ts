import { NextResponse } from 'next/server';
import { upsertFlower } from '@/utils/pinecone';
import { FlowerData } from '@/types/flower';

export async function POST(request: Request) {
  try {
    const flower: FlowerData = await request.json();

    if (!flower.name || !flower.scientificName || !flower.climate || !flower.hardiness) {
      return NextResponse.json(
        { error: 'Missing required flower data' },
        { status: 400 }
      );
    }

    await upsertFlower(flower);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error adding flower:', error);
    return NextResponse.json(
      { error: 'Failed to add flower' },
      { status: 500 }
    );
  }
} 