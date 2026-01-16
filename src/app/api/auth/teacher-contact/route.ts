import { NextResponse } from 'next/server';
import { GoogleSheetsService } from '@/lib/google-sheets';

export async function POST(req: Request) {
  try {
    const { username } = await req.json();
    if (!username) {
      return NextResponse.json(
        { success: false, message: 'Username is required' },
        { status: 400 }
      );
    }

    const sheetsService = new GoogleSheetsService();
    const result = await sheetsService.getSheetData('Teachers', 'A1:J11');

    if (!result.success || !result.data || result.data.length < 2) {
      return NextResponse.json(
        { success: false, message: 'Failed to read Teachers sheet' },
        { status: 500 }
      );
    }

    const rows = result.data;
    let contact = '';

    for (let i = 1; i < rows.length; i++) {
      const row = rows[i];
      const uname = (row[4] || '').toString().trim();
      if (uname.toLowerCase() === String(username).trim().toLowerCase()) {
        contact = (row[6] || '').toString().trim();
        break;
      }
    }

    return NextResponse.json({
      success: true,
      contact: contact || ''
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
