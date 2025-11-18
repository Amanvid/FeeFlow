// Check Google Sheets permissions and provide fix instructions
require('dotenv').config({ path: '.env.local' });
const { GoogleSheetsService } = require('./src/lib/google-sheets.ts');

async function checkPermissions() {
  console.log('🔐 Google Sheets Permission Check\n');
  console.log('='.repeat(60));
  
  const serviceAccountEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
  const spreadsheetId = process.env.NEXT_PUBLIC_SPREADSHEET_ID;
  
  console.log('\n📧 Service Account Email:', serviceAccountEmail);
  console.log('📊 Spreadsheet ID:', spreadsheetId);
  
  if (!serviceAccountEmail || !spreadsheetId) {
    console.log('❌ Missing required environment variables');
    return;
  }
  
  try {
    const sheetsService = new GoogleSheetsService();
    const { google } = require('googleapis');
    const sheets = google.sheets({ version: 'v4', auth: sheetsService.auth });
    
    // Try to get spreadsheet metadata
    const response = await sheets.spreadsheets.get({
      spreadsheetId: spreadsheetId,
      fields: 'properties,permissions,sheets'
    });
    
    console.log('\n✅ Successfully connected to spreadsheet!');
    console.log('📊 Title:', response.data.properties?.title);
    console.log('📊 URL: https://docs.google.com/spreadsheets/d/' + spreadsheetId);
    
    // Check permissions
    if (response.data.permissions) {
      console.log('\n🔑 Current Permissions:');
      response.data.permissions.forEach((perm, index) => {
        console.log(`  ${index + 1}. ${perm.emailAddress || 'Unknown'} - ${perm.role}`);
      });
      
      const hasServiceAccountPermission = response.data.permissions.some(
        perm => perm.emailAddress === serviceAccountEmail && 
        (perm.role === 'writer' || perm.role === 'owner')
      );
      
      if (hasServiceAccountPermission) {
        console.log('\n✅ Service account has proper permissions!');
      } else {
        console.log('\n⚠️  Service account permission issue detected!');
        console.log('The service account needs "Editor" permissions to write data.');
      }
    }
    
    // Test write operations
    console.log('\n🧪 Testing Write Operations:');
    try {
      // Test appending to Config sheet (usually has write permissions)
      const testData = [['Permission Test', new Date().toISOString()]];
      const result = await sheetsService.appendToSheet('Config', testData);
      
      if (result.success) {
        console.log('✅ Write permissions confirmed - can append data');
      } else {
        console.log('❌ Write permission denied:', result.message);
      }
    } catch (error) {
      console.log('❌ Write test failed:', error.message);
      
      if (error.message.includes('permission') || error.message.includes('PERMISSION_DENIED')) {
        console.log('\n🔧 SOLUTION: Grant Editor Permissions');
        console.log('1. Open your Google Sheet: https://docs.google.com/spreadsheets/d/' + spreadsheetId);
        console.log('2. Click the "Share" button (top right)');
        console.log('3. Add this email: ' + serviceAccountEmail);
        console.log('4. Set permission to "Editor"');
        console.log('5. Click "Send"');
        console.log('6. Wait 1-2 minutes for permissions to propagate');
        console.log('7. Run this test again');
      }
    }
    
    // Test read operations on all sheets
    console.log('\n📖 Testing Read Operations:');
    const sheetsList = ['Metadata', 'Admin', 'Config', 'Template'];
    
    for (const sheetName of sheetsList) {
      try {
        const result = await sheetsService.getSheetData(sheetName, 'A1:A2');
        if (result.success) {
          console.log(`✅ ${sheetName}: Can read data (${result.data.length} rows)`);
        } else {
          console.log(`⚠️  ${sheetName}: ${result.message}`);
        }
      } catch (error) {
        console.log(`❌ ${sheetName}: ${error.message}`);
      }
    }
    
  } catch (error) {
    console.log('❌ Failed to connect to spreadsheet:', error.message);
    
    if (error.message.includes('notFound')) {
      console.log('\n🔧 SOLUTION: Check Spreadsheet ID');
      console.log('The spreadsheet ID might be incorrect or the sheet was deleted.');
      console.log('Current ID:', spreadsheetId);
    } else if (error.message.includes('permission')) {
      console.log('\n🔧 SOLUTION: Check Sharing Settings');
      console.log('Make sure the spreadsheet is shared with the service account.');
    }
  }
  
  console.log('\n' + '='.repeat(60));
  console.log('🔐 Permission check complete!');
}

checkPermissions().catch(console.error);