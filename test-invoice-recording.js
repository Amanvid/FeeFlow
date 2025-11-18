// Test script to verify invoice recording fix
require('dotenv').config({ path: '.env.local' });
const { GoogleSheetsService } = require('./src/lib/google-sheets.ts');

async function testInvoiceRecording() {
  console.log('🧪 Testing Invoice Recording Fix...\n');
  
  try {
    const sheetsService = new GoogleSheetsService();
    console.log('✅ Google Sheets service initialized');
    
    // Test data matching the user's example
    const testClaim = {
      invoiceNumber: 'CEC-INV--0002',
      guardianName: 'Ben',
      guardianPhone: '536282694',
      relationship: 'Mother',
      studentName: 'Bennett Manu',
      class: 'Nursery 1',
      totalFeesBalance: 400,
      dueDate: '7 Nov. 2025',
      timestamp: '2025-11-06T19:04:09.596Z'
    };
    
    console.log('📝 Testing saveInvoiceToSheet with data:');
    console.log('Invoice Number:', testClaim.invoiceNumber);
    console.log('Guardian Name:', testClaim.guardianName);
    console.log('Student Name:', testClaim.studentName);
    console.log('Class:', testClaim.class);
    console.log('Total Fees Balance:', testClaim.totalFeesBalance);
    console.log('');
    
    // First save - should create headers and add the row
    console.log('🔄 First save (should create headers and add row)...');
    const result1 = await sheetsService.saveInvoiceToSheet(testClaim);
    
    if (result1.success) {
      console.log('✅ First save successful');
    } else {
      console.log('❌ First save failed:', result1.message);
      return;
    }
    
    // Wait a moment
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Second save with same invoice number - should update existing row
    console.log('🔄 Second save with same invoice number (should update existing row)...');
    const updatedClaim = {
      ...testClaim,
      guardianName: 'Benjamin', // Changed name to test update
      totalFeesBalance: 450 // Changed amount to test update
    };
    
    const result2 = await sheetsService.saveInvoiceToSheet(updatedClaim);
    
    if (result2.success) {
      console.log('✅ Second save successful (updated existing row)');
    } else {
      console.log('❌ Second save failed:', result2.message);
    }
    
    // Wait a moment
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Check the current state of the sheet
    console.log('\n📊 Checking current sheet state...');
    const sheetData = await sheetsService.getSheetData('Claims', 'A1:L10');
    
    if (sheetData.success) {
      console.log('✅ Retrieved sheet data:');
      console.log('Row count:', sheetData.data.length);
      
      if (sheetData.data.length > 0) {
        console.log('\nHeaders:', sheetData.data[0]);
        console.log('');
        
        // Show data rows
        for (let i = 1; i < sheetData.data.length; i++) {
          const row = sheetData.data[i];
          console.log(`Row ${i}:`, row);
        }
        
        // Verify only one row for our test invoice
        const invoiceRows = sheetData.data.filter(row => row[0] === testClaim.invoiceNumber);
        console.log(`\n✅ Found ${invoiceRows.length} row(s) for invoice ${testClaim.invoiceNumber}`);
        
        if (invoiceRows.length === 1) {
          console.log('✅ Perfect! Only one row exists for this invoice (no duplicates)');
          console.log('✅ Updated data:', invoiceRows[0]);
        } else {
          console.log('⚠️  Multiple rows found - this indicates the fix may not be working correctly');
        }
      }
    } else {
      console.log('❌ Failed to retrieve sheet data:', sheetData.message);
    }
    
    console.log('\n🎉 Test completed!');
    
  } catch (error) {
    console.error('❌ Test failed with error:', error.message);
    console.error(error.stack);
  }
}

// Run the test
testInvoiceRecording().catch(console.error);