import { NextRequest, NextResponse } from 'next/server';
import { getAllStudents } from '@/lib/data';
import { NEW_METADATA, OLD_METADATA } from '@/lib/definitions';

export async function GET(request: NextRequest) {
  try {
    const [newStudents, oldStudents] = await Promise.all([
      getAllStudents(NEW_METADATA),
      getAllStudents(OLD_METADATA)
    ]);
    const students = [...newStudents, ...oldStudents];

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