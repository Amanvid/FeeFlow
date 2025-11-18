import { NextRequest, NextResponse } from 'next/server';
import { GoogleSheetsService } from '@/lib/google-sheets';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      name,
      grade,
      studentType,
      gender,
      guardianName,
      guardianPhone,
      totalBalance,
      arrears,
      booksFees,
      schoolFeesAmount,
      initialAmountPaid,
      payment,
      booksFeesPayment,
    } = body;

    // Validate required fields
    if (!name || !grade || !guardianName || !guardianPhone) {
      return NextResponse.json(
        { success: false, message: 'Missing required fields' },
        { status: 400 }
      );
    }

    const sheetsService = new GoogleSheetsService();

    // Get current data to determine class sections and insertion point
    const currentDataResult = await sheetsService.getSheetData('Metadata');
    if (!currentDataResult.success) {
      return NextResponse.json(
        { success: false, message: 'Failed to read current student data' },
        { status: 500 }
      );
    }

    const currentData = currentDataResult.data;
    let nextStudentNumber = 1;
    let insertRowIndex = -1;
    let headers: string[] = [];
    
    if (currentData.length > 0) {
      // Find the headers row (usually first row with actual data)
      let headersRowIndex = -1;
      for (let i = 0; i < currentData.length; i++) {
        const row: unknown[] = currentData[i] as unknown[];
        const hasHeaderMarkers = row.some((cell: unknown) => {
          if (!cell) return false;
          const text = String(cell).toLowerCase();
          return text.includes('no.') || text.includes('name');
        });
        if (hasHeaderMarkers) {
          headersRowIndex = i;
          headers = row.map((cell: unknown) => (cell ? String(cell).trim() : ''));
          break;
        }
      }

      if (headersRowIndex === -1) {
        return NextResponse.json(
          { success: false, message: 'Could not find headers in the sheet' },
          { status: 500 }
        );
      }

      // Find the target class section and determine insertion point
      let maxStudentNumber = 0;
      let foundClassSection = false;
      let lastStudentInSection = -1;
      let maxStudentNumberInTargetClass = 0;
      
      for (let i = headersRowIndex + 1; i < currentData.length; i++) {
        const row = currentData[i];
        const currentStudentNumber = parseInt(row[0] || '0');
        const currentClass = row[3] ? row[3].toString().trim() : '';
        
        // Track the highest student number overall
        if (!isNaN(currentStudentNumber) && currentStudentNumber > maxStudentNumber) {
          maxStudentNumber = currentStudentNumber;
        }
        
        // Check if this is our target class
        if (currentClass.toLowerCase() === grade.toLowerCase()) {
          foundClassSection = true;
          lastStudentInSection = i;
          // Track the highest student number within the target class
          if (!isNaN(currentStudentNumber) && currentStudentNumber > maxStudentNumberInTargetClass) {
            maxStudentNumberInTargetClass = currentStudentNumber;
          }
        } else if (foundClassSection && currentClass !== '') {
          // We've moved to a different class section, insert before this row
          insertRowIndex = i;
          break;
        }
      }
      
      // Determine where to insert the new student
      if (lastStudentInSection >= 0) {
        // Insert after the last student in the target class section
        insertRowIndex = lastStudentInSection + 1;
        nextStudentNumber = maxStudentNumberInTargetClass + 1;
      } else {
        // Target class section not found, append at the end
        insertRowIndex = -1;
        nextStudentNumber = maxStudentNumber + 1;
      }
    }

    // Calculate total balance if not provided
    const calculatedTotalBalance = totalBalance || 
      (arrears + booksFees + schoolFeesAmount - initialAmountPaid - payment - booksFeesPayment);

    // Prepare the new student data row based on actual sheet structure
    const newStudentRow = new Array(headers.length).fill('');
    
    // Map data to correct columns based on headers
    headers.forEach((header, index) => {
      const headerLower = header.toLowerCase();
      
      if (headerLower.includes('no.')) {
        newStudentRow[index] = nextStudentNumber.toString();
      } else if (headerLower.includes('name')) {
        newStudentRow[index] = name;
      } else if (headerLower.includes('gender')) {
        newStudentRow[index] = gender || 'Other';
      } else if (headerLower.includes('grade')) {
        newStudentRow[index] = grade;
      } else if (headerLower.includes('student type')) {
        newStudentRow[index] = studentType || 'New';
      } else if (headerLower.includes('school fees amount')) {
        newStudentRow[index] = (schoolFeesAmount || 0).toFixed(2);
      } else if (headerLower.includes('arreas')) {
        newStudentRow[index] = (arrears || 0).toFixed(2);
      } else if (headerLower.includes('intial amount paid')) {
        newStudentRow[index] = (initialAmountPaid || 0).toFixed(2);
      } else if (headerLower.includes('payment')) {
        newStudentRow[index] = (payment || 0).toFixed(2);
      } else if (headerLower.includes('remaining balance')) {
        newStudentRow[index] = (calculatedTotalBalance || 0).toFixed(2);
      } else if (headerLower.includes('books fees') && !headerLower.includes('payment')) {
        newStudentRow[index] = (booksFees || 0).toFixed(2);
      } else if (headerLower.includes('books fees payment')) {
        newStudentRow[index] = (booksFeesPayment || 0).toFixed(2);
      } else if (headerLower.includes('total balance')) {
        newStudentRow[index] = (calculatedTotalBalance || 0).toFixed(2);
      } else if (headerLower.includes('parent name') || headerLower.includes('guardian name')) {
        newStudentRow[index] = guardianName;
      } else if (headerLower.includes('contact') || headerLower.includes('phone')) {
        newStudentRow[index] = guardianPhone;
      } else if (headerLower.includes('location')) {
        newStudentRow[index] = '';
      }
    });

    // Insert the new student row at the calculated position
    let insertResult;
    if (insertRowIndex > 0) {
      // Insert at specific row
      insertResult = await sheetsService.insertRowAt('Metadata', insertRowIndex, newStudentRow);
    } else {
      // Append to end
      insertResult = await sheetsService.appendToSheet('Metadata', [newStudentRow]);
    }

    if (insertResult.success) {
      return NextResponse.json({
        success: true,
        message: 'Student added successfully',
        studentNumber: nextStudentNumber,
        insertedAtRow: insertRowIndex > 0 ? insertRowIndex : 'end',
      });
    } else {
      return NextResponse.json(
        { success: false, message: insertResult.message || 'Failed to add student' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error adding student:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}