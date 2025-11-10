import { NextRequest, NextResponse } from 'next/server';
import { getMobileUsers } from '@/lib/data';

export async function GET(request: NextRequest) {
  try {
    const mobileUsers = await getMobileUsers();
    
    return NextResponse.json({
      success: true,
      data: mobileUsers,
      count: mobileUsers.length
    });
  } catch (error) {
    console.error('Error fetching mobile users:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Failed to fetch mobile users',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}