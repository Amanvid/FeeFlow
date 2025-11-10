// Test script to verify invoice mapping fix
require('dotenv').config({ path: '.env.local' });

async function testInvoiceMappingFix() {
  console.log('🧪 Testing Invoice Mapping Fix...\n');
  
  try {
    // Test the create-invoice API with proper data structure
    console.log('1. Testing create-invoice API with proper mapping...');
    
    const testInvoiceData = {
      amount: 420,
      description: 'Paying the fee for Fee for Jeffery Frimpong',
      reference: 'CEC-INV--0002',
      guardianName: 'Afua Ama',
      guardianPhone: '536282694',
      relationship: 'Father',
      studentName: 'Jeffery Frimpong',
      class: 'BS 5',
      dueDate: '7 Nov. 2025'
    };

    const createResponse = await fetch('http://localhost:9002/api/create-invoice', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testInvoiceData)
    });

    if (createResponse.ok) {
      const createdInvoice = await createResponse.json();
      console.log('✅ Create invoice successful:');
      console.log('  Invoice ID:', createdInvoice.id);
      console.log('  Amount:', createdInvoice.amount);
      console.log('  Reference:', createdInvoice.reference);
      console.log('  Status:', createdInvoice.status);
    } else {
      const error = await createResponse.json();
      console.log('❌ Create invoice failed:', error.error, error.details);
    }

    console.log('\n2. Testing invoice-status API to verify mapping...');
    
    const statusResponse = await fetch('http://localhost:9002/api/invoice-status');
    if (statusResponse.ok) {
      const invoices = await statusResponse.json();
      console.log('✅ Retrieved', invoices.length, 'invoices');
      
      if (invoices.length > 0) {
        const latestInvoice = invoices[invoices.length - 1];
        console.log('Latest invoice mapping:');
        console.log('  ID:', latestInvoice.id);
        console.log('  Amount:', latestInvoice.amount);
        console.log('  Status:', latestInvoice.status);
        console.log('  Guardian Name:', latestInvoice.guardianName);
        console.log('  Student Name:', latestInvoice.studentName);
        console.log('  Student Class:', latestInvoice.studentClass);
        console.log('  Due Date:', latestInvoice.dueDate);
        console.log('  Reference:', latestInvoice.reference);
      }
    } else {
      console.log('❌ Failed to retrieve invoices');
    }

    console.log('\n3. Testing finalize-purchase API mapping...');
    
    const finalizeResponse = await fetch('http://localhost:9002/api/finalize-purchase', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        phone: '536282694',
        otp: '123456', // This will fail OTP validation but we can see the mapping
        invoiceId: 'CEC-INV--0002',
        purchaseType: 'fee',
        bundleName: 'Fee Payment',
        bundlePrice: 420,
        bundleCredits: 'CEC-INV--0002',
        studentName: 'Jeffery Frimpong'
      })
    });

    if (finalizeResponse.ok) {
      console.log('✅ Finalize purchase successful');
    } else {
      const error = await finalizeResponse.json();
      console.log('❌ Finalize purchase failed (expected due to OTP):', error.error);
    }

  } catch (error) {
    console.error('❌ Test failed:', error);
  }
  
  console.log('\n🎯 Test completed!');
}

// Run the test
testInvoiceMappingFix();