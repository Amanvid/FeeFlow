import { NextRequest, NextResponse } from 'next/server';
import { GoogleSheetsService } from '@/lib/google-sheets';

export async function POST(request: NextRequest) {
  try {
    const { studentName, className, subject, term, scores, rowIndex } = await request.json();
    
    if (!studentName || !className || !subject || !term || !scores) {
      return NextResponse.json(
        { success: false, message: 'Missing required fields' },
        { status: 400 }
      );
    }

    const sheetsService = new GoogleSheetsService();
    
    // Construct sheet name based on class
    const sheetNameMap: { [key: string]: string } = {
      'Creche': 'SBA Creche',
      'BS 1': 'SBA BS1',
      'BS 2': 'SBA BS2',
      'BS 3': 'SBA BS3',
      'BS 4': 'SBA BS4',
      'BS 5': 'SBA BS5',
      'KG 1': 'SBA KG 1',
      'KG 2': 'SBA KG 2',
      'Nursery 1': 'SBA Nursery 1',
      'Nursery 2': 'SBA Nursery 2',
    };
    const sheetName = sheetNameMap[className] || `SBA ${className}`;
    
    console.log(`Updating student ${studentName} in ${sheetName} for ${subject} - ${term}`);
    
    // For non-BS 1/BS 2/BS 3/BS 4/BS 5/KG 2 classes, get existing data to find the student row by name
    let studentRowIndex = -1;
    if (className !== 'BS 5' && className !== 'BS 4' && className !== 'BS 3' && className !== 'BS 2' && className !== 'BS 1' && className !== 'KG 2') {
      const result = await sheetsService.getSheetData(sheetName);
      if (!result.success || !result.data || result.data.length <= 1) {
        return NextResponse.json(
          { success: false, message: 'No existing data found in sheet' },
          { status: 404 }
        );
      }
      const existingData = result.data;
      const normalize = (n: unknown) => (n ? String(n).trim().toLowerCase() : '');
      const targetName = normalize(studentName);
      for (let i = 0; i < existingData.length; i++) {
        if (normalize(existingData[i][1]) === targetName) { // Column B is Student Name
          studentRowIndex = i + 1; // +1 because sheets are 1-indexed
          break;
        }
      }
      if (studentRowIndex === -1) {
        return NextResponse.json(
          { success: false, message: 'Student not found in sheet' },
          { status: 404 }
        );
      }
    }

    // Calculate derived values
    const individualTestScore = parseFloat(scores.individualTestScore?.toString() || '0') || 0;
    const classTestScore = parseFloat(scores.classTestScore?.toString() || '0') || 0;
    const examScore = parseFloat(scores.examScore?.toString() || '0') || 0;
    
    const totalClassScore = individualTestScore + classTestScore;
    const scaledClassScore = Math.round((totalClassScore / 60) * 50);
    const scaledExamScore = Math.round((examScore / 100) * 50);
    const overallTotal = scaledClassScore + scaledExamScore;

    // Determine which columns to update based on subject
    let updateRange = '';
    let valuesToUpdate: string[] = [];

    // Creche subjects
    if (subject === 'Literacy') {
      updateRange = `C${studentRowIndex}:J${studentRowIndex}`;
      valuesToUpdate = [
        scores.individualTestScore?.toString() || '',
        scores.classTestScore?.toString() || '',
        totalClassScore.toString(),
        scaledClassScore.toString(),
        scores.examScore?.toString() || '',
        scaledExamScore.toString(),
        overallTotal.toString(),
        ''
      ];
    } else if (subject === 'Numeracy') {
      updateRange = `K${studentRowIndex}:R${studentRowIndex}`;
      valuesToUpdate = [
        scores.individualTestScore?.toString() || '',
        scores.classTestScore?.toString() || '',
        totalClassScore.toString(),
        scaledClassScore.toString(),
        scores.examScore?.toString() || '',
        scaledExamScore.toString(),
        overallTotal.toString(),
        ''
      ];
    } else if (subject === 'Colouring') {
      const colouringRowIndex = studentRowIndex + 10;
      updateRange = `C${colouringRowIndex}:J${colouringRowIndex}`;
      valuesToUpdate = [
        scores.individualTestScore?.toString() || '',
        scores.classTestScore?.toString() || '',
        totalClassScore.toString(),
        scaledClassScore.toString(),
        scores.examScore?.toString() || '',
        scaledExamScore.toString(),
        overallTotal.toString(),
        ''
      ];
    } else if (subject === 'Scribbling') {
      const scribblingRowIndex = studentRowIndex + 10;
      updateRange = `K${scribblingRowIndex}:R${scribblingRowIndex}`;
      valuesToUpdate = [
        scores.individualTestScore?.toString() || '',
        scores.classTestScore?.toString() || '',
        totalClassScore.toString(),
        scaledClassScore.toString(),
        scores.examScore?.toString() || '',
        scaledExamScore.toString(),
        overallTotal.toString(),
        ''
      ];
    }

    // BS 1 subjects: ranges within A1:S76 (segmented layout)
    if (className === 'BS 1') {
      const BS1_SUBJECT_RANGES: Record<string, { startCol: string; endCol: string; startRow: number; endRow: number }> = {
        'English': { startCol: 'C', endCol: 'J', startRow: 2, endRow: 19 },
        'Mathematics': { startCol: 'L', endCol: 'S', startRow: 2, endRow: 19 },
        'Science': { startCol: 'C', endCol: 'J', startRow: 21, endRow: 38 },
        'Computing': { startCol: 'C', endCol: 'J', startRow: 59, endRow: 76 },
        'History': { startCol: 'L', endCol: 'S', startRow: 40, endRow: 57 },
        'R.M.E': { startCol: 'L', endCol: 'S', startRow: 59, endRow: 76 },
        'Asante - Twi': { startCol: 'L', endCol: 'S', startRow: 21, endRow: 38 },
        'Creative Arts': { startCol: 'C', endCol: 'J', startRow: 40, endRow: 57 }
      };

      const cfg = BS1_SUBJECT_RANGES[subject];
      if (cfg) {
        let foundRowIndex = -1;
        const inRange = (r: number) => r >= cfg.startRow && r <= cfg.endRow;
        if (typeof rowIndex === 'number' && inRange(rowIndex)) {
          foundRowIndex = rowIndex;
        } else {
          const blockRange = `B${cfg.startRow}:${cfg.endCol}${cfg.endRow}`;
          const blockResult = await sheetsService.getSheetData(sheetName, blockRange);
          if (!blockResult.success || !blockResult.data || blockResult.data.length === 0) {
            return NextResponse.json(
              { success: false, message: 'No data found in BS 1 subject block' },
              { status: 404 }
            );
          }
          const normalize = (n: unknown) => (n ? String(n).trim().toLowerCase() : '');
          const targetName = normalize(studentName);
          for (let i = 0; i < blockResult.data.length; i++) {
            const row = blockResult.data[i] || [];
            const nameInBlock = normalize(row[0]);
            if (nameInBlock === targetName) {
              foundRowIndex = cfg.startRow + i;
              break;
            }
          }
        }

        if (foundRowIndex === -1) {
          return NextResponse.json(
            { success: false, message: 'Student not found in BS 1 subject block' },
            { status: 404 }
          );
        }

        updateRange = `${cfg.startCol}${foundRowIndex}:${cfg.endCol}${foundRowIndex}`;
        valuesToUpdate = [
          scores.individualTestScore?.toString() || '',
          scores.classTestScore?.toString() || '',
          totalClassScore.toString(),
          scaledClassScore.toString(),
          scores.examScore?.toString() || '',
          scaledExamScore.toString(),
          overallTotal.toString(),
          ''
        ];
      }
    }

    // KG 2 subjects: ranges within A1:S76
    if (className === 'KG 2') {
      const KG2_SUBJECT_RANGES: Record<string, { startCol: string; endCol: string; startRow: number; endRow: number }> = {
        'Literacy': { startCol: 'C', endCol: 'J', startRow: 2, endRow: 19 },
        'Numeracy': { startCol: 'L', endCol: 'S', startRow: 2, endRow: 19 },
        'Creative Arts': { startCol: 'C', endCol: 'J', startRow: 21, endRow: 38 },
        'Pre-Writing': { startCol: 'L', endCol: 'S', startRow: 21, endRow: 38 },
        'Pre-writing': { startCol: 'L', endCol: 'S', startRow: 21, endRow: 38 },
        'Pre-Writting': { startCol: 'L', endCol: 'S', startRow: 21, endRow: 38 },
        'OWOP': { startCol: 'C', endCol: 'J', startRow: 39, endRow: 57 }
      };

      const cfg = KG2_SUBJECT_RANGES[subject];
      if (cfg) {
        let foundRowIndex = -1;
        const inRange = (r: number) => r >= cfg.startRow && r <= cfg.endRow;
        if (typeof rowIndex === 'number' && inRange(rowIndex)) {
          foundRowIndex = rowIndex;
        } else {
          const blockRange = `B${cfg.startRow}:${cfg.endCol}${cfg.endRow}`;
          const blockResult = await sheetsService.getSheetData(sheetName, blockRange);
          if (!blockResult.success || !blockResult.data || blockResult.data.length === 0) {
            return NextResponse.json(
              { success: false, message: 'No data found in KG 2 subject block' },
              { status: 404 }
            );
          }
          const normalize = (n: unknown) => (n ? String(n).trim().toLowerCase() : '');
          const targetName = normalize(studentName);
          for (let i = 0; i < blockResult.data.length; i++) {
            const row = blockResult.data[i] || [];
            const nameInBlock = normalize(row[0]);
            if (nameInBlock === targetName) {
              foundRowIndex = cfg.startRow + i;
              break;
            }
          }
        }

        if (foundRowIndex === -1) {
          return NextResponse.json(
            { success: false, message: 'Student not found in KG 2 subject block' },
            { status: 404 }
          );
        }

        updateRange = `${cfg.startCol}${foundRowIndex}:${cfg.endCol}${foundRowIndex}`;
        valuesToUpdate = [
          scores.individualTestScore?.toString() || '',
          scores.classTestScore?.toString() || '',
          totalClassScore.toString(),
          scaledClassScore.toString(),
          scores.examScore?.toString() || '',
          scaledExamScore.toString(),
          overallTotal.toString(),
          ''
        ];
      }
    }

    // KG 1 subjects: ranges within A1:S75
    if (className === 'KG 1') {
      const KG1_SUBJECT_RANGES: Record<string, { startCol: string; endCol: string; startRow: number; endRow: number }> = {
        'Literacy': { startCol: 'C', endCol: 'J', startRow: 2, endRow: 37 },
        'Numeracy': { startCol: 'L', endCol: 'S', startRow: 2, endRow: 38 },
        'Colouring': { startCol: 'C', endCol: 'J', startRow: 40, endRow: 75 },
        'Creative Arts': { startCol: 'C', endCol: 'J', startRow: 40, endRow: 76 },
        'OWOP': { startCol: 'C', endCol: 'J', startRow: 78, endRow: 114 },
        'Pre-writing': { startCol: 'L', endCol: 'S', startRow: 40, endRow: 73 },
        'Pre-Writting': { startCol: 'L', endCol: 'S', startRow: 40, endRow: 73 },
        'Writting': { startCol: 'L', endCol: 'S', startRow: 40, endRow: 73 },
        'Writing': { startCol: 'L', endCol: 'S', startRow: 40, endRow: 73 }
      };

      const cfg = KG1_SUBJECT_RANGES[subject];
      if (cfg) {
        let foundRowIndex = -1;
        const inRange = (r: number) => r >= cfg.startRow && r <= cfg.endRow;
        if (typeof rowIndex === 'number' && inRange(rowIndex)) {
          foundRowIndex = rowIndex;
        } else {
          const blockRange = `B${cfg.startRow}:${cfg.endCol}${cfg.endRow}`;
          const blockResult = await sheetsService.getSheetData(sheetName, blockRange);
          if (!blockResult.success || !blockResult.data || blockResult.data.length === 0) {
            return NextResponse.json(
              { success: false, message: 'No data found in KG 1 subject block' },
              { status: 404 }
            );
          }
          const normalize = (n: unknown) => (n ? String(n).trim().toLowerCase() : '');
          const targetName = normalize(studentName);
          for (let i = 0; i < blockResult.data.length; i++) {
            const row = blockResult.data[i] || [];
            const nameInBlock = normalize(row[0]);
            if (nameInBlock === targetName) {
              foundRowIndex = cfg.startRow + i;
              break;
            }
          }
        }

        if (foundRowIndex === -1) {
          return NextResponse.json(
            { success: false, message: 'Student not found in KG 1 subject block' },
            { status: 404 }
          );
        }

        updateRange = `${cfg.startCol}${foundRowIndex}:${cfg.endCol}${foundRowIndex}`;
        valuesToUpdate = [
          scores.individualTestScore?.toString() || '',
          scores.classTestScore?.toString() || '',
          totalClassScore.toString(),
          scaledClassScore.toString(),
          scores.examScore?.toString() || '',
          scaledExamScore.toString(),
          overallTotal.toString(),
          ''
        ];
      }
    }
    // BS 2 subjects: ranges within A1:S76 (same segmented layout)
    if (className === 'BS 2') {
      const BS2_SUBJECT_RANGES: Record<string, { startCol: string; endCol: string; startRow: number; endRow: number }> = {
        'English': { startCol: 'C', endCol: 'J', startRow: 2, endRow: 19 },
        'Mathematics': { startCol: 'L', endCol: 'S', startRow: 2, endRow: 19 },
        'Science': { startCol: 'C', endCol: 'J', startRow: 21, endRow: 38 },
        'Computing': { startCol: 'C', endCol: 'J', startRow: 59, endRow: 76 },
        'History': { startCol: 'L', endCol: 'S', startRow: 40, endRow: 57 },
        'R.M.E': { startCol: 'L', endCol: 'S', startRow: 59, endRow: 76 },
        'Asante - Twi': { startCol: 'L', endCol: 'S', startRow: 21, endRow: 38 },
        'Creative Arts': { startCol: 'C', endCol: 'J', startRow: 40, endRow: 57 }
      };

      const cfg = BS2_SUBJECT_RANGES[subject];
      if (cfg) {
        let foundRowIndex = -1;
        const inRange = (r: number) => r >= cfg.startRow && r <= cfg.endRow;
        if (typeof rowIndex === 'number' && inRange(rowIndex)) {
          foundRowIndex = rowIndex;
        } else {
          const blockRange = `B${cfg.startRow}:${cfg.endCol}${cfg.endRow}`;
          const blockResult = await sheetsService.getSheetData(sheetName, blockRange);
          if (!blockResult.success || !blockResult.data || blockResult.data.length === 0) {
            return NextResponse.json(
              { success: false, message: 'No data found in BS 2 subject block' },
              { status: 404 }
            );
          }
          const normalize = (n: unknown) => (n ? String(n).trim().toLowerCase() : '');
          const targetName = normalize(studentName);
          for (let i = 0; i < blockResult.data.length; i++) {
            const row = blockResult.data[i] || [];
            const nameInBlock = normalize(row[0]);
            if (nameInBlock === targetName) {
              foundRowIndex = cfg.startRow + i;
              break;
            }
          }
        }

        if (foundRowIndex === -1) {
          return NextResponse.json(
            { success: false, message: 'Student not found in BS 2 subject block' },
            { status: 404 }
          );
        }

        updateRange = `${cfg.startCol}${foundRowIndex}:${cfg.endCol}${foundRowIndex}`;
        valuesToUpdate = [
          scores.individualTestScore?.toString() || '',
          scores.classTestScore?.toString() || '',
          totalClassScore.toString(),
          scaledClassScore.toString(),
          scores.examScore?.toString() || '',
          scaledExamScore.toString(),
          overallTotal.toString(),
          ''
        ];
      }
    }
    // BS 3 subjects: ranges within A1:S76 (same layout as BS 4/5)
    if (className === 'BS 3') {
      const BS3_SUBJECT_RANGES: Record<string, { startCol: string; endCol: string; startRow: number; endRow: number }> = {
        'English': { startCol: 'C', endCol: 'J', startRow: 2, endRow: 19 },
        'Mathematics': { startCol: 'L', endCol: 'S', startRow: 2, endRow: 19 },
        'Science': { startCol: 'C', endCol: 'J', startRow: 21, endRow: 38 },
        'Computing': { startCol: 'C', endCol: 'J', startRow: 59, endRow: 76 },
        'History': { startCol: 'L', endCol: 'S', startRow: 40, endRow: 57 },
        'R.M.E': { startCol: 'L', endCol: 'S', startRow: 59, endRow: 76 },
        'Asante - Twi': { startCol: 'L', endCol: 'S', startRow: 21, endRow: 38 },
        'Creative Arts': { startCol: 'C', endCol: 'J', startRow: 40, endRow: 57 }
      };

      const cfg = BS3_SUBJECT_RANGES[subject];
      if (cfg) {
        let foundRowIndex = -1;
        const inRange = (r: number) => r >= cfg.startRow && r <= cfg.endRow;
        if (typeof rowIndex === 'number' && inRange(rowIndex)) {
          foundRowIndex = rowIndex;
        } else {
          const blockRange = `B${cfg.startRow}:${cfg.endCol}${cfg.endRow}`;
          const blockResult = await sheetsService.getSheetData(sheetName, blockRange);
          if (!blockResult.success || !blockResult.data || blockResult.data.length === 0) {
            return NextResponse.json(
              { success: false, message: 'No data found in BS 3 subject block' },
              { status: 404 }
            );
          }
          const normalize = (n: unknown) => (n ? String(n).trim().toLowerCase() : '');
          const targetName = normalize(studentName);
          for (let i = 0; i < blockResult.data.length; i++) {
            const row = blockResult.data[i] || [];
            const nameInBlock = normalize(row[0]);
            if (nameInBlock === targetName) {
              foundRowIndex = cfg.startRow + i;
              break;
            }
          }
        }

        if (foundRowIndex === -1) {
          return NextResponse.json(
            { success: false, message: 'Student not found in BS 3 subject block' },
            { status: 404 }
          );
        }

        updateRange = `${cfg.startCol}${foundRowIndex}:${cfg.endCol}${foundRowIndex}`;
        valuesToUpdate = [
          scores.individualTestScore?.toString() || '',
          scores.classTestScore?.toString() || '',
          totalClassScore.toString(),
          scaledClassScore.toString(),
          scores.examScore?.toString() || '',
          scaledExamScore.toString(),
          overallTotal.toString(),
          ''
        ];
      }
    }
    // BS 5 subjects: ranges within A1:S76
    if (className === 'BS 5') {
      const BS5_SUBJECT_RANGES: Record<string, { startCol: string; endCol: string; startRow: number; endRow: number }> = {
        'English': { startCol: 'C', endCol: 'J', startRow: 2, endRow: 19 },
        'Mathematics': { startCol: 'L', endCol: 'S', startRow: 2, endRow: 19 },
        'Science': { startCol: 'C', endCol: 'J', startRow: 21, endRow: 38 },
        'Computing': { startCol: 'C', endCol: 'J', startRow: 59, endRow: 76 },
        'History': { startCol: 'L', endCol: 'S', startRow: 40, endRow: 57 },
        'R.M.E': { startCol: 'L', endCol: 'S', startRow: 59, endRow: 76 },
        'Asante - Twi': { startCol: 'L', endCol: 'S', startRow: 21, endRow: 38 },
        'Creative Arts': { startCol: 'C', endCol: 'J', startRow: 40, endRow: 57 }
      };

      const cfg = BS5_SUBJECT_RANGES[subject];
      if (cfg) {
        // Prefer explicit rowIndex if provided and in range
        let foundRowIndex = -1;
        const inRange = (r: number) => r >= cfg.startRow && r <= cfg.endRow;
        if (typeof rowIndex === 'number' && inRange(rowIndex)) {
          foundRowIndex = rowIndex;
        } else {
          // Fetch the subject block including names in column B to locate the exact row within the block
          const blockRange = `B${cfg.startRow}:${cfg.endCol}${cfg.endRow}`;
          const blockResult = await sheetsService.getSheetData(sheetName, blockRange);
          if (!blockResult.success || !blockResult.data || blockResult.data.length === 0) {
            return NextResponse.json(
              { success: false, message: 'No data found in BS 5 subject block' },
              { status: 404 }
            );
          }
          const normalize = (n: unknown) => (n ? String(n).trim().toLowerCase() : '');
          const targetName = normalize(studentName);
          for (let i = 0; i < blockResult.data.length; i++) {
            const row = blockResult.data[i] || [];
            const nameInBlock = normalize(row[0]); // Column B relative to fetched range
            if (nameInBlock === targetName) {
              foundRowIndex = cfg.startRow + i; // absolute sheet row
              break;
            }
          }
        }

        if (foundRowIndex === -1) {
          return NextResponse.json(
            { success: false, message: 'Student not found in BS 5 subject block' },
            { status: 404 }
          );
        }

        updateRange = `${cfg.startCol}${foundRowIndex}:${cfg.endCol}${foundRowIndex}`;
        valuesToUpdate = [
          scores.individualTestScore?.toString() || '',
          scores.classTestScore?.toString() || '',
          totalClassScore.toString(),
          scaledClassScore.toString(),
          scores.examScore?.toString() || '',
          scaledExamScore.toString(),
          overallTotal.toString(),
          ''
        ];
      }
    }

    // BS 4 subjects: ranges within A1:S76 (same layout as BS 5)
    if (className === 'BS 4') {
      const BS4_SUBJECT_RANGES: Record<string, { startCol: string; endCol: string; startRow: number; endRow: number }> = {
        'English': { startCol: 'C', endCol: 'J', startRow: 2, endRow: 19 },
        'Mathematics': { startCol: 'L', endCol: 'S', startRow: 2, endRow: 19 },
        'Science': { startCol: 'C', endCol: 'J', startRow: 21, endRow: 38 },
        'Computing': { startCol: 'C', endCol: 'J', startRow: 59, endRow: 76 },
        'History': { startCol: 'L', endCol: 'S', startRow: 40, endRow: 57 },
        'R.M.E': { startCol: 'L', endCol: 'S', startRow: 59, endRow: 76 },
        'Asante - Twi': { startCol: 'L', endCol: 'S', startRow: 21, endRow: 38 },
        'Creative Arts': { startCol: 'C', endCol: 'J', startRow: 40, endRow: 57 }
      };

      const cfg = BS4_SUBJECT_RANGES[subject];
      if (cfg) {
        let foundRowIndex = -1;
        const inRange = (r: number) => r >= cfg.startRow && r <= cfg.endRow;
        if (typeof rowIndex === 'number' && inRange(rowIndex)) {
          foundRowIndex = rowIndex;
        } else {
          const blockRange = `B${cfg.startRow}:${cfg.endCol}${cfg.endRow}`;
          const blockResult = await sheetsService.getSheetData(sheetName, blockRange);
          if (!blockResult.success || !blockResult.data || blockResult.data.length === 0) {
            return NextResponse.json(
              { success: false, message: 'No data found in BS 4 subject block' },
              { status: 404 }
            );
          }
          const normalize = (n: unknown) => (n ? String(n).trim().toLowerCase() : '');
          const targetName = normalize(studentName);
          for (let i = 0; i < blockResult.data.length; i++) {
            const row = blockResult.data[i] || [];
            const nameInBlock = normalize(row[0]);
            if (nameInBlock === targetName) {
              foundRowIndex = cfg.startRow + i;
              break;
            }
          }
        }

        if (foundRowIndex === -1) {
          return NextResponse.json(
            { success: false, message: 'Student not found in BS 4 subject block' },
            { status: 404 }
          );
        }

        updateRange = `${cfg.startCol}${foundRowIndex}:${cfg.endCol}${foundRowIndex}`;
        valuesToUpdate = [
          scores.individualTestScore?.toString() || '',
          scores.classTestScore?.toString() || '',
          totalClassScore.toString(),
          scaledClassScore.toString(),
          scores.examScore?.toString() || '',
          scaledExamScore.toString(),
          overallTotal.toString(),
          ''
        ];
      }
    }

    if (!updateRange) {
      return NextResponse.json(
        { success: false, message: 'Invalid subject specified' },
        { status: 400 }
      );
    }

    // Update the specific row with new scores
    await sheetsService.updateSheet(sheetName, updateRange, [valuesToUpdate]);
    
    console.log(`Successfully updated student ${studentName} in ${sheetName}`);
    
    return NextResponse.json({ 
      success: true, 
      message: `Student ${studentName} updated successfully in ${subject}`,
      data: {
        studentName,
        className,
        subject,
        term,
        updatedScores: scores
      }
    });
    
  } catch (error) {
    console.error('Error updating student data:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to update student data' },
      { status: 500 }
    );
  }
}
