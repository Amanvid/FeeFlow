import { GoogleSheetsService } from './src/lib/google-sheets.js';

async function testTotalStudentsCount() {
  console.log('Testing total students count functionality...');
  
  try {
    // Test GoogleSheetsService.getTotalStudentsCount()
    console.log('\n1. Testing GoogleSheetsService.getTotalStudentsCount()...');
    const sheetsService = new GoogleSheetsService();
    const totalFromSheets = await sheetsService.getTotalStudentsCount();
    console.log(`Total students from Google Sheets: ${totalFromSheets}`);
    
    // Test direct Google Sheets API call to find "Total Students" text
    console.log('\n2. Searching for "Total Students" in Google Sheets...');
    const spreadsheetId = process.env.NEXT_PUBLIC_SPREADSHEET_ID || '1WHkw5YaVbnHjWD2nwTcYnQfIYV7PxascjEzY7FqL4Ew';
    
    // Try to find "Total Students" in Summary sheet
    try {
      const summaryUrl = `https://docs.google.com/spreadsheets/d/${spreadsheetId}/gviz/tq?tqx=out:csv&sheet=Summary`;
      const summaryResponse = await fetch(summaryUrl);
      if (summaryResponse.ok) {
        const summaryText = await summaryResponse.text();
        console.log('Summary sheet content preview:');
        console.log(summaryText.substring(0, 500));
        
        // Look for "Total Students" pattern
        const totalStudentsMatch = summaryText.match(/Total Students\s+(\d+)/i);
        if (totalStudentsMatch) {
          console.log(`Found "Total Students ${totalStudentsMatch[1]}" in Summary sheet`);
        }
      }
    } catch (error) {
      console.log('Could not fetch Summary sheet:', error.message);
    }
    
    // Try to find "Total Students" in Config sheet
    try {
      const configUrl = `https://docs.google.com/spreadsheets/d/${spreadsheetId}/gviz/tq?tqx=out:csv&sheet=Config`;
      const configResponse = await fetch(configUrl);
      if (configResponse.ok) {
        const configText = await configResponse.text();
        console.log('\nConfig sheet content preview:');
        console.log(configText.substring(0, 500));
        
        // Look for "Total Students" pattern
        const totalStudentsMatch = configText.match(/Total Students\s+(\d+)/i);
        if (totalStudentsMatch) {
          console.log(`Found "Total Students ${totalStudentsMatch[1]}" in Config sheet`);
        }
      }
    } catch (error) {
      console.log('Could not fetch Config sheet:', error.message);
    }
    
    // Try Metadata sheet to count rows
    try {
      const metadataUrl = `https://docs.google.com/spreadsheets/d/${spreadsheetId}/gviz/tq?tqx=out:csv&sheet=Metadata`;
      const metadataResponse = await fetch(metadataUrl);
      if (metadataResponse.ok) {
        const metadataText = await metadataResponse.text();
        const lines = metadataText.trim().split('\n');
        const studentCount = Math.max(0, lines.length - 1); // Subtract header
        console.log(`\nMetadata sheet has ${studentCount} student records`);
      }
    } catch (error) {
      console.log('Could not fetch Metadata sheet:', error.message);
    }
    
  } catch (error) {
    console.error('Error during testing:', error);
  }
}

// Run the test
testTotalStudentsCount();