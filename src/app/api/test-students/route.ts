import { NextRequest, NextResponse } from 'next/server';
import { getAllStudents } from '@/lib/data';

export async function GET(request: NextRequest) {
  try {
    const students = await getAllStudents();
    
    // Return first 5 students as a sample with all properties
    const sampleStudents = students.slice(0, 5).map(student => {
      const studentObj: any = {};
      Object.keys(student).forEach(key => {
        studentObj[key] = (student as any)[key];
      });
      return studentObj;
    });
    
    return NextResponse.json({
      success: true,
      totalStudents: students.length,
      sampleStudents: sampleStudents
    });
  } catch (error) {
    console.error('Error fetching students:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch students' },
      { status: 500 }
    );
  }
}