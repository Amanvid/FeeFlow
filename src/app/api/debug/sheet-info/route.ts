import { NextRequest, NextResponse } from 'next/server';
import { GoogleSheetsService } from '@/lib/google-sheets';

export async function GET(request: NextRequest) {
  try {
    const sheetsService = new GoogleSheetsService();
    // Get Teachers sheet data to check adminPrivileges column
    const result = await sheetsService.getSheetData('Teachers', 'A1:K20');
    
    if (!result.success || !result.data) {
      return NextResponse.json({ error: 'Failed to read sheet' }, { status: 500 });
    }

    const rows = result.data;
    const analysis = rows.map((row: any[], index: number) => ({
      rowIndex: index + 1,
      name: row[0] || '',
      class: row[1] || '',
      role: row[2] || '',
      status: row[3] || '',
      username: row[4] || '',
      password: row[5] || '',
      contact: row[6] || '',
      location: row[7] || '',
      employmentDate: row[8] || '',
      adminPrivileges: row[9] || ''
    }));

    return NextResponse.json({ found: analysis, allRows: analysis });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 });
  }
}
