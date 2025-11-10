// Test script to verify mobile API connection to Vercel
const axios = require('axios');

async function testMobileAPI() {
  const API_BASE_URL = "https://fee-flow-five.vercel.app/api";
  
  console.log('Testing mobile API connection to Vercel...');
  
  try {
    // Test 1: Send OTP with email
    console.log('\n1. Testing send-otp with email...');
    const sendOtpResponse = await axios.post(`${API_BASE_URL}/auth/send-otp`, {
      phone: 'test@example.com'
    });
    console.log('Send OTP Response:', sendOtpResponse.data);
    
    // Test 2: Check if mobile login endpoint exists
    console.log('\n2. Testing mobile login endpoint...');
    const mobileLoginResponse = await axios.post(`${API_BASE_URL}/auth/mobile/login`, {
      username: 'testuser',
      password: 'testpass'
    }).catch(err => {
      console.log('Mobile login error (expected):', err.response?.data || err.message);
    });
    
    // Test 3: Check if mobile register endpoint exists
    console.log('\n3. Testing mobile register endpoint...');
    const mobileRegisterResponse = await axios.post(`${API_BASE_URL}/auth/mobile/register`, {
      username: 'testuser',
      email: 'test@example.com',
      password: 'testpass',
      childName: 'Test Child',
      childClass: 'P1'
    }).catch(err => {
      console.log('Mobile register error (expected):', err.response?.data || err.message);
    });
    
    console.log('\n✅ API connection test completed!');
    
  } catch (error) {
    console.error('❌ API connection failed:', error.message);
    if (error.response) {
      console.error('Response data:', error.response.data);
      console.error('Response status:', error.response.status);
    }
  }
}

testMobileAPI();