import { NextRequest, NextResponse } from 'next/server';
import { GoogleSheetsService } from '@/lib/google-sheets';

export async function GET(request: NextRequest) {
  try {
    const className = request.nextUrl.searchParams.get('className');
    if (!className) {
      return NextResponse.json({ subjects: [] });
    }

    const sheets = new GoogleSheetsService();
    const result = await sheets.getSheetData('Subjects', 'A1:C11');
    let subjects: string[] = [];
    if (result.success && result.data && result.data.length > 1) {
      const rows: any[][] = result.data;
      for (let i = 1; i < rows.length; i++) {
        const row = rows[i] || [];
        const cls = String(row[0] || '').trim();
        const subj = String(row[1] || '').trim();
        if (!cls || !subj) continue;
        if (cls === className && subj !== 'Subject' && subj !== 'Class Name') {
          const parts = subj.split(',').map(s => s.trim()).filter(s => s.length > 0);
          if (parts.length > 1) {
            subjects.push(...parts);
          } else {
            subjects.push(subj);
          }
        }
      }
      subjects = Array.from(new Set(subjects));
    }

    if (subjects.length === 0) {
      if (className === 'BS 1' || className === 'BS 2' || className === 'BS 3' || className === 'BS 4' || className === 'BS 5') {
        subjects = ['English', 'Mathematics', 'Science', 'Computing', 'History', 'R.M.E', 'Asante - Twi', 'Creative Arts'];
      }
    }

    return NextResponse.json({ subjects });
  } catch (error) {
    return NextResponse.json({ subjects: [] });
  }
}
