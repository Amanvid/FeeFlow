import { NextRequest, NextResponse } from 'next/server';
import { GoogleSheetsService } from '@/lib/google-sheets';

export async function POST(request: NextRequest) {
  try {
    const { className, subject, term } = await request.json();
    
    if (!className || !subject || !term) {
      return NextResponse.json(
        { success: false, message: 'Missing required fields' },
        { status: 400 }
      );
    }

    const sheetsService = new GoogleSheetsService();
    
    // Map class names to sheet names
    const sheetNameMap: { [key: string]: string } = {
      'Creche': 'SBA Creche',
      'KG 1': 'SBA KG 1',
      'KG 2': 'SBA KG 2',
      'BS 1': 'SBA BS1',
      'BS 2': 'SBA BS2', 
      'BS 3': 'SBA BS3',
      'BS 4': 'SBA BS4',
      'BS 5': 'SBA BS5'
    };
    
    const sheetName = sheetNameMap[className] || `SBA ${className}`;
    
    // Configuration for Creche subjects
    // We fetch from Column B (Name) to the Position Column to ensure we have Name, Total, and Position.
    // range: The range to fetch (Must include Name column B and Score/Position columns)
    // totalIdx: Index of Overall Total column relative to the fetched range (0-based)
    // posIdx: Index of Position column relative to the fetched range (0-based)
    // posCol: The absolute column letter for Position (for writing back)
    // startRow: The starting row number on the sheet (for calculating write-back coordinates)
    
    type SubjectConfig = {
      range: string;
      totalIdx: number;
      posIdx: number;
      posCol: string;
      startRow: number;
    };

    const CRECHE_CONFIG: Record<string, SubjectConfig> = {
      // Literacy: C2:J12 (Scores). Fetch B2:J12 to include Name (B).
      // Columns: B(0), C(1)... I(7=Total), J(8=Position)
      'Literacy': { range: 'B2:J12', totalIdx: 7, posIdx: 8, posCol: 'J', startRow: 2 },
      
      // Numeracy: L2:S11 (Scores). Fetch B2:S11 to include Name (B).
      // Columns: B(0)... R(16=Total), S(17=Position)
      'Numeracy': { range: 'B2:S11', totalIdx: 16, posIdx: 17, posCol: 'S', startRow: 2 },
      
      // Colouring: C13:J23 (Scores). Fetch B13:J23 to include Name (B).
      // Columns: B(0), C(1)... I(7=Total), J(8=Position)
      'Colouring': { range: 'B13:J23', totalIdx: 7, posIdx: 8, posCol: 'J', startRow: 13 },
      
      // Scribbling: L13:S23 (Scores). Fetch B13:S23 to include Name (B).
      // Columns: B(0)... R(16=Total), S(17=Position)
      'Scribbling': { range: 'B13:S23', totalIdx: 16, posIdx: 17, posCol: 'S', startRow: 13 }
    };

    const NURSERY1_CONFIG: Record<string, SubjectConfig> = {
      'Literacy': { range: 'B3:J35', totalIdx: 7, posIdx: 8, posCol: 'J', startRow: 3 },
      'Numeracy': { range: 'B3:S35', totalIdx: 16, posIdx: 17, posCol: 'S', startRow: 3 },
      'Colouring': { range: 'B41:J73', totalIdx: 7, posIdx: 8, posCol: 'J', startRow: 41 },
      'Writing': { range: 'B41:S73', totalIdx: 16, posIdx: 17, posCol: 'S', startRow: 41 },
      'Writting': { range: 'B41:S73', totalIdx: 16, posIdx: 17, posCol: 'S', startRow: 41 }
    };

    const BS5_CONFIG: Record<string, SubjectConfig> = {
      // For left-side subjects (C..J), fetch B..J to include names at B
      'English': { range: 'B2:J19', totalIdx: 7, posIdx: 8, posCol: 'J', startRow: 2 },
      'Science': { range: 'B21:J38', totalIdx: 7, posIdx: 8, posCol: 'J', startRow: 21 },
      'Creative Arts': { range: 'B40:J57', totalIdx: 7, posIdx: 8, posCol: 'J', startRow: 40 },
      'Computing': { range: 'B59:J76', totalIdx: 7, posIdx: 8, posCol: 'J', startRow: 59 },
      // For right-side subjects (L..S), fetch B..S and set indices for R/S
      'Mathematics': { range: 'B2:S19', totalIdx: 16, posIdx: 17, posCol: 'S', startRow: 2 },
      'History': { range: 'B40:S57', totalIdx: 16, posIdx: 17, posCol: 'S', startRow: 40 },
      'R.M.E': { range: 'B59:S76', totalIdx: 16, posIdx: 17, posCol: 'S', startRow: 59 },
      'Asante - Twi': { range: 'B21:S38', totalIdx: 16, posIdx: 17, posCol: 'S', startRow: 21 }
    };

    let config: SubjectConfig | undefined;

    if (className === 'Creche') {
      config = CRECHE_CONFIG[subject];
    } else if (className === 'Nursery 1') {
      config = NURSERY1_CONFIG[subject];
    } else if (className === 'BS 5') {
      config = BS5_CONFIG[subject];
    } else if (className === 'BS 4') {
      const BS4_CONFIG: Record<string, SubjectConfig> = {
        'English': { range: 'B2:J19', totalIdx: 7, posIdx: 8, posCol: 'J', startRow: 2 },
        'Science': { range: 'B21:J38', totalIdx: 7, posIdx: 8, posCol: 'J', startRow: 21 },
        'Creative Arts': { range: 'B40:J57', totalIdx: 7, posIdx: 8, posCol: 'J', startRow: 40 },
        'Computing': { range: 'B59:J76', totalIdx: 7, posIdx: 8, posCol: 'J', startRow: 59 },
        'Mathematics': { range: 'B2:S19', totalIdx: 16, posIdx: 17, posCol: 'S', startRow: 2 },
        'History': { range: 'B40:S57', totalIdx: 16, posIdx: 17, posCol: 'S', startRow: 40 },
        'R.M.E': { range: 'B59:S76', totalIdx: 16, posIdx: 17, posCol: 'S', startRow: 59 },
        'Asante - Twi': { range: 'B21:S38', totalIdx: 16, posIdx: 17, posCol: 'S', startRow: 21 }
      };
      config = BS4_CONFIG[subject];
    } else if (className === 'BS 3') {
      const BS3_CONFIG: Record<string, SubjectConfig> = {
        'English': { range: 'B2:J19', totalIdx: 7, posIdx: 8, posCol: 'J', startRow: 2 },
        'Science': { range: 'B21:J38', totalIdx: 7, posIdx: 8, posCol: 'J', startRow: 21 },
        'Creative Arts': { range: 'B40:J57', totalIdx: 7, posIdx: 8, posCol: 'J', startRow: 40 },
        'Computing': { range: 'B59:J76', totalIdx: 7, posIdx: 8, posCol: 'J', startRow: 59 },
        'Mathematics': { range: 'B2:S19', totalIdx: 16, posIdx: 17, posCol: 'S', startRow: 2 },
        'History': { range: 'B40:S57', totalIdx: 16, posIdx: 17, posCol: 'S', startRow: 40 },
        'R.M.E': { range: 'B59:S76', totalIdx: 16, posIdx: 17, posCol: 'S', startRow: 59 },
        'Asante - Twi': { range: 'B21:S38', totalIdx: 16, posIdx: 17, posCol: 'S', startRow: 21 }
      };
      config = BS3_CONFIG[subject];
    } else if (className === 'BS 2') {
      const BS2_CONFIG: Record<string, SubjectConfig> = {
        'English': { range: 'B2:J19', totalIdx: 7, posIdx: 8, posCol: 'J', startRow: 2 },
        'Science': { range: 'B21:J38', totalIdx: 7, posIdx: 8, posCol: 'J', startRow: 21 },
        'Creative Arts': { range: 'B40:J57', totalIdx: 7, posIdx: 8, posCol: 'J', startRow: 40 },
        'Computing': { range: 'B59:J76', totalIdx: 7, posIdx: 8, posCol: 'J', startRow: 59 },
        'Mathematics': { range: 'B2:S19', totalIdx: 16, posIdx: 17, posCol: 'S', startRow: 2 },
        'History': { range: 'B40:S57', totalIdx: 16, posIdx: 17, posCol: 'S', startRow: 40 },
        'R.M.E': { range: 'B59:S76', totalIdx: 16, posIdx: 17, posCol: 'S', startRow: 59 },
        'Asante - Twi': { range: 'B21:S38', totalIdx: 16, posIdx: 17, posCol: 'S', startRow: 21 }
      };
      config = BS2_CONFIG[subject];
    } else if (className === 'BS 1') {
      const BS1_CONFIG: Record<string, SubjectConfig> = {
        'English': { range: 'B2:J19', totalIdx: 7, posIdx: 8, posCol: 'J', startRow: 2 },
        'Science': { range: 'B21:J38', totalIdx: 7, posIdx: 8, posCol: 'J', startRow: 21 },
        'Creative Arts': { range: 'B40:J57', totalIdx: 7, posIdx: 8, posCol: 'J', startRow: 40 },
        'Computing': { range: 'B59:J76', totalIdx: 7, posIdx: 8, posCol: 'J', startRow: 59 },
        'Mathematics': { range: 'B2:S19', totalIdx: 16, posIdx: 17, posCol: 'S', startRow: 2 },
        'History': { range: 'B40:S57', totalIdx: 16, posIdx: 17, posCol: 'S', startRow: 40 },
        'R.M.E': { range: 'B59:S76', totalIdx: 16, posIdx: 17, posCol: 'S', startRow: 59 },
        'Asante - Twi': { range: 'B21:S38', totalIdx: 16, posIdx: 17, posCol: 'S', startRow: 21 }
      };
      config = BS1_CONFIG[subject];
    } else if (className === 'KG 2') {
      const KG2_CONFIG: Record<string, SubjectConfig> = {
        'Literacy': { range: 'B2:J19', totalIdx: 7, posIdx: 8, posCol: 'J', startRow: 2 },
        'Creative Arts': { range: 'B21:J38', totalIdx: 7, posIdx: 8, posCol: 'J', startRow: 21 },
        'Numeracy': { range: 'B2:S19', totalIdx: 16, posIdx: 17, posCol: 'S', startRow: 2 },
        'Pre-Writing': { range: 'B21:S38', totalIdx: 16, posIdx: 17, posCol: 'S', startRow: 21 },
        'Pre-writing': { range: 'B21:S38', totalIdx: 16, posIdx: 17, posCol: 'S', startRow: 21 },
        'Pre-Writting': { range: 'B21:S38', totalIdx: 16, posIdx: 17, posCol: 'S', startRow: 21 },
        'OWOP': { range: 'B39:J57', totalIdx: 7, posIdx: 8, posCol: 'J', startRow: 39 }
      };
      config = KG2_CONFIG[subject];
    } else if (className === 'KG 1') {
      const KG1_CONFIG: Record<string, SubjectConfig> = {
        'Literacy': { range: 'B2:J37', totalIdx: 7, posIdx: 8, posCol: 'J', startRow: 2 },
        'Colouring': { range: 'B40:J75', totalIdx: 7, posIdx: 8, posCol: 'J', startRow: 40 },
        'Creative Arts': { range: 'B40:J76', totalIdx: 7, posIdx: 8, posCol: 'J', startRow: 40 },
        'Numeracy': { range: 'B2:S38', totalIdx: 16, posIdx: 17, posCol: 'S', startRow: 2 },
        'Pre-writing': { range: 'B40:S73', totalIdx: 16, posIdx: 17, posCol: 'S', startRow: 40 },
        'Pre-Writting': { range: 'B40:S73', totalIdx: 16, posIdx: 17, posCol: 'S', startRow: 40 },
        'Writting': { range: 'B40:S73', totalIdx: 16, posIdx: 17, posCol: 'S', startRow: 40 },
        'Writing': { range: 'B40:S73', totalIdx: 16, posIdx: 17, posCol: 'S', startRow: 40 },
        'OWOP': { range: 'B78:J114', totalIdx: 7, posIdx: 8, posCol: 'J', startRow: 78 }
      };
      config = KG1_CONFIG[subject];
    }
    
    if (!config) {
      return NextResponse.json(
        { success: false, message: 'Invalid subject or subject not configured for auto-positioning' },
        { status: 400 }
      );
    }
    
    // Get current data from the specific range
    console.log(`Getting data for sheet: ${sheetName}, range: ${config.range}`);
    const result = await sheetsService.getSheetData(sheetName, config.range);
    let existingData = (result.success && result.data) ? result.data : [];
    if (existingData.length === 0) {
      const m = config.range.match(/[A-Z]+(\d+):[A-Z]+(\d+)/);
      const endRow = m && m[2] ? parseInt(m[2], 10) : config.startRow;
      const namesRange = `B${config.startRow}:B${endRow}`;
      const namesRes = await sheetsService.getSheetData(sheetName, namesRange);
      const namesData = (namesRes.success && namesRes.data) ? namesRes.data : [];
      if (namesData.length === 0) {
        return NextResponse.json(
          { success: false, message: 'No students found' },
          { status: 404 }
        );
      }
      existingData = namesData.map((row: any[]) => [row[0] || '']);
    }
    const studentsWithScores: Array<{rowIndex: number, overallTotal: number, positionColumn: string}> = [];
    
    console.log(`Processing ${existingData.length} rows of data`);
    
    for (let i = 0; i < existingData.length; i++) {
      const row = existingData[i];
      
      // Row index 0 corresponds to Name (Column B) in our fetched ranges
      const studentName = row[0]; 
      
      if (!studentName || studentName === 'Name' || studentName === 'Student Name') {
        continue; // Skip header or empty rows
      }
      
      // Get Overall Total
      const totalStr = row[config.totalIdx];
      const overallTotal = parseFloat(totalStr || '0') || 0;
      
      // We include all students, even with 0 score, to update their position (e.g. to clear it or set to last)
      // But typically we only rank those with scores? 
      // User's screenshot showed positions for students with scores. 0 score students had 0 position.
      // Let's stick to: if overallTotal > 0, we rank. If 0, we might clear position or set to 0.
      
      if (overallTotal >= 0) {
        studentsWithScores.push({
          rowIndex: config.startRow + i, // Calculate actual sheet row index
          overallTotal,
          positionColumn: config.posCol
        });
      }
    }
    
    if (studentsWithScores.length === 0) {
      return NextResponse.json(
        { success: false, message: 'No students found' },
        { status: 404 }
      );
    }
    
    // Calculate positions (1st place = highest score)
    // Filter out 0 scores for ranking? 
    // If score is 0, position should be 0 or blank?
    // Let's separate zero scores and positive scores.
    const validScores = studentsWithScores.filter(s => s.overallTotal > 0);
    const zeroScores = studentsWithScores.filter(s => s.overallTotal === 0);
    
    // Sort valid scores
    validScores.sort((a, b) => b.overallTotal - a.overallTotal);
    
    // Create position map
    const positionMap = new Map<number, number>();
    let currentPosition = 1;
    let lastScore = -1;
    
    validScores.forEach((student, index) => {
      if (student.overallTotal !== lastScore) {
        // Skip ranks for ties? e.g. 1, 1, 3? or 1, 1, 2?
        // Standard academic ranking (1224) or dense (1223)?
        // User screenshot: 90->2, 86->4, 85->6. 
        // Wait, indices:
        // 94 -> 1
        // 90 -> 2
        // 86 -> 3 (screenshot says 4?)
        // 85 -> 4 (screenshot says 6?)
        // 85 -> 4
        // 79 -> 6 (screenshot says 10?)
        
        // Let's look at the user's screenshot data again carefully.
        // "Scribbling - 1st Term"
        // 94 -> 1
        // 90 -> 2
        // 86 -> 3 (Edit 8)
        // 85 -> 4 (Edit 9)
        // 85 -> 4 (Edit 11)
        // 79 -> 6 (Edit 10)
        
        // This is standard competition ranking (1, 2, 3, 4, 4, 6). 
        // Skip counts for ties.
        // currentPosition should be index + 1.
        
        currentPosition = index + 1;
        lastScore = student.overallTotal;
      }
      positionMap.set(student.rowIndex, currentPosition);
    });
    
    // Zero scores get position 0 or empty
    zeroScores.forEach(student => {
      positionMap.set(student.rowIndex, 0);
    });
    
    // Update positions in the sheet
    const updatePromises = studentsWithScores.map(student => {
      const position = positionMap.get(student.rowIndex) || 0;
      const range = `${student.positionColumn}${student.rowIndex}`;
      
      // If position is 0, maybe write empty string? Or '0'?
      // User screenshot shows '0' for students with 0 score.
      const value = position === 0 ? '0' : position.toString();
      
      return sheetsService.updateSheet(sheetName, range, [[value]]);
    });
    
    await Promise.all(updatePromises);
    
    return NextResponse.json({
      success: true,
      message: `Updated positions for ${studentsWithScores.length} students`,
      updatedCount: studentsWithScores.length
    });
    
  } catch (error) {
    console.error('Error updating positions:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to update positions' },
      { status: 500 }
    );
  }
}
