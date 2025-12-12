import { NextRequest, NextResponse } from 'next/server';
import { getStudentById, getStudentSBASummaryBySubject } from '@/lib/data';

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const student = await getStudentById(id);
    if (!student) {
      return NextResponse.json(
        { success: false, message: 'Student not found' },
        { status: 404 }
      );
    }
    const className = request.nextUrl.searchParams.get('class') || student.class;
    const summary = await getStudentSBASummaryBySubject(student.id, className);
    return NextResponse.json({ success: true, student, summary });
  } catch (error) {
    console.error('Error building SBA summary:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to build SBA summary' },
      { status: 500 }
    );
  }
}