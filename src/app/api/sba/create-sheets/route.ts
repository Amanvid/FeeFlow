import { NextRequest, NextResponse } from 'next/server';
import { GoogleSheetsService } from '@/lib/google-sheets';

export async function POST(request: NextRequest) {
  try {
    const sheetsService = new GoogleSheetsService();
    
    // Create SBA Config sheet
    console.log('Creating SBA Config sheet...');
    const configResult = await sheetsService.createSheet('SBA Config');
    console.log('SBA Config sheet result:', configResult);

    if (configResult.success) {
      // Add config data to the sheet
      const configData = [
        ['Campus : Radiant'],
        ['Total Attendance 54'],
        ['Closing Term : 30-Jul-25'],
        ['Next Term Begins : 2-Sep-25'],
        ['Semester / Term : Third'],
        ['Position : 22nd'],
        ['To include Position Yes']
      ];
      
      await sheetsService.updateSheet('SBA Config', 'A1:A7', configData);
      console.log('SBA Config data added successfully');
    }

    // Create class-specific SBA sheets
    const classSheets = ['SBA Creche', 'SBA BS1', 'SBA BS2', 'SBA BS3', 'SBA BS4', 'SBA BS5'];
    
    for (const sheetName of classSheets) {
      console.log(`Creating ${sheetName} sheet...`);
      const result = await sheetsService.createSheet(sheetName);
      console.log(`${sheetName} sheet result:`, result);

      if (result.success) {
        // Add headers for the class SBA sheet
        const headers = [
          ['No.', 'Student Name', 'Individual Test (30mks)', 'Class Test (30mks)', 'Total Class Score (60mks)', '60 MKS SCALED TO (50%)', 'End of Term Exam (100 MKS)', '100 MKS SCALED TO (50%)', 'Overall Total', 'Position']
        ];
        
        await sheetsService.updateSheet(sheetName, 'A1:J1', headers);
        console.log(`${sheetName} headers added successfully`);

        // Add sample data
        const sampleData = [
          ['1', 'Sample Student 1', '85', '78', '163', '30', '50', '35', '65', '1'],
          ['2', 'Sample Student 2', '67', '74', '141', '30', '50', '35', '65', '2']
        ];
        
        await sheetsService.updateSheet(sheetName, 'A2:J3', sampleData);
        console.log(`${sheetName} sample data added successfully`);
      }
    }

    return NextResponse.json({ 
      success: true, 
      message: 'All SBA sheets created successfully!' 
    });
    
  } catch (error) {
    console.error('Error creating SBA sheets:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to create SBA sheets' 
    }, { status: 500 });
  }
}