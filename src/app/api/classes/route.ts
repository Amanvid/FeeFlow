import { NextRequest, NextResponse } from 'next/server';
import { getClasses } from '@/lib/data';

export async function GET(request: NextRequest) {
  try {
    const classes = await getClasses();
    return NextResponse.json({ success: true, classes });
  } catch (error) {
    console.error('Error fetching classes:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error', classes: [] },
      { status: 500 }
    );
  }
}

