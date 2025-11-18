require('dotenv').config({ path: '.env.local' });

const { googleSheetsService } = require('./src/lib/google-sheets.ts');

async function testMappingFix() {
  console.log('Testing Google Sheets mapping fixes...');
  
  try {
    // Test 1: Get invoices and check mapping
    console.log('\n1. Testing getInvoices() mapping...');
    const invoicesResult = await googleSheetsService.getInvoices();
    
    if (invoicesResult.success && invoicesResult.data.length > 0) {
      const firstInvoice = invoicesResult.data[0];
      console.log('First invoice mapping:');
      console.log('  ID:', firstInvoice.id);
      console.log('  Amount:', firstInvoice.amount);
      console.log('  Status:', firstInvoice.status);
      console.log('  Created At:', firstInvoice.createdAt);
      console.log('  Updated At:', firstInvoice.updatedAt);
      console.log('  Guardian Name:', firstInvoice.guardianName);
      console.log('  Student Name:', firstInvoice.studentName);
      console.log('  Student Class:', firstInvoice.studentClass);
      console.log('  Due Date:', firstInvoice.dueDate);
      console.log('  Reference:', firstInvoice.reference);
      
      // Test 2: Update an invoice status
      console.log('\n2. Testing updateInvoicePaymentStatus()...');
      const updateResult = await googleSheetsService.updateInvoicePaymentStatus(
        firstInvoice.id,
        {
          paid: true,
          paymentDate: new Date().toISOString(),
          paymentReference: 'TEST-PAYMENT-123'
        }
      );
      
      console.log('Update result:', updateResult);
      
      // Test 3: Update invoice using updateInvoice method
      console.log('\n3. Testing updateInvoice() method...');
      const invoiceUpdateResult = await googleSheetsService.updateInvoice(
        firstInvoice.id,
        {
          status: 'PAID',
          amount: firstInvoice.amount,
          updatedAt: new Date().toISOString(),
          reference: 'TEST-INVOICE-UPDATE-123'
        }
      );
      
      console.log('Invoice update result:', invoiceUpdateResult);
      
    } else {
      console.log('No invoices found or error:', invoicesResult.message);
    }
    
  } catch (error) {
    console.error('Test failed:', error);
  }
}

testMappingFix();