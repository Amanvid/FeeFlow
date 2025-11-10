// Test OTP verification flow with expected response format
const axios = require('axios');

async function testOtpFlow() {
  const API_BASE_URL = "https://fee-flow-five.vercel.app/api";
  
  console.log('Testing OTP verification flow...');
  
  try {
    // Step 1: Send OTP
    console.log('\n1. Sending OTP to test email...');
    const sendOtpResponse = await axios.post(`${API_BASE_URL}/auth/send-otp`, {
      phone: 'test@example.com'
    });
    console.log('Send OTP Response:', JSON.stringify(sendOtpResponse.data, null, 2));
    
    // Step 2: Verify OTP (with test data)
    console.log('\n2. Verifying OTP...');
    const verifyOtpResponse = await axios.post(`${API_BASE_URL}/auth/verify-otp`, {
      phone: 'test@example.com',
      otp: '123456', // This will likely fail, but we want to see the response format
      username: 'SuperAdmin'
    });
    console.log('Verify OTP Response:', JSON.stringify(verifyOtpResponse.data, null, 2));
    
  } catch (error) {
    if (error.response) {
      console.log('Error Response:', JSON.stringify(error.response.data, null, 2));
      console.log('Status Code:', error.response.status);
    } else {
      console.error('Request Error:', error.message);
    }
  }
}

testOtpFlow();