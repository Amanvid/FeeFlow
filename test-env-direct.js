// Direct test of environment variables and API call
require('dotenv').config({ path: '.env.local' });

const FROG_API_BASE_URL = "https://frogapi.wigal.com.gh/api/v3";
const SENDER_ID = "FeeFlow";

console.log('=== Direct Environment Test ===');
console.log('process.env.FROG_API_KEY:', process.env.FROG_API_KEY ? 'Set' : 'Not set');
console.log('process.env.FROG_USERNAME:', process.env.FROG_USERNAME ? 'Set' : 'Not set');

const API_KEY = process.env.FROG_API_KEY || "$2y$10$6oYYcjc6Ge3/W.P.1Yqk6eHBs0ERVFR6IaBQ2qpYGBnMYp28B3uPe";
const USERNAME = process.env.FROG_USERNAME || "amanvid";

console.log('Final API_KEY length:', API_KEY.length);
console.log('Final USERNAME:', USERNAME);

// Test API call
async function testOtpApi() {
  console.log('\n=== Testing API Call ===');
  const phone = "233501234567";
  
  try {
    const response = await fetch(`${FROG_API_BASE_URL}/sms/otp/generate`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "API-KEY": API_KEY,
        "USERNAME": USERNAME,
      },
      body: JSON.stringify({
        number: phone,
        expiry: 5,
        length: 6,
        messagetemplate: `Your ${SENDER_ID} verification code is: %OTPCODE%. It expires in %EXPIRY% minutes.`,
        type: "NUMERIC",
        senderid: SENDER_ID,
      }),
    });

    const data = await response.json();
    console.log('API Response:', data);
    
    if (response.ok && data.status === "SUCCESS") {
      console.log('✅ API call successful!');
    } else {
      console.log('❌ API call failed:', data.message);
    }
  } catch (error) {
    console.error('❌ API call error:', error.message);
  }
}

testOtpApi();