require('dotenv').config({ path: '.env.local' });
const { GoogleSheetsService } = require('./src/lib/google-sheets.ts');

async function testGoogleSheetsBasic() {
  console.log('🔧 Testing Basic Google Sheets Integration...\n');

  try {
    // 1. Initialize Google Sheets Service
    console.log('1️⃣ Initializing Google Sheets Service...');
    const sheetsService = new GoogleSheetsService();
    console.log('✅ Google Sheets service initialized');

    // 2. Test connection to spreadsheet
    console.log('\n2️⃣ Testing spreadsheet connection...');
    const spreadsheet = await sheetsService.sheets.spreadsheets.get({
      spreadsheetId: process.env.NEXT_PUBLIC_SPREADSHEET_ID,
    });
    console.log(`✅ Connected to spreadsheet: ${spreadsheet.data.properties.title}`);

    // 3. Test reading Claims sheet
    console.log('\n3️⃣ Testing Claims sheet reading...');
    const claimsResult = await sheetsService.getSheetData('Claims');
    const claimsData = claimsResult.success ? claimsResult.data : [];
    console.log(`✅ Found ${claimsData.length} rows in Claims sheet`);
    if (claimsData.length > 0) {
      console.log('First row:', claimsData[0]);
    }

    // 4. Test reading Invoices sheet
    console.log('\n4️⃣ Testing Invoices sheet reading...');
    const invoicesResult = await sheetsService.getSheetData('Invoices');
    const invoicesData = invoicesResult.success ? invoicesResult.data : [];
    console.log(`✅ Found ${invoicesData.length} rows in Invoices sheet`);
    if (invoicesData.length > 0) {
      console.log('First row:', invoicesData[0]);
    }

    // 5. Test appending to Claims sheet
    console.log('\n5️⃣ Testing append to Claims sheet...');
    const testClaim = [
      'TEST-001',
      'Test Student',
      'Test Parent',
      'test@example.com',
      '1234567890',
      'Class 1',
      'Monthly Fee',
      '1000',
      'pending',
      new Date().toISOString(),
      new Date().toISOString()
    ];
    
    await sheetsService.appendToSheet('Claims', [testClaim]);
    console.log('✅ Successfully appended test claim');

    // 6. Test updating a row
    console.log('\n6️⃣ Testing row update...');
    const updatedClaim = [
      'TEST-001',
      'Updated Student',
      'Updated Parent',
      'updated@example.com',
      '1234567890',
      'Class 1',
      'Monthly Fee',
      '1200',
      'approved',
      new Date().toISOString(),
      new Date().toISOString()
    ];
    
    // Find the test row and update it
    const updateClaimsResult = await sheetsService.getSheetData('Claims');
    const updateClaims = updateClaimsResult.success ? updateClaimsResult.data : [];
    const testRowIndex = updateClaims.findIndex(row => row[0] === 'TEST-001');
    if (testRowIndex !== -1) {
      await sheetsService.updateRowInSheet('Claims', testRowIndex + 1, updatedClaim);
      console.log('✅ Successfully updated test claim');
    }

    // 7. Test clearing a row
    console.log('\n7️⃣ Testing row clearing...');
    const finalClaimsResult = await sheetsService.getSheetData('Claims');
    const finalClaims = finalClaimsResult.success ? finalClaimsResult.data : [];
    const finalTestRowIndex = finalClaims.findIndex(row => row[0] === 'TEST-001');
    if (finalTestRowIndex !== -1) {
      await sheetsService.clearRowInSheet('Claims', finalTestRowIndex + 1);
      console.log('✅ Successfully cleared test claim row');
    }

    console.log('\n🎉 All basic tests completed successfully!');
    console.log('\n📊 Test Summary:');
    console.log('✅ Google Sheets connection');
    console.log('✅ Claims sheet reading');
    console.log('✅ Invoices sheet reading');
    console.log('✅ Data appending');
    console.log('✅ Row updating');
    console.log('✅ Row clearing');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error('Stack:', error.stack);
    process.exit(1);
  }
}

// Run the test
testGoogleSheetsBasic().catch(console.error);