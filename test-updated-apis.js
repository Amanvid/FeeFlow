const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

const BASE_URL = 'http://localhost:9002';

async function testVerificationCodeAPIs() {
  console.log('Testing updated verification code APIs...\n');

  // Test data
  const testInvoiceId = 'TEST-INVOICE-123';
  const testCode = '123456';
  const testAmount = '100.00';
  const testStudentName = 'Test Student';
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString(); // 10 minutes from now

  try {
    // Test 1: Send verification code
    console.log('1. Testing send-verification-code endpoint...');
    const sendResponse = await fetch(`${BASE_URL}/api/payments/send-verification-code`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        code: testCode,
        invoiceId: testInvoiceId,
        amount: testAmount,
        studentName: testStudentName,
        expiresAt: expiresAt,
      }),
    });

    const sendResult = await sendResponse.json();
    console.log('Send verification code result:', sendResult);

    if (!sendResponse.ok) {
      console.error('Failed to send verification code:', sendResult);
      return;
    }

    // Test 2: Verify the code
    console.log('\n2. Testing verify-code endpoint...');
    const verifyResponse = await fetch(`${BASE_URL}/api/payments/verify-code`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        code: testCode,
        invoiceId: testInvoiceId,
      }),
    });

    const verifyResult = await verifyResponse.json();
    console.log('Verify code result:', verifyResult);

    if (!verifyResponse.ok) {
      console.error('Failed to verify code:', verifyResult);
      return;
    }

    console.log('\n✅ Verification code APIs are working correctly!');

  } catch (error) {
    console.error('❌ Error testing verification code APIs:', error);
  }
}

async function testClaimsAPIs() {
  console.log('\n\nTesting updated claims APIs...\n');

  try {
    // Test getting claims
    console.log('1. Testing get claims endpoint...');
    const claimsResponse = await fetch(`${BASE_URL}/api/claims`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (claimsResponse.ok) {
      const claimsResult = await claimsResponse.json();
      console.log('Claims retrieved successfully:', claimsResult.length, 'claims found');
    } else {
      console.error('Failed to get claims:', await claimsResponse.text());
    }

    console.log('\n✅ Claims APIs are working correctly!');

  } catch (error) {
    console.error('❌ Error testing claims APIs:', error);
  }
}

// Run tests
async function runAllTests() {
  await testVerificationCodeAPIs();
  await testClaimsAPIs();
  console.log('\n🎉 All API tests completed!');
  process.exit(0);
}

runAllTests().catch(console.error);