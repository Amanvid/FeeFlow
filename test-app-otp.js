require('dotenv').config({ path: '.env.local' });

const API_KEY = process.env.FROG_API_KEY;
const USERNAME = process.env.FROG_USERNAME;

console.log('Testing OTP generation with credentials:');
console.log('API_KEY:', API_KEY ? 'Set' : 'Not set');
console.log('USERNAME:', USERNAME ? 'Set' : 'Not set');

async function testOtp() {
  try {
    const response = await fetch('https://frogapi.wigal.com.gh/api/v3/sms/otp/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'API-KEY': API_KEY,
        'USERNAME': USERNAME,
      },
      body: JSON.stringify({
        number: '233536282694',
        expiry: 5,
        length: 6,
        messagetemplate: 'Your FeeFlow verification code is: %OTPCODE%. It expires in %EXPIRY% minutes.',
        type: 'NUMERIC',
        senderid: 'FeeFlow',
      }),
    });

    const data = await response.json();
    console.log('Response:', data);
    
    if (response.ok && data.status === 'SUCCESS') {
      console.log('✅ OTP generation successful!');
    } else {
      console.log('❌ OTP generation failed:', data.message);
    }
  } catch (error) {
    console.error('Error:', error.message);
  }
}

testOtp();