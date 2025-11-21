import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST() {
  try {
    const cookieStore = await cookies();
    
    // Clear the session cookie
    cookieStore.delete('session');
    
    return NextResponse.json({ 
      success: true, 
      message: 'Teacher logged out successfully' 
    });
  } catch (error) {
    console.error('Teacher logout API error:', error);
    return NextResponse.json(
      { success: false, message: 'An internal server error occurred' },
      { status: 500 }
    );
  }
}