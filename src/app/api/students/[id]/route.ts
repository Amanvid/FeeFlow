import { NextRequest, NextResponse } from 'next/server';
import { getAllStudents } from '@/lib/data';

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const students = await getAllStudents();
    
    // Find student by ID
    const student = students.find(s => s.id === id);
    
    if (!student) {
      return NextResponse.json(
        { success: false, message: 'Student not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      student: student
    });
  } catch (error) {
    console.error('Error fetching student details:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch student details' },
      { status: 500 }
    );
  }
}