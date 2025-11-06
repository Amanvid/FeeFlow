
import { NextResponse } from 'next/server';
import { v4 as uuid } from 'uuid';
import type { Invoice } from '@/types';
import { GoogleSheetsService } from '@/lib/google-sheets';

// Initialize Google Sheets service
const googleSheets = new GoogleSheetsService();

export async function POST(req: Request) {
  try {
    const { amount, description, reference } = await req.json();

    if (!amount || !description || !reference) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const newInvoice: Invoice = {
      id: uuid(),
      amount: parseFloat(amount),
      description,
      reference,
      status: 'PENDING',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Append to Google Sheets instead of file system
    const result = await googleSheets.appendToSheet('Invoices', [[
      newInvoice.id,
      newInvoice.amount,
      newInvoice.description,
      newInvoice.reference,
      newInvoice.status,
      newInvoice.createdAt,
      newInvoice.updatedAt,
    ]]);

    if (!result.success) {
      console.error('Failed to append to Google Sheets:', result.message);
      return NextResponse.json({ 
        error: 'Failed to create invoice', 
        details: result.message 
      }, { status: 500 });
    }

    return NextResponse.json(newInvoice);
  } catch (error) {
    console.error('Failed to create invoice:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return NextResponse.json({ error: 'Failed to create invoice', details: errorMessage }, { status: 500 });
  }
}
