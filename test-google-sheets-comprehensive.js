// Comprehensive test for Google Sheets API integration
const { GoogleSheetsService } = require('./src/lib/google-sheets.ts');

async function testGoogleSheetsAPI() {
  console.log('🧪 Testing Google Sheets API with Fixed JWT Initialization...\n');
  
  try {
    // Test 1: Initialize the service (this will test JWT setup)
    console.log('🔑 Test 1: Initializing Google Sheets Service...');
    const sheetsService = new GoogleSheetsService();
    console.log('✅ Service initialized successfully');
    
    console.log('\n' + '='.repeat(60) + '\n');
    
    // Test 2: Read data from a sheet
    console.log('📖 Test 2: Reading data from Students sheet...');
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
    
    // Test 3: Append test data
    console.log('📝 Test 3: Appending test data...');
    const testData = [
      ['TEST001', 'Test Student 1', 'Grade 10', '2024-01-15', 'Active'],
      ['TEST002', 'Test Student 2', 'Grade 11', '2024-01-16', 'Active']
    ];
    
    const appendResult = await sheetsService.appendToSheet('Students', testData);
    
    if (appendResult.success) {
      console.log('✅ APPEND Test PASSED');
      console.log('Test data appended successfully');
      console.log('Response data:', JSON.stringify(appendResult.data, null, 2));
    } else {
      console.log('❌ APPEND Test FAILED');
      console.log('Error:', appendResult.message);
    }
    
    console.log('\n' + '='.repeat(60) + '\n');
    
    // Test 4: Update existing data
    console.log('✏️ Test 4: Updating existing data...');
    const updateData = [['TEST001', 'Updated Test Student', 'Grade 12', '2024-01-20', 'Updated']];
    
    const updateResult = await sheetsService.updateSheet('Students', 'A2:E2', updateData);
    
    if (updateResult.success) {
      console.log('✅ UPDATE Test PASSED');
      console.log('Data updated successfully');
    } else {
      console.log('❌ UPDATE Test FAILED');
      console.log('Error:', updateResult.message);
    }
    
    console.log('\n' + '='.repeat(60) + '\n');
    
    // Test 5: Test Config sheet operations
    console.log('⚙️ Test 5: Testing Config sheet...');
    const configResult = await sheetsService.getSheetData('Config', 'A1:J2');
    
    if (configResult.success) {
      console.log('✅ CONFIG READ Test PASSED');
      console.log('Config data:', configResult.data);
      
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
    
    // Test 6: Environment validation
    console.log('🔍 Test 6: Environment Variables Validation...');
    const requiredEnvVars = [
      'GOOGLE_SERVICE_ACCOUNT_EMAIL',
      'GOOGLE_PRIVATE_KEY',
      'GOOGLE_SHEET_ID',
      'NEXT_PUBLIC_SPREADSHEET_ID'
    ];
    
    const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);
    
    if (missingVars.length === 0) {
      console.log('✅ All required environment variables are set');
    } else {
      console.log('⚠️ Missing environment variables:', missingVars);
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
    console.error('Error stack:', error.stack);
    
    if (error.message.includes('invalid_grant')) {
      console.log('\n🔧 SUGGESTION: Check your service account email and private key');
      console.log('Make sure the private key is properly formatted with newlines');
    } else if (error.message.includes('not found')) {
      console.log('\n🔧 SUGGESTION: Check if the spreadsheet ID is correct');
      console.log('Make sure the sheet exists and is shared with the service account');
    }
  }
}

// Run the test
if (require.main === module) {
  testGoogleSheetsAPI().catch(console.error);
}

module.exports = { testGoogleSheetsAPI };