import { NextResponse } from 'next/server';
import { googleSheetsService } from '@/lib/google-sheets';

const EXPECTED_HEADERS = [
  'ID',
  'Student ID',
  'Student Name',
  'Class',
  'Subject',
  'Term',
  'Academic Year',
  'Assessment Type',
  'Score',
  'Total Marks',
  'Percentage',
  'Grade',
  'Remarks',
  'Date',
  'Teacher ID',
  'Teacher Name',
  'Created At',
  'Updated At',
];

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const sheetName = typeof body.sheetName === 'string' && body.sheetName.trim() ? body.sheetName.trim() : 'SBA';

    const createRes = await googleSheetsService.createSheet(sheetName);

    const dataRes = await googleSheetsService.getSheetData(sheetName);
    let headersAdded = false;

    if (!dataRes.success || dataRes.data.length === 0) {
      await googleSheetsService.appendToSheet(sheetName, [EXPECTED_HEADERS]);
      headersAdded = true;
    } else {
      const firstRow = dataRes.data[0] || [];
      const normalized = firstRow.map((h: string) => (h || '').trim().toLowerCase());
      const expectedNorm = EXPECTED_HEADERS.map(h => h.toLowerCase());
      const matches = expectedNorm.every((h, i) => normalized[i] === h);
      if (!matches) {
        await googleSheetsService.appendToSheet(sheetName, [EXPECTED_HEADERS]);
        headersAdded = true;
      }
    }

    return NextResponse.json({ success: true, sheetName, headersAdded, created: createRes.success });
  } catch (error) {
    console.error('Error initializing SBA sheet:', error);
    return NextResponse.json({ success: false, message: 'Failed to initialize SBA sheet' }, { status: 500 });
  }
}