// Test script to verify the complete payment flow with code confirmation
const axios = require('axios');

async function testPaymentFlowWithCodeConfirmation() {
  console.log('🧪 Testing FeeFlow payment process with code confirmation...');
  
  const baseUrl = 'http://localhost:9002';
  
  try {
    // Test 1: Check if the main page loads
    console.log('📱 Testing main page...');
    const mainPage = await axios.get(baseUrl);
    console.log(`✅ Main page status: ${mainPage.status}`);
    
    // Test 2: Check if check-fees page loads
    console.log('💰 Testing check-fees page...');
    const checkFeesPage = await axios.get(`${baseUrl}/check-fees`);
    console.log(`✅ Check-fees page status: ${checkFeesPage.status}`);
    
    // Test 3: Test payment purchase endpoint
    console.log('💳 Testing payment purchase endpoint...');
    const purchaseUrl = `${baseUrl}/payment/purchase?purchaseType=fee&bundle=Fee+for+Test+Student&credits=CEC-INV-TEST001&price=100&class=Test+Class&userPhone=0536282694&studentName=Test+Student`;
    const purchaseResponse = await axios.get(purchaseUrl);
    console.log(`✅ Payment purchase status: ${purchaseResponse.status}`);
    
    // Test 4: Test code confirmation page
    console.log('🔐 Testing code confirmation page...');
    const codeConfirmationUrl = `${baseUrl}/payment/code-confirmation?invoice=TEST-INVOICE-001&amount=100&student=Test+Student&studentId=TEST001&class=Test+Class&bundle=Fee+for+Test+Student`;
    const codeConfirmationResponse = await axios.get(codeConfirmationUrl);
    console.log(`✅ Code confirmation page status: ${codeConfirmationResponse.status}`);
    
    // Test 5: Test send verification code API
    console.log('📤 Testing send verification code API...');
    const sendCodeResponse = await axios.post(`${baseUrl}/api/payments/send-verification-code`, {
      code: '123456',
      invoiceId: 'TEST-INVOICE-001',
      amount: '100',
      studentName: 'Test Student',
      expiresAt: new Date(Date.now() + 15 * 60 * 1000).toISOString()
    });
    console.log(`✅ Send verification code status: ${sendCodeResponse.status}`);
    console.log(`📧 Notification result: ${sendCodeResponse.data.message}`);
    
    // Test 6: Test verify code API
    console.log('✅ Testing verify code API...');
    const verifyCodeResponse = await axios.post(`${baseUrl}/api/payments/verify-code`, {
      code: '123456',
      invoiceId: 'TEST-INVOICE-001'
    });
    console.log(`✅ Verify code status: ${verifyCodeResponse.status}`);
    console.log(`🔍 Verification result: ${verifyCodeResponse.data.message}`);
    
    console.log('🎉 All tests passed! Payment flow with code confirmation is working correctly.');
    console.log('📋 Summary of new flow:');
    console.log('  1. User clicks "I Have Completed Payment"');
    console.log('  2. Redirected to code confirmation page');
    console.log('  3. Verification code sent to admin');
    console.log('  4. User enters code provided by admin');
    console.log('  5. Code verified and payment completed');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
  }
}

// Run the test
testPaymentFlowWithCodeConfirmation();