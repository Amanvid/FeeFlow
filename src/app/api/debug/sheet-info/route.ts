import { NextRequest, NextResponse } from 'next/server';
import { GoogleSheetsService } from '@/lib/google-sheets';

export async function GET(request: NextRequest) {
  try {
    const sheetsService = new GoogleSheetsService();
    // Scan column A to find section headers
    const result = await sheetsService.getSheetData('SBA Nursery 1', 'A1:C100');
    
    if (!result.success || !result.data) {
      return NextResponse.json({ error: 'Failed to read sheet' }, { status: 500 });
    }

    const rows = result.data;
    const analysis = rows.map((row: any[], index: number) => ({
      rowIndex: index + 1,
      colA: row[0],
      colB: row[1],
      colC: row[2]
    }));

    // Find keywords
    const keywords = ['Literacy', 'Numeracy', 'Colouring', 'Writting', 'Writing', 'Student Name'];
    const found = analysis.filter((r: any) => 
      keywords.some(k => 
        (r.colA && r.colA.includes(k)) || 
        (r.colB && r.colB.includes(k)) || 
        (r.colC && r.colC.includes(k))
      )
    );

    return NextResponse.json({ found, allRows: analysis.slice(0, 50) });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 });
  }
}
