import { NextResponse } from 'next/server';
import { getTeacherLoginUsers } from '@/lib/data';

export async function GET() {
  try {
    console.log('Fetching teacher login users for debugging...');
    const teachers = await getTeacherLoginUsers();
    console.log(`Found ${teachers.length} teachers`);
    
    // Return debug info to help understand the data structure
    const debugInfo = teachers.map((t, index) => ({
      index,
      username: t.username,
      usernameLength: t.username.length,
      name: t.name,
      class: t.class,
      role: t.role,
      status: t.status,
      passwordLength: t.password?.length || 0,
      passwordFirstChar: t.password?.substring(0, 1) || '',
      passwordLastChar: t.password?.substring(t.password.length - 1) || ''
    }));
    
    return NextResponse.json({ 
      success: true, 
      debugInfo,
      count: debugInfo.length
    });
  } catch (error) {
    console.error('Error fetching teachers:', error);
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
