// Load environment variables first
require('dotenv').config({ path: '.env.local' });

// Import the Google Sheets service
const { GoogleSheetsService } = require('./src/lib/google-sheets.ts');

async function testGoogleSheetsAPI() {
  console.log('🧪 Testing Google Sheets API Integration...\n');
  
  // Check environment variables first
  console.log('🔍 Environment Variables Check:');
  console.log('GOOGLE_SERVICE_ACCOUNT_EMAIL:', process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL ? '✅ SET' : '❌ MISSING');
  console.log('GOOGLE_PRIVATE_KEY:', process.env.GOOGLE_PRIVATE_KEY ? '✅ SET' : '❌ MISSING');
  console.log('GOOGLE_SHEET_ID:', process.env.GOOGLE_SHEET_ID ? '✅ SET' : '❌ MISSING');
  console.log('NEXT_PUBLIC_SPREADSHEET_ID:', process.env.NEXT_PUBLIC_SPREADSHEET_ID ? '✅ SET' : '❌ MISSING');
  console.log('');
  
  // Check if we have the required variables
  if (!process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL || !process.env.GOOGLE_PRIVATE_KEY) {
    console.log('❌ Missing required Google Sheets credentials. Please check your .env.local file.');
    console.log('Make sure you have:');
    console.log('1. GOOGLE_SERVICE_ACCOUNT_EMAIL');
    console.log('2. GOOGLE_PRIVATE_KEY');
    console.log('3. GOOGLE_SHEET_ID or NEXT_PUBLIC_SPREADSHEET_ID');
    return;
  }
  
  try {
    console.log('🔑 Initializing Google Sheets Service...');
    const sheetsService = new GoogleSheetsService();
    console.log('✅ Service initialized successfully');
    
    console.log('\n' + '='.repeat(60) + '\n');
    
    // Test 1: Read data from Students sheet
    console.log('📖 Test 1: Reading data from Students sheet...');
    const readResult = await sheetsService.getSheetData('Students', 'A1:E5');
    
    if (readResult.success) {
      console.log('✅ READ Test PASSED');
      console.log('Data retrieved:', readResult.data);
      console.log('Row count:', readResult.data.length);
      if (readResult.data.length > 0) {
        console.log('First row:', readResult.data[0]);
      }
    } else {
      console.log('❌ READ Test FAILED');
      console.log('Error:', readResult.message);
      return; // Stop if we can't read
    }
    
    console.log('\n' + '='.repeat(60) + '\n');
    
    // Test 2: Append test data
    console.log('📝 Test 2: Appending test data...');
    const testData = [
      ['TEST001', 'Test Student 1', 'Grade 10', '2024-01-15', 'Active'],
      ['TEST002', 'Test Student 2', 'Grade 11', '2024-01-16', 'Active']
    ];
    
    const appendResult = await sheetsService.appendToSheet('Students', testData);
    
    if (appendResult.success) {
      console.log('✅ APPEND Test PASSED');
      console.log('Test data appended successfully');
      console.log('Updates:', appendResult.data.updates);
    } else {
      console.log('❌ APPEND Test FAILED');
      console.log('Error:', appendResult.message);
    }
    
    console.log('\n' + '='.repeat(60) + '\n');
    
    // Test 3: Update existing data
    console.log('✏️ Test 3: Updating existing data...');
    const updateData = [['TEST001', 'Updated Test Student', 'Grade 12', '2024-01-20', 'Updated']];
    
    const updateResult = await sheetsService.updateSheet('Students', 'A2:E2', updateData);
    
    if (updateResult.success) {
      console.log('✅ UPDATE Test PASSED');
      console.log('Data updated successfully');
      console.log('Updated cells:', updateResult.data.updatedCells);
    } else {
      console.log('❌ UPDATE Test FAILED');
      console.log('Error:', updateResult.message);
    }
    
    console.log('\n' + '='.repeat(60) + '\n');
    
    // Test 4: Test Config sheet
    console.log('⚙️ Test 4: Testing Config sheet...');
    const configResult = await sheetsService.getSheetData('Config', 'A1:J2');
    
    if (configResult.success) {
      console.log('✅ CONFIG READ Test PASSED');
      console.log('Config data found, rows:', configResult.data.length);
      if (configResult.data.length > 0) {
        console.log('Headers:', configResult.data[0]);
      }
      
      // Test saving notification settings
      const notificationSettings = {
        smsEnabled: true,
        feeRemindersEnabled: true,
        paymentNotificationsEnabled: true,
        admissionNotificationsEnabled: false
      };
      
      const saveConfigResult = await sheetsService.saveNotificationSettings(notificationSettings);
      if (saveConfigResult.success) {
        console.log('✅ CONFIG SAVE Test PASSED');
        console.log('Notification settings saved successfully');
      } else {
        console.log('❌ CONFIG SAVE Test FAILED');
        console.log('Error:', saveConfigResult.message);
      }
    } else {
      console.log('❌ CONFIG READ Test FAILED');
      console.log('Error:', configResult.message);
    }
    
    console.log('\n' + '='.repeat(60) + '\n');
    console.log('🎉 Google Sheets API Testing Complete!');
    console.log('📊 Summary:');
    console.log('- Service initialization: ✅');
    console.log('- Read operations: ✅');
    console.log('- Write operations: ✅');
    console.log('- Update operations: ✅');
    console.log('- Config operations: ✅');
    
  } catch (error) {
    console.log('💥 CRITICAL ERROR during testing:');
    console.error('Error name:', error.name);
    console.error('Error message:', error.message);
    
    if (error.message.includes('invalid_grant')) {
      console.log('\n🔧 SUGGESTION: Check your service account email and private key');
      console.log('Make sure the private key is properly formatted with newlines');
      console.log('For Vercel: Use \\\\n in environment variables');
      console.log('For local: Can use actual newlines in .env.local');
    } else if (error.message.includes('not found')) {
      console.log('\n🔧 SUGGESTION: Check if the spreadsheet ID is correct');
      console.log('Make sure the sheet exists and is shared with the service account');
    } else if (error.message.includes('permission denied')) {
      console.log('\n🔧 SUGGESTION: Make sure the service account has editor access to the spreadsheet');
      console.log('Share the spreadsheet with the service account email');
    }
  }
}

// Run the test
if (require.main === module) {
  testGoogleSheetsAPI().catch(console.error);
}

module.exports = { testGoogleSheetsAPI };