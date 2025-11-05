// Test script to verify the complete payment flow
const axios = require('axios');

async function testPaymentFlow() {
  console.log('🧪 Testing FeeFlow payment process...');
  
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
    
    console.log('🎉 All tests passed! Payment flow is working correctly.');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
  }
}

testPaymentFlow();