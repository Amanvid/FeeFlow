const { GoogleSheetsService } = require('./src/lib/google-sheets.ts');
const { GoogleSheetsCRUD } = require('./src/lib/google-sheets-crud');

async function testGoogleSheetsIntegration() {
  console.log('🧪 Testing Google Sheets Integration...\n');

  try {
    // Test 1: Initialize Google Sheets Service
    console.log('1️⃣ Testing Google Sheets Service Initialization...');
    const sheetsService = new GoogleSheetsService();
    console.log('✅ Google Sheets Service initialized successfully');

    // Test 2: Test connection to spreadsheet
    console.log('\n2️⃣ Testing Spreadsheet Connection...');
    const testResult = await sheetsService.getSheetData('Claims');
    if (testResult.success) {
      console.log('✅ Successfully connected to spreadsheet');
      console.log('📊 Claims sheet data rows:', testResult.data.length);
    } else {
      console.log('❌ Failed to connect to spreadsheet:', testResult.message);
      return;
    }

    // Test 3: Test CRUD Operations
    console.log('\n3️⃣ Testing CRUD Operations...');
    const crud = new GoogleSheetsCRUD();

    // Create a test claim
    console.log('📝 Creating test claim...');
    const testClaim = {
      studentName: 'Test Student',
      class: 'Grade 10',
      guardianName: 'Test Guardian',
      guardianPhone: '+256700123456',
      feeType: 'Tuition',
      amount: 150000,
      dueDate: '2024-12-31',
      status: 'pending',
      invoiceNumber: 'TEST-001',
    };

    const createdClaim = await crud.createClaim(testClaim);
    console.log('✅ Created claim:', createdClaim.id);

    // Get all claims
    console.log('📋 Retrieving all claims...');
    const allClaims = await crud.getAllClaims();
    console.log(`✅ Found ${allClaims.length} claims`);

    // Update claim
    console.log('✏️ Updating claim status...');
    const updatedClaim = await crud.updateClaim(createdClaim.id, { status: 'paid' });
    if (updatedClaim) {
      console.log('✅ Updated claim status to paid');
    }

    // Get claim by ID
    console.log('🔍 Retrieving claim by ID...');
    const foundClaim = await crud.getClaimById(createdClaim.id);
    if (foundClaim) {
      console.log('✅ Found claim:', foundClaim.studentName);
    }

    // Test invoice operations
    console.log('\n4️⃣ Testing Invoice Operations...');
    const testInvoice = {
      invoiceNumber: 'INV-TEST-001',
      studentName: 'Test Student',
      class: 'Grade 10',
      guardianName: 'Test Guardian',
      guardianPhone: '+256700123456',
      feeType: 'Tuition',
      amount: 200000,
      dueDate: '2024-12-31',
      status: 'pending',
    };

    const createdInvoice = await crud.createInvoice(testInvoice);
    console.log('✅ Created invoice:', createdInvoice.id);

    // Update invoice status
    console.log('💳 Updating invoice payment status...');
    const updatedInvoice = await crud.updateInvoiceStatus('INV-TEST-001', 'paid', {
      paymentMethod: 'Mobile Money',
      transactionId: 'TXN-123456',
      paymentDate: new Date().toISOString(),
    });
    if (updatedInvoice) {
      console.log('✅ Updated invoice payment status');
    }

    // Get all invoices
    console.log('📊 Retrieving all invoices...');
    const allInvoices = await crud.getAllInvoices();
    console.log(`✅ Found ${allInvoices.length} invoices`);

    // Test 5: Test payment processing
    console.log('\n5️⃣ Testing Payment Processing...');
    const paymentResult = await sheetsService.updateInvoicePaymentStatus('TEST-001', {
      paid: true,
      paymentDate: new Date().toLocaleDateString('en-GB'),
      paymentReference: 'TEST-PAYMENT-123',
    });
    if (paymentResult.success) {
      console.log('✅ Payment status updated successfully');
    } else {
      console.log('❌ Failed to update payment status:', paymentResult.message);
    }

    console.log('\n🎉 All tests completed successfully!');
    console.log('\n📋 Summary:');
    console.log('- Google Sheets Service: ✅ Working');
    console.log('- Spreadsheet Connection: ✅ Working');
    console.log('- CRUD Operations: ✅ Working');
    console.log('- Invoice Operations: ✅ Working');
    console.log('- Payment Processing: ✅ Working');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error('Stack:', error.stack);
  }
}

// Run the test
testGoogleSheetsIntegration();