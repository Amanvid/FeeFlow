// Debug Google Sheets API integration
require('dotenv').config({ path: '.env.local' });
const { GoogleSheetsService } = require('./src/lib/google-sheets.ts');

async function debugGoogleSheets() {
  console.log('🔍 Debugging Google Sheets API Integration...\n');
  
  try {
    const sheetsService = new GoogleSheetsService();
    console.log('✅ Service initialized successfully');
    
    // Test 1: Try to get spreadsheet metadata
    console.log('\n📋 Test 1: Getting spreadsheet metadata...');
    try {
      const { google } = require('googleapis');
      const sheets = google.sheets({ version: 'v4', auth: sheetsService.auth });
      
      const response = await sheets.spreadsheets.get({
        spreadsheetId: process.env.NEXT_PUBLIC_SPREADSHEET_ID,
      });
      
      console.log('✅ Spreadsheet found!');
      console.log('Title:', response.data.properties?.title);
      console.log('Sheet count:', response.data.sheets?.length);
      
      if (response.data.sheets && response.data.sheets.length > 0) {
        console.log('Available sheets:');
        response.data.sheets.forEach((sheet, index) => {
          console.log(`  ${index + 1}. ${sheet.properties?.title} (ID: ${sheet.properties?.sheetId})`);
        });
      }
      
    } catch (metadataError) {
      console.log('❌ Error getting metadata:', metadataError.message);
      if (metadataError.message.includes('permission')) {
        console.log('🔧 SUGGESTION: Make sure the spreadsheet is shared with the service account');
        console.log('Service account email:', process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL);
      }
    }
    
    // Test 2: Try reading from the first available sheet
    console.log('\n📖 Test 2: Reading from first available sheet...');
    try {
      const { google } = require('googleapis');
      const sheets = google.sheets({ version: 'v4', auth: sheetsService.auth });
      
      // Get spreadsheet info first
      const spreadsheet = await sheets.spreadsheets.get({
        spreadsheetId: process.env.NEXT_PUBLIC_SPREADSHEET_ID,
      });
      
      if (spreadsheet.data.sheets && spreadsheet.data.sheets.length > 0) {
        const firstSheet = spreadsheet.data.sheets[0];
        const sheetName = firstSheet.properties?.title;
        
        console.log('Trying to read from sheet:', sheetName);
        
        const response = await sheets.spreadsheets.values.get({
          spreadsheetId: process.env.NEXT_PUBLIC_SPREADSHEET_ID,
          range: `${sheetName}!A1:E5`,
        });
        
        console.log('✅ Successfully read data!');
        console.log('Data:', response.data.values);
        
      } else {
        console.log('❌ No sheets found in spreadsheet');
      }
      
    } catch (readError) {
      console.log('❌ Error reading data:', readError.message);
    }
    
    // Test 3: Try using our service methods
    console.log('\n🔧 Test 3: Testing service methods...');
    try {
      // Try with just the sheet name without range first
      const result = await sheetsService.getSheetData('Sheet1', 'A1:E5');
      if (result.success) {
        console.log('✅ Service method worked!');
        console.log('Data:', result.data);
      } else {
        console.log('❌ Service method failed:', result.message);
      }
    } catch (serviceError) {
      console.log('❌ Service method error:', serviceError.message);
    }
    
  } catch (error) {
    console.log('💥 Critical error:', error.message);
  }
}

debugGoogleSheets().catch(console.error);