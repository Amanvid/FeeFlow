import { NextResponse } from 'next/server';
import { googleSheetsService } from '@/lib/google-sheets';

export async function GET() {
  try {
    const service = googleSheetsService;
    const spreadsheetId = process.env.NEXT_PUBLIC_SPREADSHEET_ID;
    
    const result = await service.getSheetData('Teachers', 'A:K');
    
    if (!result.success) {
      return NextResponse.json({ 
        error: 'Failed to fetch teachers data', 
        details: result.message 
      }, { status: 500 });
    }
    
    const rows = result.data || [];
    const teachers = rows.slice(1).map((row: any[], index: number) => ({
      id: index + 1,
      name: row[0] || '',
      email: row[1] || '',
      phone: row[2] || '',
      username: row[4] || '',
      password: row[5] || '',
      subject: row[6] || '',
      classes: row[7] || '',
      adminPrivileges: row[9] || 'No',
    }));
    
    return NextResponse.json({ teachers });
  } catch (error) {
    return NextResponse.json({ 
      error: 'Failed to fetch teachers', 
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
