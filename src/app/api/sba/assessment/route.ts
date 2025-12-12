import { NextRequest, NextResponse } from 'next/server';
import { getSBAAssessmentData } from '@/lib/sba-assessment';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const studentId = searchParams.get('studentId');
    const className = searchParams.get('class');
    const subject = searchParams.get('subject');
    const term = searchParams.get('term');

    if (!studentId || !className || !subject || !term) {
      return NextResponse.json(
        { error: 'Missing required parameters: studentId, class, subject, term' },
        { status: 400 }
      );
    }

    const assessmentData = await getSBAAssessmentData(studentId, className, subject, term);
    
    if (!assessmentData) {
      return NextResponse.json(
        { error: 'No SBA assessment data found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: assessmentData
    });
  } catch (error) {
    console.error('Error fetching SBA assessment data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch SBA assessment data' },
      { status: 500 }
    );
  }
}