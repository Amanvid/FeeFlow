// Test script to fix the decoder error
require('dotenv').config({ path: '.env.local' });

console.log('🔧 Testing Decoder Error Fix...\n');

// Test 1: Check environment variables
console.log('1️⃣ Environment Variables Check:');
console.log('   GOOGLE_SERVICE_ACCOUNT_EMAIL:', process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL);
console.log('   GOOGLE_PRIVATE_KEY exists:', !!process.env.GOOGLE_PRIVATE_KEY);
console.log('   GOOGLE_PRIVATE_KEY length:', process.env.GOOGLE_PRIVATE_KEY?.length);
console.log('   GOOGLE_SHEET_ID:', process.env.GOOGLE_SHEET_ID || process.env.NEXT_PUBLIC_SPREADSHEET_ID);
console.log('');

// Test 2: Test private key formatting
console.log('2️⃣ Private Key Format Check:');
let privateKey = process.env.GOOGLE_PRIVATE_KEY;
if (privateKey) {
  // Check if key needs formatting
  if (privateKey.includes('\\n')) {
    console.log('   🔧 Found escaped newlines, formatting...');
    privateKey = privateKey.replace(/\\n/g, '\n');
  }
  
  // Validate key structure
  const hasBegin = privateKey.includes('-----BEGIN PRIVATE KEY-----');
  const hasEnd = privateKey.includes('-----END PRIVATE KEY-----');
  
  console.log('   Has BEGIN header:', hasBegin);
  console.log('   Has END header:', hasEnd);
  console.log('   Key length:', privateKey.length);
  
  if (!hasBegin || !hasEnd) {
    console.log('   ❌ Invalid key structure');
  } else {
    console.log('   ✅ Key structure looks valid');
  }
}
console.log('');

// Test 3: Test Google Sheets connection
async function testGoogleSheets() {
  console.log('3️⃣ Google Sheets Connection Test:');
  
  try {
    const { google } = require('googleapis');
    
    // Format private key properly
    let formattedKey = process.env.GOOGLE_PRIVATE_KEY;
    if (formattedKey && formattedKey.includes('\\n')) {
      formattedKey = formattedKey.replace(/\\n/g, '\n');
    }
    
    const auth = new google.auth.JWT({
      email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      key: formattedKey,
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });
    
    const sheets = google.sheets({ version: 'v4', auth });
    
    console.log('   ✅ Google Sheets client created successfully');
    
    // Test getting spreadsheet info
    const spreadsheetId = process.env.GOOGLE_SHEET_ID || process.env.NEXT_PUBLIC_SPREADSHEET_ID;
    if (spreadsheetId) {
      const response = await sheets.spreadsheets.get({
        spreadsheetId: spreadsheetId,
        fields: 'sheets.properties.title'
      });
      
      console.log('   ✅ Successfully connected to spreadsheet');
      console.log('   Available sheets:', response.data.sheets?.map(s => s.properties?.title));
    }
    
  } catch (error) {
    console.log('   ❌ Google Sheets connection failed:');
    console.log('   Error name:', error.name);
    console.log('   Error message:', error.message);
    console.log('   Error code:', error.code);
    
    if (error.message.includes('DECODER routines')) {
      console.log('   🔧 Suggested fix: Check private key formatting');
      console.log('   - Ensure newlines are properly formatted');
      console.log('   - Check for any extra spaces or characters');
      console.log('   - Verify the key is complete and not truncated');
    }
  }
}

// Test 4: Test invoice creation
async function testInvoiceCreation() {
  console.log('\n4️⃣ Testing Invoice Creation:');
  
  try {
    const { GoogleSheetsService } = require('./src/lib/google-sheets.ts');
    const sheetsService = new GoogleSheetsService();
    
    console.log('   ✅ Google Sheets service initialized');
    
    // Test getting claims data
    const claimsResult = await sheetsService.getSheetData('Claims');
    if (claimsResult.success) {
      console.log('   ✅ Successfully retrieved claims data');
      console.log('   Claims rows:', claimsResult.data.length);
    } else {
      console.log('   ❌ Failed to retrieve claims:', claimsResult.message);
    }
    
  } catch (error) {
    console.log('   ❌ Invoice creation test failed:');
    console.log('   Error:', error.message);
  }
}

// Run tests
async function runTests() {
  await testGoogleSheets();
  await testInvoiceCreation();
  
  console.log('\n🎯 Test Summary:');
  console.log('If you see decoder errors, try these fixes:');
  console.log('1. Check .env.local file formatting');
  console.log('2. Ensure private key has proper newlines');
  console.log('3. Verify service account has spreadsheet access');
  console.log('4. Check if Google Sheets API is enabled');
}

runTests().catch(console.error);