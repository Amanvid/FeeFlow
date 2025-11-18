import { config } from 'dotenv';
import { GoogleSheetsService } from './src/lib/google-sheets.ts';
import { GoogleSheetsCRUD } from './src/lib/google-sheets-crud.ts';

config();

async function testGoogleSheetsComplete() {
  console.log('🔧 Testing Complete Google Sheets Integration...\n');

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

    // 3. Test Claims CRUD operations
    console.log('\n3️⃣ Testing Claims CRUD operations...');
    const crud = new GoogleSheetsCRUD(sheetsService);
    
    // Create a test claim
    const testClaim = {
      id: 'TEST-001',
      studentName: 'Test Student',
      parentName: 'Test Parent',
      parentEmail: 'test@example.com',
      phone: '1234567890',
      studentClass: 'Class 1',
      feeType: 'Monthly Fee',
      amount: 1000,
      status: 'pending',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    console.log('Creating test claim...');
    await crud.createClaim(testClaim);
    console.log('✅ Test claim created');

    console.log('Reading all claims...');
    const claims = await crud.getAllClaims();
    console.log(`✅ Found ${claims.length} claims`);

    console.log('Updating test claim...');
    await crud.updateClaim('TEST-001', { status: 'approved' });
    console.log('✅ Test claim updated');

    console.log('Deleting test claim...');
    await crud.deleteClaim('TEST-001');
    console.log('✅ Test claim deleted');

    // 4. Test Invoice CRUD operations
    console.log('\n4️⃣ Testing Invoice CRUD operations...');
    
    // Create a test invoice
    const testInvoice = {
      id: 'INV-TEST-001',
      claimId: 'TEST-001',
      studentName: 'Test Student',
      parentName: 'Test Parent',
      parentEmail: 'test@example.com',
      phone: '1234567890',
      studentClass: 'Class 1',
      feeType: 'Monthly Fee',
      amount: 1000,
      status: 'pending',
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    console.log('Creating test invoice...');
    await crud.createInvoice(testInvoice);
    console.log('✅ Test invoice created');

    console.log('Reading all invoices...');
    const invoices = await crud.getAllInvoices();
    console.log(`✅ Found ${invoices.length} invoices`);

    console.log('Updating invoice payment status...');
    await crud.updateInvoice('INV-TEST-001', { status: 'paid' });
    console.log('✅ Invoice payment status updated');

    console.log('Deleting test invoice...');
    await crud.deleteInvoice('INV-TEST-001');
    console.log('✅ Test invoice deleted');

    // 5. Test payment processing
    console.log('\n5️⃣ Testing payment processing...');
    
    // Create a claim and invoice for payment test
    const paymentClaim = {
      id: 'PAY-TEST-001',
      studentName: 'Payment Test Student',
      parentName: 'Payment Test Parent',
      parentEmail: 'payment@test.com',
      phone: '0987654321',
      studentClass: 'Class 2',
      feeType: 'Monthly Fee',
      amount: 1500,
      status: 'pending',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const paymentInvoice = {
      id: 'INV-PAY-001',
      claimId: 'PAY-TEST-001',
      studentName: 'Payment Test Student',
      parentName: 'Payment Test Parent',
      parentEmail: 'payment@test.com',
      phone: '0987654321',
      studentClass: 'Class 2',
      feeType: 'Monthly Fee',
      amount: 1500,
      status: 'pending',
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    console.log('Creating payment test claim and invoice...');
    await crud.createClaim(paymentClaim);
    await crud.createInvoice(paymentInvoice);

    console.log('Processing payment...');
    await crud.processPayment('PAY-TEST-001', 'INV-PAY-001', 1500);
    console.log('✅ Payment processed successfully');

    // Verify payment status
    const updatedClaim = await crud.getClaim('PAY-TEST-001');
    const updatedInvoice = await crud.getInvoice('INV-PAY-001');
    console.log(`✅ Claim status: ${updatedClaim.status}`);
    console.log(`✅ Invoice status: ${updatedInvoice.status}`);

    // Cleanup
    console.log('Cleaning up payment test data...');
    await crud.deleteClaim('PAY-TEST-001');
    await crud.deleteInvoice('INV-PAY-001');

    console.log('\n🎉 All tests completed successfully!');
    console.log('\n📊 Test Summary:');
    console.log('✅ Google Sheets connection');
    console.log('✅ Claims CRUD operations');
    console.log('✅ Invoice CRUD operations');
    console.log('✅ Payment processing');
    console.log('✅ Data cleanup');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error('Stack:', error.stack);
    process.exit(1);
  }
}

// Run the test
testGoogleSheetsComplete().catch(console.error);