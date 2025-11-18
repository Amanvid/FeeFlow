// Load environment variables first
require('dotenv').config({ path: '.env.local' });

const { GoogleSheetsService } = require('./src/lib/google-sheets.ts');

async function listSheets() {
  try {
    const sheetsService = new GoogleSheetsService();
    
    const spreadsheet = await sheetsService.sheets.spreadsheets.get({
      spreadsheetId: sheetsService.spreadsheetId,
    });
    
    console.log('Available sheets:');
    spreadsheet.data.sheets.forEach(sheet => {
      console.log(`- ${sheet.properties.title}`);
    });
  } catch (error) {
    console.error('Error:', error.message);
    console.error('Stack:', error.stack);
  }
}

listSheets();