import { NextRequest, NextResponse } from 'next/server';
import { GoogleSheetsService } from '@/lib/google-sheets';

export async function POST(request: NextRequest) {
  try {
    const { studentName, className, subject, term, scores } = await request.json();
    
    if (!studentName || !className || !subject || !term || !scores) {
      return NextResponse.json(
        { success: false, message: 'Missing required fields' },
        { status: 400 }
      );
    }

    const sheetsService = new GoogleSheetsService();
    
    // Construct sheet name based on class and term
    const sheetName = `SBA ${className}`;
    
    console.log(`Adding new student ${studentName} to ${sheetName} for ${subject} - ${term}`);
    
    // Get existing data to find the next available row
    const result = await sheetsService.getSheetData(sheetName);
    
    if (!result.success || !result.data || result.data.length <= 1) {
      return NextResponse.json(
        { success: false, message: 'No existing data found in sheet' },
        { status: 404 }
      );
    }
    
    const existingData = result.data;

    // Find the first empty row (row with no student name in column B)
    let emptyRowIndex = -1;
    for (let i = 3; i < existingData.length; i++) { // Start from row 4 (index 3) to skip headers
      if (!existingData[i][1] || existingData[i][1].trim() === '') { // Column B is Student Name
        emptyRowIndex = i + 1; // +1 because sheets are 1-indexed
        break;
      }
    }

    if (emptyRowIndex === -1) {
      // If no empty row found, append to the end
      emptyRowIndex = existingData.length + 1;
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
    
    if (subject === 'Literacy') {
      // Literacy columns: A (No.), B (Student Name), C (Individual Test), D (Class Test), E (Total), F (Scaled), G (End of Term Exams), H (100 Scaled), I (Overall Total), J (Position)
      updateRange = `A${emptyRowIndex}:J${emptyRowIndex}`;
      valuesToUpdate = [
        emptyRowIndex.toString(), // No.
        studentName, // Student Name
        scores.individualTestScore?.toString() || '',
        scores.classTestScore?.toString() || '',
        totalClassScore.toString(), // Total Class Score
        scaledClassScore.toString(), // Scaled Class Score
        scores.examScore?.toString() || '',
        scaledExamScore.toString(), // 100 Scaled to 50%
        overallTotal.toString(), // Overall Total
        '' // Position - will be calculated later
      ];
    } else if (subject === 'Numeracy') {
      // Numeracy columns: A (No.), B (Student Name), L (Individual Test), M (Class Test), N (Total), O (Scaled), P (End of Term Exams), Q (100 Scaled), R (Overall Total), S (Position)
      // Note: We write to A:B for Name, and L:S for Scores. 
      updateRange = `A${emptyRowIndex}:B${emptyRowIndex}, L${emptyRowIndex}:S${emptyRowIndex}`;
      valuesToUpdate = [
        emptyRowIndex.toString(), // No.
        studentName, // Student Name
        scores.individualTestScore?.toString() || '',
        scores.classTestScore?.toString() || '',
        totalClassScore.toString(), // Total Class Score
        scaledClassScore.toString(), // Scaled Class Score
        scores.examScore?.toString() || '',
        scaledExamScore.toString(), // 100 Scaled to 50%
        overallTotal.toString(), // Overall Total
        '' // Position - will be calculated later
      ];
    } else if (subject === 'Colouring') {
      // Colouring section starts at row 39. Literacy starts at row 1. Offset is 38.
      const colouringRowIndex = emptyRowIndex + 38;
      updateRange = `A${colouringRowIndex}:J${colouringRowIndex}`;
      valuesToUpdate = [
        (emptyRowIndex - 3).toString(), // No. (adjusted for section - approximate)
        studentName, // Student Name
        scores.individualTestScore?.toString() || '',
        scores.classTestScore?.toString() || '',
        totalClassScore.toString(), // Total Class Score
        scaledClassScore.toString(), // Scaled Class Score
        scores.examScore?.toString() || '',
        scaledExamScore.toString(), // 100 Scaled to 50%
        overallTotal.toString(), // Overall Total
        '' // Position - will be calculated later
      ];
    } else if (subject === 'Scribbling' || subject === 'Pre-writing') {
      // Pre-writing/Scribbling section starts at row 39.
      const preWritingRowIndex = emptyRowIndex + 38;
      updateRange = `A${preWritingRowIndex}:B${preWritingRowIndex}, L${preWritingRowIndex}:S${preWritingRowIndex}`;
      valuesToUpdate = [
        (emptyRowIndex - 3).toString(), // No. (adjusted for section)
        studentName, // Student Name
        scores.individualTestScore?.toString() || '',
        scores.classTestScore?.toString() || '',
        totalClassScore.toString(), // Total Class Score
        scaledClassScore.toString(), // Scaled Class Score
        scores.examScore?.toString() || '',
        scaledExamScore.toString(), // 100 Scaled to 50%
        overallTotal.toString(), // Overall Total
        '' // Position - will be calculated later
      ];
    }

    if (!updateRange) {
      return NextResponse.json(
        { success: false, message: 'Invalid subject specified' },
        { status: 400 }
      );
    }

    // Update the sheet with new student data
    await sheetsService.updateSheet(sheetName, updateRange, [valuesToUpdate]);
    
    console.log(`Successfully added student ${studentName} to ${sheetName}`);
    
    return NextResponse.json({ 
      success: true, 
      message: `Student ${studentName} added successfully to ${subject}`,
      data: {
        studentName,
        className,
        subject,
        term,
        scores,
        rowNumber: emptyRowIndex
      }
    });
    
  } catch (error) {
    console.error('Error adding student data:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to add student data' },
      { status: 500 }
    );
  }
}
