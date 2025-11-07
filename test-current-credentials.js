require('dotenv').config({ path: '.env.local' });

const API_KEY = process.env.FROG_API_KEY;
const USERNAME = process.env.FROG_USERNAME;
const SENDER_ID = "FeeFlow";

console.log('Testing current credentials:');
console.log('API_KEY length:', API_KEY.length);
console.log('API_KEY:', API_KEY);
console.log('USERNAME:', USERNAME);

async function testOtp() {
  const requestBody = {
    number: "233501234567",
    expiry: 5,
    length: 6,
    messagetemplate: `Your ${SENDER_ID} verification code is: %OTPCODE%. It expires in %EXPIRY% minutes.`,
    type: "NUMERIC",
    senderid: SENDER_ID,
  };

  console.log('\nRequest body:', JSON.stringify(requestBody, null, 2));

  try {
    const response = await fetch("https://frogapi.wigal.com.gh/api/v3/sms/otp/generate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "API-KEY": API_KEY,
        "USERNAME": USERNAME,
      },
      body: JSON.stringify(requestBody),
    });

    console.log('\nResponse status:', response.status);
    const data = await response.json();
    console.log('Response data:', data);

    if (response.ok && data.status === "SUCCESS") {
      console.log('\n✅ OTP API call successful!');
    } else {
      console.log('\n❌ OTP API call failed');
    }
  } catch (error) {
    console.error('\n❌ Error:', error.message);
  }
}

testOtp();