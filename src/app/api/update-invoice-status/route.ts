import { NextRequest, NextResponse } from 'next/server';
import { googleSheetsService } from '@/lib/google-sheets';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { invoiceNumber, paid, paymentDate, paymentReference } = body;

    if (!invoiceNumber) {
      return NextResponse.json(
        { error: 'Invoice number is required' },
        { status: 400 }
      );
    }

    if (typeof paid !== 'boolean') {
      return NextResponse.json(
        { error: 'Paid status must be a boolean' },
        { status: 400 }
      );
    }

    // Update invoice payment status in Google Sheets
    const result = await googleSheetsService.updateInvoicePaymentStatus(invoiceNumber, {
      paid,
      paymentDate: paymentDate || new Date().toISOString(),
      paymentReference: paymentReference || '',
    });

    if (!result.success) {
      console.error('Failed to update invoice status in Google Sheets:', result.message);
      return NextResponse.json(
        { error: 'Failed to update invoice status', details: result.message },
        { status: 500 }
      );
    }

    console.log(`Invoice ${invoiceNumber} payment status updated in Google Sheets:`, { paid, paymentDate, paymentReference });

    return NextResponse.json({
      success: true,
      message: 'Invoice payment status updated successfully',
      invoiceNumber,
      paid,
    });
  } catch (error) {
    console.error('Error updating invoice status:', error);
    return NextResponse.json(
      { error: 'Failed to update invoice payment status' },
      { status: 500 }
    );
  }
}