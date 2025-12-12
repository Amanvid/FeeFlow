import { NextResponse } from 'next/server';
import { getTeacherLoginUsers } from '@/lib/data';

export async function GET() {
  try {
    console.log('Fetching teacher login users for testing...');
    const teachers = await getTeacherLoginUsers();
    console.log(`Found ${teachers.length} teachers`);
    
    // Return only non-sensitive data for testing
    const safeTeachers = teachers.map(t => ({
      username: t.username,
      name: t.name,
      class: t.class,
      role: t.role,
      status: t.status
    }));
    
    return NextResponse.json({ 
      success: true, 
      teachers: safeTeachers,
      count: safeTeachers.length
    });
  } catch (error) {
    console.error('Error fetching teachers:', error);
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}