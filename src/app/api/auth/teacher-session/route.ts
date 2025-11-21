import { NextResponse } from 'next/server';
import { verifySession } from '@/lib/session';

export async function GET() {
  try {
    const session = await verifySession();
    
    if (!session || session.userType !== 'teacher') {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }

    return NextResponse.json({ 
      success: true,
      teacher: {
        username: session.username,
        name: session.name,
        class: session.class,
        role: session.role
      }
    });
  } catch (error) {
    console.error('Teacher session verification error:', error);
    return NextResponse.json(
      { success: false, message: 'An internal server error occurred' },
      { status: 500 }
    );
  }
}