import { NextRequest, NextResponse } from 'next/server';
import { getAllStudents } from '@/lib/data';

export async function GET(request: NextRequest) {
  try {
    const students = await getAllStudents();
    
    return NextResponse.json({
      success: true,
      students: students,
      total: students.length
    });
  } catch (error) {
    console.error('Error fetching students:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch students' },
      { status: 500 }
    );
  }
}