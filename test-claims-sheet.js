// Load environment variables first
require('dotenv').config({ path: '.env.local' });

// Import the Google Sheets service
const { GoogleSheetsService } = require('./src/lib/google-sheets.ts');

async function testClaimsSheet() {
  console.log('🧪 Testing Claims Sheet...\n');
  
  // Check environment variables first
  console.log('🔍 Environment Variables Check:');
  console.log('GOOGLE_SERVICE_ACCOUNT_EMAIL:', process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL ? '✅ SET' : '❌ MISSING');
  console.log('GOOGLE_PRIVATE_KEY:', process.env.GOOGLE_PRIVATE_KEY ? '✅ SET' : '❌ MISSING');
  console.log('GOOGLE_SHEET_ID/NEXT_PUBLIC_SPREADSHEET_ID:', process.env.GOOGLE_SHEET_ID || process.env.NEXT_PUBLIC_SPREADSHEET_ID ? '✅ SET' : '❌ MISSING');
  console.log('');
  
  // Check if we have the required variables
  if (!process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL || !process.env.GOOGLE_PRIVATE_KEY) {
    console.log('❌ Missing required Google Sheets credentials. Please check your .env.local file.');
    return;
  }
  
  try {
    console.log('🔑 Initializing Google Sheets Service...');
    const sheetsService = new GoogleSheetsService();
    console.log('✅ Service initialized successfully');
    
    console.log('\n' + '='.repeat(60) + '\n');
    
    // Test 1: Check if Claims sheet exists
    console.log('📋 Test 1: Checking if Claims sheet exists...');
    try {
      const claimsResult = await sheetsService.getSheetData('Claims', 'A1:Z1');
      if (claimsResult.success) {
        console.log('✅ Claims sheet exists');
        console.log('Headers:', claimsResult.data[0] || 'No headers found');
        console.log('Total rows:', claimsResult.data.length);
      } else {
        console.log('❌ Claims sheet not found or error:', claimsResult.message);
      }
    } catch (error) {
      console.log('❌ Error checking Claims sheet:', error.message);
      if (error.message.includes('Unable to parse range')) {
        console.log('📝 This usually means the sheet does not exist.');
      }
    }
    
    console.log('\n' + '='.repeat(60) + '\n');
    
    // Test 2: Try to append a test claim
    console.log('📝 Test 2: Appending test claim...');
    const testClaim = [
      ['TEST-CLAIM-001', 'Test Guardian', '241234567', 'Parent', 'Test Student', 'Grade 10', '500', '2024-12-31', new Date().toISOString(), 'FALSE', '', '', '']
    ];
    
    const appendResult = await sheetsService.appendToSheet('Claims', testClaim);
    
    if (appendResult.success) {
      console.log('✅ Test claim appended successfully');
      console.log('Updates:', appendResult.data.updates);
    } else {
      console.log('❌ Failed to append test claim:', appendResult.message);
    }
    
    console.log('\n' + '='.repeat(60) + '\n');
    
    // Test 3: Use the getInvoices method (which now uses Claims sheet)
    console.log('📖 Test 3: Testing getInvoices method...');
    const invoicesResult = await sheetsService.getInvoices();
    
    if (invoicesResult.success) {
      console.log('✅ Invoices retrieved successfully');
      console.log('Total invoices:', invoicesResult.data.length);
      if (invoicesResult.data.length > 0) {
        console.log('First few invoices:');
        invoicesResult.data.slice(0, 3).forEach((invoice, index) => {
          console.log(`  ${index + 1}: ${JSON.stringify(invoice)}`);
        });
      }
    } else {
      console.log('❌ Failed to retrieve invoices:', invoicesResult.message);
    }
    
    console.log('\n' + '='.repeat(60) + '\n');
    console.log('🎉 Claims Sheet Testing Complete!');
    
  } catch (error) {
    console.log('💥 CRITICAL ERROR during testing:');
    console.error('Error name:', error.name);
    console.error('Error message:', error.message);
    console.error('Full error:', error);
    
    if (error.message.includes('private key')) {
      console.log('\n🔧 SUGGESTION: Private key format issue');
      console.log('1. Make sure the private key is properly formatted');
      console.log('2. For Vercel: Replace actual newlines with \\\\n');
      console.log('3. For local .env.local: Use actual newlines');
      console.log('4. The key should start with -----BEGIN PRIVATE KEY-----');
    } else if (error.message.includes('Unable to parse range')) {
      console.log('\n🔧 SUGGESTION: Sheet does not exist');
      console.log('The Claims sheet needs to exist in the Google Spreadsheet');
    }
  }
}

// Run the test
testClaimsSheet().catch(console.error);