import { NextRequest, NextResponse } from 'next/server';
import { GoogleSheetsService } from '@/lib/google-sheets';

export async function POST(request: NextRequest) {
  try {
    const sheetsService = new GoogleSheetsService();
    
    // Update SBA Creche sheet with the new structure
    console.log('Updating SBA Creche sheet with multi-subject structure...');
    
    // Literacy section headers
    const literacyHeaders = [
      ['No.', 'Student Name', 'Literacy', '', '', '', '', '', '', '', 'Numeracy', '', '', '', '', '', '', '', '']
    ];
    
    const literacySubHeaders = [
      ['', '', 'Individual Test (30mks)', 'Class Test (30mks)', 'Total Class Score (60mks)', '60 SCALED TO (50%)', 'End of Term Exams', '100 SCALED TO (50%)', 'Overall Total', 'Position', 'Individual Test (30mks)', 'Class Test (30mks)', 'Total Class Score (60mks)', '60 SCALED TO (50%)', 'End of Term Exams', '100 SCALED TO (50%)', 'Overall Total', 'Position']
    ];

    // Colouring and Scribbling section headers
    const colouringHeaders = [
      ['No.', 'Student Name', 'Colouring', '', '', '', '', '', '', '', 'Scribbling', '', '', '', '', '', '', '', '']
    ];
    
    const colouringSubHeaders = [
      ['', '', 'Individual Test (30mks)', 'Class Test (30mks)', 'Total Class Score (60mks)', '60 SCALED TO (50%)', 'End of Term Exams', '100 SCALED TO (50%)', 'Overall Total', 'Position', 'Individual Test (30mks)', 'Class Test (30mks)', 'Total Class Score (60mks)', '60 SCALED TO (50%)', 'End of Term Exams', '100 SCALED TO (50%)', 'Overall Total', 'Position']
    ];

    // Sample data for Literacy and Numeracy
    const sampleLiteracyData = [
      ['1', 'Aliya Ibrahim', '85', '78', '', '', '50', '', '', '', '85', '78', '', '', '50', '', '', ''],
      ['2', 'Almeyaw Salisu Suleman', '67', '74', '', '', '50', '', '', '', '67', '74', '', '', '50', '', '', ''],
      ['3', 'Anthony Adomako Frimpong', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''],
      ['4', 'Edward Badu Poku Ahekan', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''],
      ['5', 'Fuastina Acheampong', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''],
      ['6', 'Fuastina Acheampong', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '']
    ];

    // Sample data for Colouring and Scribbling
    const sampleColouringData = [
      ['1', 'Aliya Ibrahim', '85', '78', '', '', '50', '', '', '', '85', '78', '', '', '50', '', '', ''],
      ['2', 'Almeyaw Salisu Suleman', '67', '74', '', '', '50', '', '', '', '', '', '', '', '', '', '', ''],
      ['3', 'Anthony Adomako Frimpong', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''],
      ['4', 'Edward Badu Poku Ahekan', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''],
      ['5', 'Fuastina Acheampong', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''],
      ['6', 'Fuastina Acheampong', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '']
    ];

    // Update Literacy and Numeracy section (rows 1-3 for headers, rows 4-9 for data)
    await sheetsService.updateSheet('SBA Creche', 'A1:R1', literacyHeaders);
    await sheetsService.updateSheet('SBA Creche', 'A2:R2', literacySubHeaders);
    await sheetsService.updateSheet('SBA Creche', 'A4:R9', sampleLiteracyData);

    // Add spacing row
    await sheetsService.updateSheet('SBA Creche', 'A10:R10', [['', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '']]);

    // Update Colouring and Scribbling section (rows 11-13 for headers, rows 14-19 for data)
    await sheetsService.updateSheet('SBA Creche', 'A11:R11', colouringHeaders);
    await sheetsService.updateSheet('SBA Creche', 'A12:R12', colouringSubHeaders);
    await sheetsService.updateSheet('SBA Creche', 'A14:R19', sampleColouringData);

    console.log('SBA Creche sheet updated successfully with multi-subject structure');

    return NextResponse.json({ 
      success: true, 
      message: 'SBA Creche sheet updated with multi-subject structure' 
    });
    
  } catch (error) {
    console.error('Error updating SBA Creche sheet:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to update SBA Creche sheet' 
    }, { status: 500 });
  }
}