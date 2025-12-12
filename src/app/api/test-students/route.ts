import { NextResponse } from 'next/server';
import { getStudentsByClass } from '@/lib/data';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const className = searchParams.get('className') || 'Creche';
  
  try {
    console.log(`Test API: Fetching students for class "${className}"`);
    const students = await getStudentsByClass(className);
    console.log(`Test API: Found ${students.length} students`);
    
    return NextResponse.json({ 
      success: true, 
      students,
      className,
      count: students.length
    });
  } catch (error) {
    console.error('Test API: Error fetching students:', error);
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error',
      className
    }, { status: 500 });
  }
}