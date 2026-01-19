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
      schoolFeesAmount,
      initialAmountPaid,
      admissionDate,
      notes,
      paymentMethod,
      location,
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
    let headersRowIndex = -1; // Moved to outer scope

    if (currentData.length > 0) {
      // Find the headers row (usually first row with actual data)
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
        // Insert BEFORE the last student (Last but one place)
        // If there's only 1 student, we still insert at that position (pushing the existing one down)
        // Ensure we don't go before the headers
        insertRowIndex = lastStudentInSection;

        // Safety check: if insertRowIndex <= headersRowIndex, put it after headers (first item)
        if (insertRowIndex <= headersRowIndex) {
          insertRowIndex = headersRowIndex + 1;
        }

        // We still calculate the student number based on the max in class + 1
        nextStudentNumber = maxStudentNumberInTargetClass + 1;
      } else {
        // Target class section not found, append at the end
        insertRowIndex = -1;
        nextStudentNumber = maxStudentNumber + 1;
      }
    }

    // Get the current row number for formula references
    const currentRow = insertRowIndex > 0 ? insertRowIndex + 1 : currentData.length + 1; // Row number is index + 1

    console.log('Headers found:', headers);
    console.log('Current row number:', currentRow);
    console.log('Grade column index:', headers.findIndex(h => h.toLowerCase().includes('grade')));
    console.log('Student type column index:', headers.findIndex(h => h.toLowerCase().includes('student type')));

    // Prepare the new student data row based on actual sheet structure
    const newStudentRow = new Array(headers.length).fill('');

    // Map data to correct columns based on headers
    headers.forEach((header, index) => {
      const headerLower = header.toLowerCase();
      const colLetter = String.fromCharCode(65 + index); // A, B, C, etc.

      if (headerLower.includes('no.')) {
        newStudentRow[index] = nextStudentNumber.toString();
      } else if (headerLower.includes('parent name') || headerLower.includes('guardian name')) {
        newStudentRow[index] = guardianName;
      } else if (headerLower.includes('gender')) {
        newStudentRow[index] = gender || 'Other';
      } else if (headerLower.includes('grade')) {
        newStudentRow[index] = grade;
      } else if (headerLower.includes('student type')) {
        newStudentRow[index] = 'New'; // Always set to New
      } else if (headerLower === 'class' || headerLower === 'category' || (index === 4 && header === '')) {
        // If it's column E or specifically named Class/Category, put the prefix of the grade (e.g. "Nursery")
        newStudentRow[index] = grade.split(' ')[0];
      } else if (headerLower.includes('name')) {
        // This catch-all for 'name' should be after more specific name checks like 'parent name'
        newStudentRow[index] = name;
      } else if (index === 6) {
        // STRICTLY Column G: Insert VLOOKUP formula for school fees
        const gradeCol = headers.findIndex(h => h.toLowerCase().includes('grade'));
        const studentTypeCol = headers.findIndex(h => h.toLowerCase().includes('student type'));
        const gradeLetter = String.fromCharCode(65 + gradeCol);
        const studentTypeLetter = String.fromCharCode(65 + studentTypeCol);

        // Determine the appropriate table based on grade
        let tableName = 'CrecheTbl';
        const gradeLower = grade.toLowerCase();

        console.log('Grade being processed:', grade, 'Grade lower:', gradeLower);

        if (gradeLower.includes('creche')) {
          tableName = 'CrecheTbl';
          console.log('Matched Creche pattern');
        } else if (gradeLower.includes('n ') && grade.includes('&')) {
          tableName = 'NurseryTbl';
          console.log('Matched N & pattern');
        } else if (gradeLower.includes('kg')) {
          tableName = 'NurseryTbl';
          console.log('Matched KG pattern');
        } else {
          // Default to NurseryTbl as requested for new student logic if other patterns don't match or for column G
          tableName = 'NurseryTbl';
          console.log('Defaulting to NurseryTbl');
        }

        console.log('Selected table name:', tableName);

        const formula = `=IFERROR(VLOOKUP(E${currentRow}&F${currentRow},${tableName},4,0),"")`;
        console.log('School fees formula:', formula);
        console.log('Grade letter:', gradeLetter, 'Student type letter:', studentTypeLetter);
        newStudentRow[index] = formula;
      } else if (index === 11) {
        // STRICTLY Column L: Set to '0'
        newStudentRow[index] = '0';
      } else if (index === 12) {
        // STRICTLY Column M: Set to '0'
        newStudentRow[index] = '0';
      } else if (index === 13) {
        // STRICTLY Column N: Set to Formula =L{row}-M{row}
        newStudentRow[index] = `=L${currentRow}-M${currentRow}`;
      } else if (headerLower.includes('intial amount paid')) {
        newStudentRow[index] = (initialAmountPaid || 0).toFixed(2);
      } else if (headerLower.includes('arreas') || headerLower.includes('arrears')) {
        // Leave arrears blank for new students - do not insert any value
        // newStudentRow[index] = '0'; // Commented out to leave blank
      } else if (headerLower.includes('total balance') || index === 10) {
        // Insert formula: =SchoolFees+Arrears-InitialPaid-Payment
        const schoolFeesCol = headers.findIndex(h => h.toLowerCase().includes('school fees amount'));
        const arrearsCol = headers.findIndex(h => h.toLowerCase().includes('arreas') || h.toLowerCase().includes('arrears'));
        const initialPaidCol = headers.findIndex(h => h.toLowerCase().includes('intial amount paid'));
        const paymentCol = headers.findIndex(h => h.toLowerCase().includes('payment') && !h.toLowerCase().includes('method') && !h.toLowerCase().includes('books'));

        const g = String.fromCharCode(65 + (schoolFeesCol >= 0 ? schoolFeesCol : 6)); // Default G if not found
        const h = String.fromCharCode(65 + (arrearsCol >= 0 ? arrearsCol : 7)); // Default H
        const i = String.fromCharCode(65 + (initialPaidCol >= 0 ? initialPaidCol : 8)); // Default I
        const j = String.fromCharCode(65 + (paymentCol >= 0 ? paymentCol : 9)); // Default J

        newStudentRow[index] = `=${g}${currentRow}+${h}${currentRow}-${i}${currentRow}-${j}${currentRow}`;
      } else if (headerLower.includes('remaining balance')) {
        // Insert formula: =BooksFees-SchoolFees-InitialPaid (arrears is blank for new students)
        const booksFeesCol = headers.findIndex(h => h.toLowerCase().includes('books fees') && !h.toLowerCase().includes('payment'));
        const schoolFeesCol = headers.findIndex(h => h.toLowerCase().includes('school fees amount'));
        const initialPaidCol = headers.findIndex(h => h.toLowerCase().includes('intial amount paid'));
        const booksFeesLetter = String.fromCharCode(65 + booksFeesCol);
        const schoolFeesLetter = String.fromCharCode(65 + schoolFeesCol);
        const initialPaidLetter = String.fromCharCode(65 + initialPaidCol);
        newStudentRow[index] = `=${booksFeesLetter}${currentRow}-${schoolFeesLetter}${currentRow}-${initialPaidLetter}${currentRow}`;
      } else if (headerLower.includes('contact') || headerLower.includes('phone')) {
        newStudentRow[index] = guardianPhone;
      } else if (headerLower.includes('location')) {
        newStudentRow[index] = location || '';
      } else if (headerLower.includes('admission date') || headerLower.includes('date')) {
        newStudentRow[index] = admissionDate || new Date().toISOString().split('T')[0];
      } else if (headerLower.includes('remark') || headerLower.includes('note')) {
        newStudentRow[index] = notes || '';
      } else if (headerLower.includes('payment method') || headerLower.includes('mode')) {
        newStudentRow[index] = paymentMethod || 'Cash';
      }
    });

    // Insert the new student row at the calculated position
    let insertResult;
    if (insertRowIndex > 0) {
      // Insert at specific row - insertRowAt expects 1-based row index
      insertResult = await sheetsService.insertRowAt('Metadata', currentRow, newStudentRow);
    } else {
      // Append to end
      insertResult = await sheetsService.appendToSheet('Metadata', [newStudentRow]);
    }

    // Post-insertion: Renumber Column A (No.) for ALL students to be sequential
    if (insertResult.success && headersRowIndex >= 0) {
      // Fetch all data again to renumber
      const updatedDataResult = await sheetsService.getSheetData('Metadata');
      if (updatedDataResult.success) {
        const rows = updatedDataResult.data;
        let dataStartIndex = -1;

        // Find where data starts (after header)
        for (let i = 0; i < rows.length; i++) {
          if (i > headersRowIndex) {
            // Check if it's a valid student row (has name or ID or some content)
            if (rows[i][1] || rows[i][2] || rows[i][3]) {
              if (dataStartIndex === -1) dataStartIndex = i;
              break;
            }
          }
        }

        if (dataStartIndex === -1) dataStartIndex = headersRowIndex + 1;

        const updates: string[][] = [];
        let currentNo = 1;

        // Build the updates array
        for (let i = dataStartIndex; i < rows.length; i++) {
          updates.push([currentNo.toString()]);
          currentNo++;
        }

        if (updates.length > 0) {
          // Apply batch update to Column A
          await sheetsService.updateSheet(
            'Metadata',
            `A${dataStartIndex + 1}:A${dataStartIndex + updates.length}`,
            updates
          );
        }
      }
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