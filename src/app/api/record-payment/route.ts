import { NextResponse } from 'next/server';
import { getAllStudents } from '@/lib/data';
import { googleSheetsService } from '@/lib/google-sheets';

export async function POST(request: Request) {
  try {
    const { studentId, studentName, studentClass, paymentType, amount, paymentMethod } = await request.json();

    // Validate required fields
    if (!studentId || !studentName || !studentClass || !paymentType || !amount) {
      return NextResponse.json(
        { success: false, message: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Get all students to find the specific student
    const students = await getAllStudents();

    // Find the student by ID, name, and class
    const student = students.find(s => 
      s.id === studentId && 
      s.studentName.toLowerCase() === studentName.toLowerCase() && 
      s.class.toLowerCase() === studentClass.toLowerCase()
    );

    if (!student) {
      return NextResponse.json(
        { success: false, message: `Student '${studentName}' in class '${studentClass}' not found` },
        { status: 404 }
      );
    }

    // Get the current row data for the student
    const sheetData = await googleSheetsService.getSheetData('Metadata');
    if (!sheetData.success) {
      return NextResponse.json(
        { success: false, message: 'Failed to fetch sheet data' },
        { status: 500 }
      );
    }

    // Find the student's row in the sheet and get column headers
    let studentRowIndex = -1;
    let studentRowData = null;
    let columnHeaders = null;
    
    for (let i = 0; i < sheetData.data.length; i++) {
      const row = sheetData.data[i];
      
      // First row should be headers
      if (i === 0) {
        columnHeaders = row;
        continue;
      }
      
      // Check if this row matches our student (by student name)
      // Look for NAME column (case-insensitive search)
      const nameColumnIndex = columnHeaders.findIndex((header: string) => 
        header && header.toString().toLowerCase().includes('name')
      );
      
      if (nameColumnIndex !== -1 && row[nameColumnIndex] && 
          row[nameColumnIndex].toString().toLowerCase() === student.studentName.toLowerCase()) {
        studentRowIndex = i + 1; // +1 because Sheets is 1-indexed
        studentRowData = [...row];
        break;
      }
    }

    if (studentRowIndex === -1 || !studentRowData || !columnHeaders) {
      return NextResponse.json(
        { success: false, message: 'Student row not found in sheet' },
        { status: 404 }
      );
    }

    // Find column indices by header names (exact match for better accuracy)
    const findColumnIndex = (headerName: string): number => {
      const index = columnHeaders.findIndex((header: string) => {
        if (!header) return false;
        const headerStr = header.toString().trim().toLowerCase();
        const searchStr = headerName.toLowerCase().trim();
        return headerStr === searchStr || headerStr.includes(searchStr) || searchStr.includes(headerStr);
      });
      return index;
    };

    // Determine which column to update based on payment type and existing payments
    let updateColumnIndex = -1;
    let currentValue = 0;
    let paymentColumnName = '';
    
    if (paymentType === 'School Fees') {
      // Find column indices for payment columns
      const initialAmountColumnIndex = findColumnIndex('INTIAL AMOUNT PAID');
      const paymentColumnIndex = findColumnIndex('PAYMENT');
      
      if (initialAmountColumnIndex === -1 || paymentColumnIndex === -1) {
        return NextResponse.json(
          { success: false, message: 'Required payment columns not found in sheet' },
          { status: 500 }
        );
      }
      
      // Check if this is the first school fees payment
      const initialAmountPaid = parseFloat(studentRowData[initialAmountColumnIndex] || '0');
      const additionalPayments = parseFloat(studentRowData[paymentColumnIndex] || '0');
      
      if (initialAmountPaid === 0) {
        // First school fees payment - update INTIAL AMOUNT PAID column
        updateColumnIndex = initialAmountColumnIndex;
        currentValue = initialAmountPaid;
        paymentColumnName = 'Initial Amount Paid';
      } else {
        // Subsequent school fees payment - update PAYMENT column
        updateColumnIndex = paymentColumnIndex;
        currentValue = additionalPayments;
        paymentColumnName = 'School Fees Payment';
      }
    } else if (paymentType === 'Books Fees') {
      const booksPaymentColumnIndex = findColumnIndex('BOOKS Fees Payment');
      
      if (booksPaymentColumnIndex === -1) {
        return NextResponse.json(
          { success: false, message: 'Books Fees Payment column not found in sheet' },
          { status: 500 }
        );
      }
      
      updateColumnIndex = booksPaymentColumnIndex;
      currentValue = parseFloat(studentRowData[booksPaymentColumnIndex] || '0');
      paymentColumnName = 'Books Fees Payment';
    }

    if (updateColumnIndex === -1) {
      return NextResponse.json(
        { success: false, message: 'Invalid payment type' },
        { status: 400 }
      );
    }

    // Calculate new payment amount with proper validation
    const currentValueNum = isNaN(currentValue) ? 0 : currentValue;
    const newPaymentAmount = currentValueNum + amount;
    
    // Update the student data with proper formatting
    studentRowData[updateColumnIndex] = newPaymentAmount.toFixed(2);

    // Update the row in Google Sheets
    const updateResult = await googleSheetsService.updateRowInSheet('Metadata', studentRowIndex, studentRowData);

    if (updateResult.success) {
      // Optional: Record the payment in Claims sheet for invoice tracking
      // This is optional since the main payment recording happens in Metadata sheet
      const paymentRecord = [
        `PAY-${Date.now()}`,                // Invoice Number (for tracking)
        'Direct Payment',                   // Guardian Name
        'N/A',                              // Guardian Phone
        'Direct',                           // Relationship
        studentName,                        // Student Name
        studentClass,                       // Class
        amount.toFixed(2),                  // Total Fees Balance (payment amount)
        new Date().toLocaleDateString('en-GB'), // Due Date (today)
        new Date().toLocaleDateString('en-GB'), // Timestamp
        'TRUE',                             // Paid status
        new Date().toLocaleDateString('en-GB'), // Payment Date
        paymentMethod || 'Cash',            // Payment Reference (payment method)
      ];

      // Try to append to Claims sheet (this is optional, so we catch and ignore errors)
      try {
        await googleSheetsService.appendToSheet('Claims', [paymentRecord]);
      } catch (paymentRecordError) {
        console.log('Payment tracking in Claims sheet skipped (optional feature)');
      }

      return NextResponse.json({
        success: true,
        message: `Payment recorded successfully in ${paymentColumnName} column`,
        studentName,
        studentClass,
        paymentType,
        amount,
        newTotal: newPaymentAmount,
        studentId: student.id,
        columnUpdated: paymentColumnName,
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