// Load environment variables
require('dotenv').config({ path: '.env.local' });

const { GoogleSheetsService } = require('../src/lib/google-sheets.ts');

async function createTeachersSheet() {
  try {
    console.log('Creating Teachers sheet...');
    console.log('GOOGLE_SERVICE_ACCOUNT_EMAIL:', process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL ? '✅ SET' : '❌ MISSING');
    console.log('GOOGLE_PRIVATE_KEY exists:', !!process.env.GOOGLE_PRIVATE_KEY);
    console.log('NEXT_PUBLIC_SPREADSHEET_ID:', process.env.NEXT_PUBLIC_SPREADSHEET_ID ? '✅ SET' : '❌ MISSING');
    
    const sheetsService = new GoogleSheetsService();
    
    // Create the Teachers sheet
    const createResult = await sheetsService.createSheet('Teachers');
    
    if (createResult.success) {
      console.log('✅ Teachers sheet created successfully');
      
      // Add headers to the Teachers sheet
      const headers = [
        ['Name', 'Class', 'Role', 'Status', 'Username', 'Password', 'Date created', 'Date updated']
      ];
      
      const updateResult = await sheetsService.updateSheet('Teachers', 'A1:H1', headers);
      
      if (updateResult.success) {
        console.log('✅ Headers added to Teachers sheet successfully');
        console.log('Headers:', headers[0]);
        
        // Add sample teacher data for testing
        const sampleData = [
          ['John Smith', 'Primary 1', 'Class Teacher', 'Active', 'john.smith', 'teacher123', new Date().toISOString(), new Date().toISOString()],
          ['Sarah Johnson', 'Primary 2', 'Class Teacher', 'Active', 'sarah.johnson', 'teacher456', new Date().toISOString(), new Date().toISOString()],
          ['Michael Brown', 'Primary 3', 'Class Teacher', 'Active', 'michael.brown', 'teacher789', new Date().toISOString(), new Date().toISOString()]
        ];
        
        const appendResult = await sheetsService.appendToSheet('Teachers', sampleData);
        
        if (appendResult.success) {
          console.log('✅ Sample teacher data added successfully');
        } else {
          console.log('⚠️  Could not add sample data:', appendResult.message);
        }
        
      } else {
        console.log('❌ Failed to add headers:', updateResult.message);
      }
    } else {
      console.log('⚠️  Could not create Teachers sheet:', createResult.message);
    }
    
  } catch (error) {
    console.error('❌ Error creating Teachers sheet:', error);
  }
}

// Run the script
createTeachersSheet();