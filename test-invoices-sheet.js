// Load environment variables first
require('dotenv').config({ path: '.env.local' });

// Import the Google Sheets service
const { GoogleSheetsService } = require('./src/lib/google-sheets.ts');

async function testInvoicesSheet() {
  console.log('🧪 Testing Invoices Sheet...\n');
  
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
    
    // Test 1: Check if Invoices sheet exists
    console.log('📋 Test 1: Checking if Invoices sheet exists...');
    try {
      const invoicesResult = await sheetsService.getSheetData('Invoices', 'A1:Z1');
      if (invoicesResult.success) {
        console.log('✅ Invoices sheet exists');
        console.log('Headers:', invoicesResult.data[0] || 'No headers found');
      } else {
        console.log('❌ Invoices sheet not found or error:', invoicesResult.message);
        console.log('📝 Creating Invoices sheet with proper headers...');
        
        // Try to create the sheet by appending headers
        const headers = [['ID', 'Amount', 'Status', 'CreatedAt', 'UpdatedAt', 'Description', 'Reference']];
        const createResult = await sheetsService.appendToSheet('Invoices', headers);
        if (createResult.success) {
          console.log('✅ Invoices sheet created successfully');
        } else {
          console.log('❌ Failed to create Invoices sheet:', createResult.message);
        }
      }
    } catch (error) {
      console.log('❌ Error checking Invoices sheet:', error.message);
      if (error.message.includes('Unable to parse range')) {
        console.log('📝 This usually means the sheet does not exist.');
        console.log('📝 The sheet needs to be created manually or we need to handle this case.');
      }
    }
    
    console.log('\n' + '='.repeat(60) + '\n');
    
    // Test 2: Try to append a test invoice
    console.log('📝 Test 2: Appending test invoice...');
    const testInvoice = [
      ['INV-TEST-001', '100.00', 'PENDING', new Date().toISOString(), new Date().toISOString(), 'Test invoice', 'REF-001']
    ];
    
    const appendResult = await sheetsService.appendToSheet('Invoices', testInvoice);
    
    if (appendResult.success) {
      console.log('✅ Test invoice appended successfully');
      console.log('Updates:', appendResult.data.updates);
    } else {
      console.log('❌ Failed to append test invoice:', appendResult.message);
    }
    
    console.log('\n' + '='.repeat(60) + '\n');
    
    // Test 3: Read all invoices
    console.log('📖 Test 3: Reading all invoices...');
    const allInvoicesResult = await sheetsService.getSheetData('Invoices');
    
    if (allInvoicesResult.success) {
      console.log('✅ Invoices retrieved successfully');
      console.log('Total invoices:', allInvoicesResult.data.length);
      if (allInvoicesResult.data.length > 0) {
        console.log('First few invoices:');
        allInvoicesResult.data.slice(0, 3).forEach((invoice, index) => {
          console.log(`  ${index + 1}: ${JSON.stringify(invoice)}`);
        });
      }
    } else {
      console.log('❌ Failed to retrieve invoices:', allInvoicesResult.message);
    }
    
    console.log('\n' + '='.repeat(60) + '\n');
    console.log('🎉 Invoices Sheet Testing Complete!');
    
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
      console.log('The Invoices sheet needs to be created in the Google Spreadsheet');
    }
  }
}

// Run the test
testInvoicesSheet().catch(console.error);