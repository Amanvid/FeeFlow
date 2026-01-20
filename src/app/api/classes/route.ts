import { NextRequest, NextResponse } from 'next/server';
import { GoogleSheetsService } from '@/lib/google-sheets';
import { NEW_METADATA, OLD_METADATA } from '@/lib/definitions';

export async function GET(request: NextRequest) {
  try {
    const sheetsService = new GoogleSheetsService();

    // Get data from both metadata sheets
    const [newResult, oldResult] = await Promise.all([
      sheetsService.getSheetData(NEW_METADATA, 'A1:Z1000'),
      sheetsService.getSheetData(OLD_METADATA, 'A1:Z1000')
    ]);

    const combinedData = [
      ...(newResult.success ? newResult.data : []),
      ...(oldResult.success ? oldResult.data : [])
    ];

    if (combinedData.length === 0) {
      return NextResponse.json(
        { success: true, classes: [], message: 'No data found in metadata sheets' },
        { status: 200 }
      );
    }

    // Extract unique classes from the data
    // Assuming the class/grade information is in a specific column
    // Based on previous tests, let's check common column positions
    const classes = new Set<string>();

    // Look for class/grade data in different possible columns
    combinedData.forEach((row: any, index: number) => {
      // Skip header rows (index 0 and potentially another 0 if merged simply)
      // Actually, since we spread newResult.data and oldResult.data, 
      // index 0 is and index newResult.data.length is a header.
      // But Set will handle duplicate headers if they match filtering.
      // Better to check if first column is 'No.'
      if (row[0] === 'No.') return;

      // Check various possible column positions for class/grade data
      // Common positions based on typical school data structures
      const possibleClassColumns = [2, 3, 4, 5, 6]; // Columns C, D, E, F, G (0-indexed)

      possibleClassColumns.forEach((colIndex: number) => {
        const cell = row[colIndex] as unknown;
        if (typeof cell === 'string') {
          const value = cell.trim();
          // Filter out obvious non-class data and empty values
          if (value &&
            value.length > 1 &&
            value.length < 20 &&
            !value.toLowerCase().includes('fee') &&
            !value.toLowerCase().includes('amount') &&
            !value.toLowerCase().includes('date') &&
            !value.toLowerCase().includes('total') &&
            !value.toLowerCase().includes('balance') &&
            value !== 'Male' &&
            value !== 'Female' &&
            !value.match(/^\d+$/) // Not just numbers
          ) {
            // Additional filtering for common class patterns
            if (value.match(/^(Class|Grade|Form|Year|Level)\s*\d+[A-Z]?$/i) ||
              value.match(/^\d+[A-Z]?$/i) ||
              value.match(/^(Creche|KG|Nursery|Primary|JHS|SHS|BS)\s*\d*$/i) ||
              value.match(/^(Creche|Nursery|KG\s*\d*|Primary\s*\d*|JHS\s*\d*|SHS\s*\d*|BS\s*\d*)$/i)) {
              classes.add(value);
            }
          }
        }
      });
    });

    // If no classes were found with the filtering, try a simpler approach
    if (classes.size === 0) {
      // Look at the first few data rows to understand the structure better
      const sampleRows = combinedData.slice(1, Math.min(6, combinedData.length)) as string[][];
      const classColumnIndex = findClassColumn(sampleRows);

      if (classColumnIndex !== -1) {
        combinedData.forEach((row: any, index: number) => {
          if (row[0] === 'No.') return; // Skip header
          const cell = row[classColumnIndex] as unknown;
          if (typeof cell === 'string') {
            const value = cell.trim();
            if (value && value.length > 1 && value.length < 20) {
              classes.add(value);
            }
          }
        });
      }
    }

    // Convert to array and sort
    const classArray = Array.from(classes).sort((a, b) => {
      // Custom sorting for school classes
      const order = ['Creche', 'Nursery', 'KG', 'Primary', 'JHS', 'SHS', 'BS', 'Class', 'Grade', 'Form'];

      for (const prefix of order) {
        if (a.startsWith(prefix) && !b.startsWith(prefix)) return -1;
        if (!a.startsWith(prefix) && b.startsWith(prefix)) return 1;
        if (a.startsWith(prefix) && b.startsWith(prefix)) {
          return a.localeCompare(b, undefined, { numeric: true });
        }
      }

      return a.localeCompare(b, undefined, { numeric: true });
    });

    return NextResponse.json({
      success: true,
      classes: classArray,
      message: `Found ${classArray.length} classes`
    });

  } catch (error) {
    console.error('Error fetching classes:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error', classes: [] },
      { status: 500 }
    );
  }
}

// Helper function to find the most likely class column
function findClassColumn(sampleRows: string[][]): number {
  const columnScores: { [key: number]: number } = {};

  // Score each column based on class-like patterns
  sampleRows.forEach(row => {
    row.forEach((cell, colIndex) => {
      if (cell && typeof cell === 'string') {
        const value = cell.trim();

        // Score based on class patterns
        if (value.match(/^(Class|Grade|Form|Year|Level)\s*\d+[A-Z]?$/i)) scoreColumn(columnScores, colIndex, 3);
        if (value.match(/^\d+[A-Z]?$/i)) scoreColumn(columnScores, colIndex, 2);
        if (value.match(/^(Creche|KG|Nursery|Primary|JHS|SHS|BS)\s*\d*$/i)) scoreColumn(columnScores, colIndex, 3);
        if (value.length > 1 && value.length < 10 && !value.match(/^\d+$/)) scoreColumn(columnScores, colIndex, 1);
      }
    });
  });

  // Find the column with the highest score
  let bestColumn = -1;
  let bestScore = 0;

  Object.entries(columnScores).forEach(([colIndex, score]) => {
    if (score > bestScore) {
      bestScore = score;
      bestColumn = parseInt(colIndex);
    }
  });

  return bestColumn;
}

function scoreColumn(scores: { [key: number]: number }, column: number, points: number) {
  scores[column] = (scores[column] || 0) + points;
}