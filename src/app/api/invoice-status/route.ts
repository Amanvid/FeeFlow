
import { NextResponse } from 'next/server';
import type { Invoice } from '@/types';
import { googleSheetsService } from '@/lib/google-sheets';

const googleSheets = googleSheetsService;

// Helper function to get invoices from Google Sheets
async function getInvoicesFromSheet(): Promise<Invoice[]> {
  try {
    const result = await googleSheets.getInvoices();
    if (!result.success) {
      console.error('Failed to get invoices from sheet:', result.message);
      return [];
    }
    
    // Return the already properly mapped invoices from getInvoices()
    return result.data;
  } catch (error) {
    console.error('Error getting invoices from sheet:', error);
    return [];
  }
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');

  if (!id) {
    return NextResponse.json({ error: 'Invoice ID is required' }, { status: 400 });
  }

  try {
    const invoices = await getInvoicesFromSheet();
    const invoice = invoices.find(inv => inv.id === id);

    if (!invoice) {
      return NextResponse.json({ error: 'Invoice not found' }, { status: 404 });
    }

    // In a real app, you would check with the payment provider.
    // Here, we'll just return the stored status.
    return NextResponse.json({ status: invoice.status });

  } catch (error) {
    console.error('Failed to get invoice status:', error);
    return NextResponse.json({ error: 'Failed to get invoice status' }, { status: 500 });
  }
}
