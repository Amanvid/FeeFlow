
import { NextResponse } from 'next/server';
import { v4 as uuid } from 'uuid';
import type { Invoice } from '@/types';
import { GoogleSheetsService } from '@/lib/google-sheets';

// Initialize Google Sheets service
const googleSheets = new GoogleSheetsService();

export async function POST(req: Request) {
  try {
    const {
      amount,
      description,
      reference,
      guardianName,
      guardianPhone,
      relationship,
      studentName,
      class: studentClass,
      dueDate,
      metadataSheet
    } = await req.json();

    if (!amount || !description || !reference) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const newInvoice: Invoice = {
      id: reference, // Use reference as invoice number for consistency
      amount: parseFloat(amount),
      description,
      reference,
      status: 'PENDING',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Append to Google Sheets with proper Claims sheet structure
    const result = await googleSheets.appendToSheet('Claims', [[
      reference, // Invoice Number (column 1)
      guardianName || 'Unknown Guardian', // Guardian Name (column 2)
      guardianPhone || 'Unknown Phone', // Guardian Phone (column 3)
      relationship || 'Parent', // Relationship (column 4)
      studentName || 'Unknown Student', // Student Name (column 5)
      studentClass || 'Unknown Class', // Class (column 6)
      amount.toString(), // Total Fees Balance (column 7)
      dueDate || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString('en-GB'), // Due Date (column 8)
      new Date().toLocaleDateString('en-GB'), // Timestamp (column 9)
      'FALSE', // Paid status (column 10)
      '', // Payment Date (column 11)
      '', // Payment Reference (column 12)
      metadataSheet || 'Cop-Metadata' // Metadata Source (column 13)
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
