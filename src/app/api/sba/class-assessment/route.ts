import { NextRequest, NextResponse } from 'next/server';
import { GoogleSheetsService } from '@/lib/google-sheets';

// Define the ranges for Creche subjects
const CRECHE_RANGES: Record<string, string> = {
  'Colouring': 'C13:J23',
  'Numeracy': 'L2:S11',
  'Scribbling': 'L13:S23',
  'Literacy': 'C2:J12'
};





// Define the ranges for Nursery 1 subjects
const NURSERY1_RANGES: Record<string, string> = {
  'Literacy': 'C3:J35',
  'Numeracy': 'L3:S35',
  'Colouring': 'C41:J73',
  'Writing': 'L39:S72',
  'Writting': 'L39:S72',
  'Pre-writing': 'L39:S72',
  'Pre-Writting': 'L39:S72'
};

// Define the ranges for Nursery 2 subjects
const NURSERY2_RANGES: Record<string, string> = {
  'Literacy': 'C1:J31',
  'Numeracy': 'L1:S31',
  'Colouring': 'C39:J70',
  'Pre-writing': 'L40:S70',
  'Pre-Writting': 'L40:S70',
  'Writing': 'L40:S70',
  'Writting': 'L40:S70'
};

// Define the ranges for KG 1 subjects
const KG1_RANGES: Record<string, string> = {
  'Literacy': 'C2:J37',
  'Numeracy': 'L2:S38',
  'Colouring': 'C40:J75',
  'Creative Arts': 'C40:J76',
  'OWOP': 'C78:J114',
  'Pre-writing': 'L40:S73',
  'Pre-Writting': 'L40:S73',
  'Writing': 'L40:S73',
  'Writting': 'L40:S73'
};

// Define the ranges for KG 2 subjects
const KG2_RANGES: Record<string, string> = {
  'Literacy': 'C2:J19',
  'Numeracy': 'L2:S19',
  'Creative Arts': 'C21:J38',
  'Pre-Writing': 'L21:S38',
  'Pre-writing': 'L21:S38',
  'Pre-Writting': 'L21:S38',
  'OWOP': 'C39:J57'
};

const BS1_RANGES: Record<string, string> = {
  'English': 'C2:J19',
  'Mathematics': 'L2:S19',
  'Asante - Twi': 'L21:S38',
  'Science': 'C21:J38',
  'Creative Arts': 'C40:J57',
  'History': 'L40:S57',
  'Computing': 'C59:J76',
  'R.M.E': 'L59:S76'
};

const BS2_RANGES: Record<string, string> = {
  'English': 'C2:J19',
  'Mathematics': 'L2:S19',
  'Asante - Twi': 'L21:S38',
  'Science': 'C21:J38',
  'Creative Arts': 'C40:J57',
  'History': 'L40:S57',
  'Computing': 'C59:J76',
  'R.M.E': 'L59:S76'
};

const BS3_RANGES: Record<string, string> = {
  'English': 'C2:J19',
  'Mathematics': 'L2:S19',
  'Asante - Twi': 'L21:S38',
  'Science': 'C21:J38',
  'Creative Arts': 'C40:J57',
  'History': 'L40:S57',
  'Computing': 'C59:J76',
  'R.M.E': 'L59:S76'
};

const BS4_RANGES: Record<string, string> = {
  'English': 'C2:J19',
  'Mathematics': 'L2:S19',
  'Asante - Twi': 'L21:S38',
  'Science': 'C21:J38',
  'Creative Arts': 'C40:J57',
  'History': 'L40:S57',
  'Computing': 'C59:J76',
  'R.M.E': 'L59:S76'
};

const BS5_RANGES: Record<string, string> = {
  'English': 'C2:J19',
  'Mathematics': 'L2:S19',
  'Asante - Twi': 'L21:S38',
  'Science': 'C21:J38',
  'Creative Arts': 'C40:J57',
  'History': 'L40:S57',
  'Computing': 'C59:J76',
  'R.M.E': 'L59:S76'
};

// Define the columns mapping (8 columns)
const SCORE_COLUMNS = [
  'individualTestScore',
  'classTestScore',
  'totalClassScore',
  'scaledClassScore',
  'examScore',
  'scaledExamScore',
  'overallTotal',
  'position'
];

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const className = searchParams.get('className');
    const subject = searchParams.get('subject');
    const term = searchParams.get('term');

    if (!className || !subject) {
      return NextResponse.json(
        { error: 'Class name and subject are required' },
        { status: 400 }
      );
    }

    const googleSheetsService = new GoogleSheetsService();

    if (className === 'Creche') {
      // 1. Fetch Names from A1:B23
      const namesResult = await googleSheetsService.getSheetData('SBA Creche', 'A1:B23');
      if (!namesResult.success || !namesResult.data) {
        throw new Error('Failed to fetch student names from SBA Creche sheet');
      }
      
      // Parse names (Row 1 might be header, data starts from Row 2?)
      // The range A1:B23 includes 23 rows.
      // Assuming Row 1 is header.
      const nameRows = namesResult.data;

      // 2. Determine the range for the subject
      const subjectRange = CRECHE_RANGES[subject];
      
      let scoreData: any[][] = [];
      let rangeStartRow = 0;
      let rangeEndRow = 0;

      if (subjectRange) {
        const scoresResult = await googleSheetsService.getSheetData('SBA Creche', subjectRange);
        if (scoresResult.success && scoresResult.data) {
          scoreData = scoresResult.data;
          
          // Parse start and end row from range string (e.g., "C13:J23")
          const match = subjectRange.match(/[A-Z]+(\d+):[A-Z]+(\d+)/);
          if (match && match[1] && match[2]) {
            rangeStartRow = parseInt(match[1], 10);
            rangeEndRow = parseInt(match[2], 10);
          }
        }
      }

      // 3. Map students and scores
      // We iterate through the name rows.
      // Row index in nameRows array: i
      // Sheet Row Index: i + 1 (since A1 is start)
      
      const records = [];
      
      for (let i = 0; i < nameRows.length; i++) {
        // Skip header if it looks like one (e.g., "Name", "No")
        // Or just assume Row 1 (index 0) is header if the content suggests it.
        // User said "Names are on A1:B23".
        // Usually A1 is header.
        
        const sheetRowIndex = i + 1;
        const nameRow = nameRows[i];
        
        // Filter out rows that are not within the valid range for this subject
        if (rangeStartRow > 0 && rangeEndRow > 0) {
            if (sheetRowIndex < rangeStartRow || sheetRowIndex > rangeEndRow) {
                continue;
            }
        }
        
        // Expecting Column A: ID/No, Column B: Name
        const studentName = nameRow[1]; 
        
        if (!studentName || studentName === 'Name' || studentName === 'Student Name') {
          continue; // Skip header or empty
        }

        // Check if this student has scores in the subject range
        // The subject range covers rows [rangeStartRow, rangeEndRow]
        // We need to map the Sheet Row Index to the Score Data Array Index.
        // Score Data Index = Sheet Row Index - rangeStartRow
        
        let scores: Record<string, string> = {};
        
        if (rangeStartRow > 0) {
            const scoreIndex = sheetRowIndex - rangeStartRow;
            if (scoreIndex >= 0 && scoreIndex < scoreData.length) {
                const rowScores = scoreData[scoreIndex];
                // Map the 8 columns
                SCORE_COLUMNS.forEach((col, idx) => {
                    scores[col] = rowScores[idx] || '0';
                });
            }
        }

        // If no scores found, fill with defaults
        if (Object.keys(scores).length === 0) {
             SCORE_COLUMNS.forEach(col => {
                scores[col] = '0';
            });
        }

        records.push({
          id: `creche-${sheetRowIndex}`, // Simple ID
          studentName: studentName,
          className: 'Creche',
          ...scores
        });
      }

      return NextResponse.json({
        className: 'Creche',
        subject,
        term,
        records
      });

    } else if (className === 'Nursery 1') {
      // 1. Fetch Names from A1:B80 (Covering all possible rows for Nursery 1)
      const namesResult = await googleSheetsService.getSheetData('SBA Nursery 1', 'A1:B80');
      if (!namesResult.success || !namesResult.data) {
        throw new Error('Failed to fetch student names from SBA Nursery 1 sheet');
      }
      
      const nameRows = namesResult.data;

      // 2. Determine the range for the subject
      const subjectRange = NURSERY1_RANGES[subject];
      
      let scoreData: any[][] = [];
      let rangeStartRow = 0;
      let rangeEndRow = 0;

      if (subjectRange) {
        const scoresResult = await googleSheetsService.getSheetData('SBA Nursery 1', subjectRange);
        if (scoresResult.success && scoresResult.data) {
          scoreData = scoresResult.data;
          
          // Parse start and end row from range string (e.g., "C3:J35")
          const match = subjectRange.match(/[A-Z]+(\d+):[A-Z]+(\d+)/);
          if (match && match[1] && match[2]) {
            rangeStartRow = parseInt(match[1], 10);
            rangeEndRow = parseInt(match[2], 10);
          }
        }
      }

      // 3. Map students and scores strictly within the score range to avoid duplicates
      const records = [];
      
      if (rangeStartRow > 0 && scoreData.length > 0) {
        for (let i = 0; i < scoreData.length; i++) {
          const sheetRowIndex = rangeStartRow + i;
          if (sheetRowIndex < rangeStartRow || sheetRowIndex > rangeEndRow) continue;
          const nameRow = nameRows[sheetRowIndex - 1] || [];
          const studentName = nameRow[1];
          if (!studentName || studentName === 'Name' || studentName === 'Student Name') continue;

          const rowScores = scoreData[i] || [];
          const scores: Record<string, string> = {};
          SCORE_COLUMNS.forEach((col, idx) => {
            scores[col] = rowScores[idx] || '0';
          });

          records.push({
            id: `nursery1-${sheetRowIndex}`,
            studentName,
            className: 'Nursery 1',
            ...scores
          });
        }
      }

      return NextResponse.json({
        className: 'Nursery 1',
        subject,
        term,
        records
      });

    } else if (className === 'Nursery 2') {
      // 1. Fetch Names from A1:S70 (as requested for Nursery 2)
      const namesResult = await googleSheetsService.getSheetData('SBA Nursery 2', 'A1:S70');
      if (!namesResult.success || !namesResult.data) {
        throw new Error('Failed to fetch student names from SBA Nursery 2 sheet');
      }
      
      const nameRows = namesResult.data;

      // 2. Determine the range for the subject
      const subjectRange = NURSERY2_RANGES[subject];
      
      let scoreData: any[][] = [];
      let rangeStartRow = 0;
      let rangeEndRow = 0;

      if (subjectRange) {
        const scoresResult = await googleSheetsService.getSheetData('SBA Nursery 2', subjectRange);
        if (scoresResult.success && scoresResult.data) {
          scoreData = scoresResult.data;
          
          // Parse start and end row from range string (e.g., "C3:J35")
          const match = subjectRange.match(/[A-Z]+(\d+):[A-Z]+(\d+)/);
          if (match && match[1] && match[2]) {
            rangeStartRow = parseInt(match[1], 10);
            rangeEndRow = parseInt(match[2], 10);
          }
        }
      }

      // 3. Map students and scores strictly within score range to avoid duplicates
      const records = [];
      
      if (rangeStartRow > 0 && scoreData.length > 0) {
        for (let i = 0; i < scoreData.length; i++) {
          const sheetRowIndex = rangeStartRow + i;
          if (sheetRowIndex < rangeStartRow || sheetRowIndex > rangeEndRow) continue;
          const nameRow = nameRows[sheetRowIndex - 1] || [];
          const studentName = nameRow[1];
          if (!studentName || studentName === 'Name' || studentName === 'Student Name') continue;

          const rowScores = scoreData[i] || [];
          const scores: Record<string, string> = {};
          SCORE_COLUMNS.forEach((col, idx) => {
            scores[col] = rowScores[idx] || '0';
          });

          records.push({
            id: `nursery2-${sheetRowIndex}`,
            studentName,
            className: 'Nursery 2',
            ...scores
          });
        }
      }

      return NextResponse.json({
        className: 'Nursery 2',
        subject,
        term,
        records
      });

    } else if (className === 'KG 1') {
      // Fetch Names and Scores for KG 1
      const namesResult = await googleSheetsService.getSheetData('SBA KG 1', 'A1:S114');
      if (!namesResult.success || !namesResult.data) {
        throw new Error('Failed to fetch student names from SBA KG 1 sheet');
      }
      const nameRows = namesResult.data;

      const subjectRange = KG1_RANGES[subject];
      let scoreData: any[][] = [];
      let rangeStartRow = 0;
      let rangeEndRow = 0;

      if (subjectRange) {
        const scoresResult = await googleSheetsService.getSheetData('SBA KG 1', subjectRange);
        if (scoresResult.success && scoresResult.data) {
          scoreData = scoresResult.data;
          const match = subjectRange.match(/[A-Z]+(\d+):[A-Z]+(\d+)/);
          if (match && match[1] && match[2]) {
            rangeStartRow = parseInt(match[1], 10);
            rangeEndRow = parseInt(match[2], 10);
          }
        }
      }

      const records = [];
      if (rangeStartRow > 0) {
        const rowCount = Math.max(scoreData.length, rangeEndRow - rangeStartRow + 1);
        for (let i = 0; i < rowCount; i++) {
          const sheetRowIndex = rangeStartRow + i;
          if (sheetRowIndex < rangeStartRow || sheetRowIndex > rangeEndRow) continue;
          const nameRow = nameRows[sheetRowIndex - 1] || [];
          const studentName = nameRow[1];
          if (!studentName || studentName === 'Name' || studentName === 'Student Name') continue;

          const rowScores = scoreData[i] || [];
          const scores: Record<string, string> = {};
          SCORE_COLUMNS.forEach((col, idx) => {
            scores[col] = rowScores[idx] || '0';
          });

          records.push({
            id: `kg1-${sheetRowIndex}`,
            studentName,
            className: 'KG 1',
            ...scores
          });
        }
      }

      return NextResponse.json({
        className: 'KG 1',
        subject,
        term,
        records
      });

    } else if (className === 'KG 2') {
      const namesResult = await googleSheetsService.getSheetData('SBA KG 2', 'A1:S76');
      if (!namesResult.success || !namesResult.data) {
        throw new Error('Failed to fetch student names from SBA KG 2 sheet');
      }
      const nameRows = namesResult.data;

      const subjectRange = KG2_RANGES[subject];
      let scoreData: any[][] = [];
      let rangeStartRow = 0;
      let rangeEndRow = 0;

      if (subjectRange) {
        const scoresResult = await googleSheetsService.getSheetData('SBA KG 2', subjectRange);
        if (scoresResult.success && scoresResult.data) {
          scoreData = scoresResult.data;
          const match = subjectRange.match(/[A-Z]+(\d+):[A-Z]+(\d+)/);
          if (match && match[1] && match[2]) {
            rangeStartRow = parseInt(match[1], 10);
            rangeEndRow = parseInt(match[2], 10);
          }
        }
      }

      const records = [];
      if (rangeStartRow > 0) {
        const rowCount = Math.max(scoreData.length, rangeEndRow - rangeStartRow + 1);
        for (let i = 0; i < rowCount; i++) {
          const sheetRowIndex = rangeStartRow + i;
          if (sheetRowIndex < rangeStartRow || sheetRowIndex > rangeEndRow) continue;
          const nameRow = nameRows[sheetRowIndex - 1] || [];
          const studentName = nameRow[1];
          if (!studentName || studentName === 'Name' || studentName === 'Student Name') continue;

          const rowScores = scoreData[i] || [];
          const scores: Record<string, string> = {};
          SCORE_COLUMNS.forEach((col, idx) => {
            scores[col] = rowScores[idx] || '0';
          });

          records.push({
            id: `kg2-${sheetRowIndex}`,
            studentName,
            className: 'KG 2',
            ...scores
          });
        }
      }

      return NextResponse.json({
        className: 'KG 2',
        subject,
        term,
        records
      });

    } else if (className === 'BS 1') {
      const namesResult = await googleSheetsService.getSheetData('SBA BS1', 'A1:S76');
      if (!namesResult.success || !namesResult.data) {
        throw new Error('Failed to fetch student names from SBA BS1 sheet');
      }
      const nameRows = namesResult.data;

      const subjectRange = BS1_RANGES[subject];
      let scoreData: any[][] = [];
      let rangeStartRow = 0;
      let rangeEndRow = 0;

      if (subjectRange) {
        const scoresResult = await googleSheetsService.getSheetData('SBA BS1', subjectRange);
        if (scoresResult.success && scoresResult.data) {
          scoreData = scoresResult.data;
          const match = subjectRange.match(/[A-Z]+(\d+):[A-Z]+(\d+)/);
          if (match && match[1] && match[2]) {
            rangeStartRow = parseInt(match[1], 10);
            rangeEndRow = parseInt(match[2], 10);
          }
        }
      }

      const records = [];
      if (rangeStartRow > 0 && scoreData.length > 0) {
        for (let i = 0; i < scoreData.length; i++) {
          const sheetRowIndex = rangeStartRow + i;
          if (sheetRowIndex < rangeStartRow || sheetRowIndex > rangeEndRow) continue;
          const nameRow = nameRows[sheetRowIndex - 1] || [];
          const studentName = nameRow[1];
          if (!studentName || studentName === 'Name' || studentName === 'Student Name') continue;

          const rowScores = scoreData[i] || [];
          const scores: Record<string, string> = {};
          SCORE_COLUMNS.forEach((col, idx) => {
            scores[col] = rowScores[idx] || '0';
          });

          records.push({
            id: `bs1-${sheetRowIndex}`,
            studentName,
            className: 'BS 1',
            ...scores
          });
        }
      }

      return NextResponse.json({
        className: 'BS 1',
        subject,
        term,
        records
      });

    } else if (className === 'BS 2') {
      const namesResult = await googleSheetsService.getSheetData('SBA BS2', 'A1:S76');
      if (!namesResult.success || !namesResult.data) {
        throw new Error('Failed to fetch student names from SBA BS2 sheet');
      }
      const nameRows = namesResult.data;

      const subjectRange = BS2_RANGES[subject];
      let scoreData: any[][] = [];
      let rangeStartRow = 0;
      let rangeEndRow = 0;

      if (subjectRange) {
        const scoresResult = await googleSheetsService.getSheetData('SBA BS2', subjectRange);
        if (scoresResult.success && scoresResult.data) {
          scoreData = scoresResult.data;
          const match = subjectRange.match(/[A-Z]+(\d+):[A-Z]+(\d+)/);
          if (match && match[1] && match[2]) {
            rangeStartRow = parseInt(match[1], 10);
            rangeEndRow = parseInt(match[2], 10);
          }
        }
      }

      const records = [];
      if (rangeStartRow > 0 && scoreData.length > 0) {
        for (let i = 0; i < scoreData.length; i++) {
          const sheetRowIndex = rangeStartRow + i;
          if (sheetRowIndex < rangeStartRow || sheetRowIndex > rangeEndRow) continue;
          const nameRow = nameRows[sheetRowIndex - 1] || [];
          const studentName = nameRow[1];
          if (!studentName || studentName === 'Name' || studentName === 'Student Name') continue;

          const rowScores = scoreData[i] || [];
          const scores: Record<string, string> = {};
          SCORE_COLUMNS.forEach((col, idx) => {
            scores[col] = rowScores[idx] || '0';
          });

          records.push({
            id: `bs2-${sheetRowIndex}`,
            studentName,
            className: 'BS 2',
            ...scores
          });
        }
      }

      return NextResponse.json({
        className: 'BS 2',
        subject,
        term,
        records
      });

    } else if (className === 'BS 3') {
      const namesResult = await googleSheetsService.getSheetData('SBA BS3', 'A1:S76');
      if (!namesResult.success || !namesResult.data) {
        throw new Error('Failed to fetch student names from SBA BS3 sheet');
      }
      const nameRows = namesResult.data;

      const subjectRange = BS3_RANGES[subject];
      let scoreData: any[][] = [];
      let rangeStartRow = 0;
      let rangeEndRow = 0;

      if (subjectRange) {
        const scoresResult = await googleSheetsService.getSheetData('SBA BS3', subjectRange);
        if (scoresResult.success && scoresResult.data) {
          scoreData = scoresResult.data;
          const match = subjectRange.match(/[A-Z]+(\d+):[A-Z]+(\d+)/);
          if (match && match[1] && match[2]) {
            rangeStartRow = parseInt(match[1], 10);
            rangeEndRow = parseInt(match[2], 10);
          }
        }
      }

      const records = [];
      if (rangeStartRow > 0 && scoreData.length > 0) {
        for (let i = 0; i < scoreData.length; i++) {
          const sheetRowIndex = rangeStartRow + i;
          if (sheetRowIndex < rangeStartRow || sheetRowIndex > rangeEndRow) continue;
          const nameRow = nameRows[sheetRowIndex - 1] || [];
          const studentName = nameRow[1];
          if (!studentName || studentName === 'Name' || studentName === 'Student Name') continue;

          const rowScores = scoreData[i] || [];
          const scores: Record<string, string> = {};
          SCORE_COLUMNS.forEach((col, idx) => {
            scores[col] = rowScores[idx] || '0';
          });

          records.push({
            id: `bs3-${sheetRowIndex}`,
            studentName,
            className: 'BS 3',
            ...scores
          });
        }
      }

      return NextResponse.json({
        className: 'BS 3',
        subject,
        term,
        records
      });

    } else if (className === 'BS 4') {
      const namesResult = await googleSheetsService.getSheetData('SBA BS4', 'A1:S76');
      if (!namesResult.success || !namesResult.data) {
        throw new Error('Failed to fetch student names from SBA BS4 sheet');
      }
      const nameRows = namesResult.data;

      const subjectRange = BS4_RANGES[subject];
      let scoreData: any[][] = [];
      let rangeStartRow = 0;
      let rangeEndRow = 0;

      if (subjectRange) {
        const scoresResult = await googleSheetsService.getSheetData('SBA BS4', subjectRange);
        if (scoresResult.success && scoresResult.data) {
          scoreData = scoresResult.data;
          const match = subjectRange.match(/[A-Z]+(\d+):[A-Z]+(\d+)/);
          if (match && match[1] && match[2]) {
            rangeStartRow = parseInt(match[1], 10);
            rangeEndRow = parseInt(match[2], 10);
          }
        }
      }

      const records = [];
      if (rangeStartRow > 0 && scoreData.length > 0) {
        for (let i = 0; i < scoreData.length; i++) {
          const sheetRowIndex = rangeStartRow + i;
          if (sheetRowIndex < rangeStartRow || sheetRowIndex > rangeEndRow) continue;
          const nameRow = nameRows[sheetRowIndex - 1] || [];
          const studentName = nameRow[1];
          if (!studentName || studentName === 'Name' || studentName === 'Student Name') continue;

          const rowScores = scoreData[i] || [];
          const scores: Record<string, string> = {};
          SCORE_COLUMNS.forEach((col, idx) => {
            scores[col] = rowScores[idx] || '0';
          });

          records.push({
            id: `bs4-${sheetRowIndex}`,
            studentName,
            className: 'BS 4',
            ...scores
          });
        }
      }

      return NextResponse.json({
        className: 'BS 4',
        subject,
        term,
        records
      });

    } else if (className === 'BS 5') {
      const namesResult = await googleSheetsService.getSheetData('SBA BS5', 'A1:S76');
      if (!namesResult.success || !namesResult.data) {
        throw new Error('Failed to fetch student names from SBA BS5 sheet');
      }
      const nameRows = namesResult.data;

      const subjectRange = BS5_RANGES[subject];
      let scoreData: any[][] = [];
      let rangeStartRow = 0;
      let rangeEndRow = 0;

      if (subjectRange) {
        const scoresResult = await googleSheetsService.getSheetData('SBA BS5', subjectRange);
        if (scoresResult.success && scoresResult.data) {
          scoreData = scoresResult.data;
          const match = subjectRange.match(/[A-Z]+(\d+):[A-Z]+(\d+)/);
          if (match && match[1] && match[2]) {
            rangeStartRow = parseInt(match[1], 10);
            rangeEndRow = parseInt(match[2], 10);
          }
        }
      }

      const records = [];
      if (rangeStartRow > 0 && scoreData.length > 0) {
        for (let i = 0; i < scoreData.length; i++) {
          const sheetRowIndex = rangeStartRow + i;
          if (sheetRowIndex < rangeStartRow || sheetRowIndex > rangeEndRow) continue;
          const nameRow = nameRows[sheetRowIndex - 1] || [];
          const studentName = nameRow[1];
          if (!studentName || studentName === 'Name' || studentName === 'Student Name') continue;

          const rowScores = scoreData[i] || [];
          const scores: Record<string, string> = {};
          SCORE_COLUMNS.forEach((col, idx) => {
            scores[col] = rowScores[idx] || '0';
          });

          records.push({
            id: `bs5-${sheetRowIndex}`,
            studentName,
            className: 'BS 5',
            ...scores
          });
        }
      }

      return NextResponse.json({
        className: 'BS 5',
        subject,
        term,
        records
      });

    } else {
        // Fallback for other classes (placeholder logic or existing logic if we had it)
        // For now, return empty or error, but since the user focused on Creche, I'll just return empty for others to avoid 404.
         return NextResponse.json({
            className,
            subject,
            term,
            records: []
        });
    }

  } catch (error) {
    console.error('Error fetching SBA data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch SBA data' },
      { status: 500 }
    );
  }
}
