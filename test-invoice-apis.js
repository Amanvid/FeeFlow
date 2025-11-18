require('dotenv').config({ path: '.env' });

async function testInvoiceAPIs() {
  console.log('Testing invoice API routes...');
  
  try {
    // Test create invoice
    console.log('\n1. Testing create invoice...');
    const createResponse = await fetch('http://localhost:3000/api/create-invoice', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        amount: 100,
        currency: 'GHS',
        description: 'Test invoice',
        customerName: 'Test Customer',
        customerPhone: '0536282694',
        customerEmail: 'test@example.com'
      })
    });
    
    const createData = await createResponse.json();
    console.log('Create invoice response:', createData);
    
    if (createData.success && createData.invoiceId) {
      // Test invoice status
      console.log('\n2. Testing invoice status...');
      const statusResponse = await fetch(`http://localhost:3000/api/invoice-status?id=${createData.invoiceId}`);
      const statusData = await statusResponse.json();
      console.log('Invoice status response:', statusData);
      
      // Test finalize purchase
      console.log('\n3. Testing finalize purchase...');
      const finalizeResponse = await fetch('http://localhost:3000/api/finalize-purchase', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          phone: '0536282694',
          otp: '123456', // This will fail but we just want to test the API structure
          invoiceId: createData.invoiceId,
          purchaseType: 'test',
          bundleName: 'Test Bundle',
          bundlePrice: 100,
          bundleCredits: 10
        })
      });
      
      const finalizeData = await finalizeResponse.json();
      console.log('Finalize purchase response:', finalizeData);
    }
    
  } catch (error) {
    console.error('Error testing APIs:', error);
  }
}

// Run the test
testInvoiceAPIs();