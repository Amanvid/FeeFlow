import { NextRequest, NextResponse } from 'next/server';
import { getAllClaims } from '@/lib/data';

export async function GET(request: NextRequest) {
  try {
    const claims = await getAllClaims();
    
    return NextResponse.json({
      success: true,
      data: claims,
      count: claims.length
    });
  } catch (error) {
    console.error('Error fetching claims:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch claims',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}