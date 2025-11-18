// Test script for verification code APIs
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

async function testVerificationAPIs() {
  console.log('🧪 Testing verification code APIs...\n');
  
  try {
    // Test 1: Send verification code
    console.log('1️⃣ Testing send-verification-code endpoint...');
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString(); // 10 minutes from now
    const sendResponse = await fetch('http://localhost:9002/api/payments/send-verification-code', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        code: '654321',
        invoiceId: 'TEST-INVOICE-FINAL',
        studentName: 'Final Test Student',
        amount: 150.00,
        expiresAt: expiresAt
      })
    });
    
    if (sendResponse.ok) {
      const sendData = await sendResponse.json();
      console.log('✅ Send verification code successful:', sendData);
      
      // Test 2: Verify the code
      console.log('\n2️⃣ Testing verify-code endpoint...');
      const verifyResponse = await fetch('http://localhost:9002/api/payments/verify-code', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          invoiceId: 'TEST-INVOICE-FINAL',
          code: '654321' // Use the same code from the send request
        })
      });
      
      if (verifyResponse.ok) {
        const verifyData = await verifyResponse.json();
        console.log('✅ Verify code successful:', verifyData);
        
        // Test 3: Get claims
        console.log('\n3️⃣ Testing claims endpoint...');
        const claimsResponse = await fetch('http://localhost:9002/api/claims');
        
        if (claimsResponse.ok) {
          const claimsData = await claimsResponse.json();
          console.log('✅ Claims API working, found', claimsData.length, 'claims');
          console.log('\n🎉 All APIs working successfully!');
        } else {
          console.log('❌ Claims API failed:', claimsResponse.status);
        }
      } else {
        console.log('❌ Verify code failed:', verifyResponse.status);
      }
    } else {
      console.log('❌ Send verification code failed:', sendResponse.status);
    }
    
  } catch (error) {
    console.error('❌ Error during testing:', error.message);
  }
}

testVerificationAPIs();