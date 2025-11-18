import { NextRequest, NextResponse } from 'next/server';
import { GoogleSheetsService } from '@/lib/google-sheets';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      studentName,
      studentClass,
      paymentType,
      amount,
      paymentMethod,
      notes,
    } = body;

    // Validate required fields
    if (!studentName || !studentClass || !paymentType || !amount) {
      return NextResponse.json(
        { success: false, message: 'Missing required fields' },
        { status: 400 }
      );
    }

    const sheetsService = new GoogleSheetsService();

    // Get current student data from Metadata sheet
    const currentDataResult = await sheetsService.getSheetData('Metadata');
    if (!currentDataResult.success) {
      return NextResponse.json(
        { success: false, message: 'Failed to read student data' },
        { status: 500 }
      );
    }

    const currentData = currentDataResult.data;
    if (currentData.length <= 1) {
      return NextResponse.json(
        { success: false, message: 'No student data found' },
        { status: 404 }
      );
    }

    // Find the student by name and class
    let studentRowIndex = -1;
    let studentData: string[] = [];
    
    for (let i = 1; i < currentData.length; i++) {
      const row = currentData[i];
      const nameMatch = row[1] && row[1].toLowerCase().includes(studentName.toLowerCase());
      const classMatch = row[2] && row[2].toLowerCase() === studentClass.toLowerCase();
      
      if (nameMatch && classMatch) {
        studentRowIndex = i;
        studentData = [...row];
        break;
      }
    }

    if (studentRowIndex === -1) {
      return NextResponse.json(
        { success: false, message: `Student '${studentName}' in class '${studentClass}' not found` },
        { status: 404 }
      );
    }

    // Determine which column to update based on payment type
    let updateColumnIndex = -1;
    let currentValue = 0;
    
    if (paymentType === 'School Fees') {
      updateColumnIndex = 9; // PAYMENT column (index 9)
      currentValue = parseFloat(studentData[9] || '0');
    } else if (paymentType === 'Books Fees') {
      updateColumnIndex = 10; // BOOKS Fees Payment column (index 10)
      currentValue = parseFloat(studentData[10] || '0');
    }

    if (updateColumnIndex === -1) {
      return NextResponse.json(
        { success: false, message: 'Invalid payment type' },
        { status: 400 }
      );
    }

    // Calculate new payment amount
    const newPaymentAmount = currentValue + amount;
    
    // Update the student data
    studentData[updateColumnIndex] = newPaymentAmount.toFixed(2);

    // Update the row in Google Sheets (rowIndex + 1 because Sheets is 1-indexed and we have headers)
    const updateResult = await sheetsService.updateRowInSheet('Metadata', studentRowIndex + 1, studentData);

    if (updateResult.success) {
      // Also record the payment in a separate Payments sheet for tracking
      const paymentRecord = [
        new Date().toISOString(),           // Timestamp
        studentName,                        // Student Name
        studentClass,                       // Class
        paymentType,                        // Payment Type
        amount.toFixed(2),                  // Amount
        paymentMethod || 'Cash',            // Payment Method
        notes || '',                        // Notes
      ];

      // Try to append to Payments sheet (create if it doesn't exist)
      try {
        await sheetsService.appendToSheet('Payments', [paymentRecord]);
      } catch (paymentRecordError) {
        console.warn('Could not record payment in Payments sheet:', paymentRecordError);
      }

      return NextResponse.json({
        success: true,
        message: 'Payment recorded successfully',
        studentName,
        studentClass,
        paymentType,
        amount,
        newTotal: newPaymentAmount,
      });
    } else {
      return NextResponse.json(
        { success: false, message: updateResult.message || 'Failed to record payment' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error recording payment:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}